// Shared skip-trace engine — used by both the synchronous chunk endpoint
// (/api/skiptrace action:'chunk') and the QStash background worker (/api/process).

const RAPID_HOST = 'skip-tracing-working-api.p.rapidapi.com';
const RAPIDAPI_KEY_FALLBACK = '2de62f0d4amsh2b0e7594ee9669cp151485jsn485c24390d66';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const needsRetry = (phone: string) =>
  ['Not Found', 'No match found', 'Lookup Error'].includes(phone);

// A record is billable only if a real phone OR a real email was found.
export function isBillable(r: any): boolean {
  const phone = r['Primary Phone'];
  const email = r['Email'];
  const phoneGood = !!phone && !needsRetry(phone) && !String(phone).startsWith('Skipped');
  const emailGood = !!email && email !== 'Not Found' && email !== 'N/A';
  return phoneGood || emailGood;
}

async function readEnv(name: string): Promise<string | undefined> {
  if (typeof process !== 'undefined' && process.env && process.env[name]) return process.env[name];
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const env = (getRequestContext().env as any) || {};
    if (env[name]) return env[name];
  } catch {}
  return undefined;
}

export async function readRapidApiKey(): Promise<string> {
  return (await readEnv('RAPIDAPI_KEY')) || RAPIDAPI_KEY_FALLBACK;
}
export async function readResendKey(): Promise<string | undefined> {
  return await readEnv('RESEND_API_KEY');
}
export async function readQStashToken(): Promise<string | undefined> {
  return await readEnv('QSTASH_TOKEN');
}
export async function readProcessSecret(): Promise<string> {
  return (await readEnv('QSTASH_PROCESS_SECRET')) || 'propytrace-internal-process-secret-v1';
}
export async function readAppUrl(): Promise<string> {
  return (await readEnv('NEXT_PUBLIC_APP_URL')) || 'https://skiptrace-saas.pages.dev';
}

// Fetch wrapper with exponential backoff on 429.
async function fetchWithBackoff(url: string, opts: RequestInit, maxRetries = 3): Promise<Response> {
  let delay = 500;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, opts);
    if (res.status !== 429 || attempt >= maxRetries) return res;
    await sleep(delay);
    delay *= 2;
  }
}

async function searchByName(
  fullName: string, cityStateZip: string, street: string, apiKey: string
): Promise<{ personId: string | null; matchedName: string }> {
  let searchUrl = `https://${RAPID_HOST}/search/bynameaddress?name=${encodeURIComponent(fullName)}&citystatezip=${encodeURIComponent(cityStateZip)}&page=1`;
  if (street) searchUrl += `&street=${encodeURIComponent(street)}`;

  const res = await fetchWithBackoff(searchUrl, {
    method: 'GET', headers: { 'x-rapidapi-host': RAPID_HOST, 'x-rapidapi-key': apiKey },
  });
  if (!res.ok) {
    console.error(`[engine] search ${res.status} for "${fullName}"`);
    throw new Error(`Search API ${res.status}`);
  }
  const json = await res.json();
  if (json.PeopleDetails?.length > 0) {
    return { personId: json.PeopleDetails[0]['Person ID'] ?? null, matchedName: json.PeopleDetails[0].Name || fullName };
  }
  return { personId: null, matchedName: fullName };
}

// Address-only search: returns the first person associated with an address.
async function searchByAddress(
  street: string, cityStateZip: string, apiKey: string
): Promise<{ personId: string | null; matchedName: string }> {
  const url = `https://${RAPID_HOST}/search/byaddress?street=${encodeURIComponent(street)}&citystatezip=${encodeURIComponent(cityStateZip)}`;
  const res = await fetchWithBackoff(url, {
    method: 'GET', headers: { 'x-rapidapi-host': RAPID_HOST, 'x-rapidapi-key': apiKey },
  });
  if (!res.ok) {
    console.error(`[engine] address search ${res.status} for "${street}"`);
    throw new Error(`Address API ${res.status}`);
  }
  const json = await res.json();
  if (json.PeopleDetails?.length > 0) {
    return { personId: json.PeopleDetails[0]['Person ID'] ?? null, matchedName: json.PeopleDetails[0].Name || '' };
  }
  return { personId: null, matchedName: '' };
}

// Details endpoint is eventually-consistent — retry on the flaky "peo_id Not Valid".
async function getPersonDetails(personId: string, apiKey: string, maxTries = 4): Promise<any | null> {
  let delay = 400;
  for (let i = 0; i < maxTries; i++) {
    const res = await fetchWithBackoff(
      `https://${RAPID_HOST}/search/detailsbyID?peo_id=${encodeURIComponent(personId)}`,
      { method: 'GET', headers: { 'x-rapidapi-host': RAPID_HOST, 'x-rapidapi-key': apiKey } }
    );
    if (res.ok) {
      const json = await res.json();
      const hasData =
        (Array.isArray(json['Person Details']) && json['Person Details'].length > 0) ||
        (Array.isArray(json['All Phone Details']) && json['All Phone Details'].length > 0) ||
        (Array.isArray(json['Email Addresses']) && json['Email Addresses'].length > 0);
      if (hasData) return json;
    } else {
      console.error(`[engine] details ${res.status} for ${personId}`);
    }
    await sleep(delay);
    delay = Math.round(delay * 1.8);
  }
  return null;
}

export function buildLookup(columnMap: any, apiKey: string) {
  const addressOnly = columnMap._mode === 'address';
  return async (row: any) => {
    const firstName = row[columnMap.firstName] || '';
    const lastName  = row[columnMap.lastName]  || '';
    const street = row[columnMap.street] || row[columnMap.mailingStreet] || '';
    const city   = row[columnMap.city]   || row[columnMap.mailingCity]   || '';
    const state  = row[columnMap.state]  || row[columnMap.mailingState]  || '';
    const zip    = row[columnMap.zip]    || row[columnMap.mailingZip]    || '';

    const base = {
      _firstName: firstName, _lastName: lastName,
      _street: row[columnMap.street] || '', _city: city, _state: state, _zip: row[columnMap.zip] || '',
      _mailingStreet: row[columnMap.mailingStreet] || '', _mailingCity: row[columnMap.mailingCity] || '',
      _mailingState: row[columnMap.mailingState] || '', _mailingZip: row[columnMap.mailingZip] || '',
    };

    // Validation differs by mode.
    if (addressOnly) {
      if (!street || !city || !state) {
        return { ...base, _ownerName: '', Skip_Trace_Phone: 'Skipped: Missing Address/City/State',
          _phone2: '', _phone3: '', _phone4: '', _email: 'N/A', _matchedName: 'N/A' };
      }
    } else if (!firstName || !lastName || !city || !state) {
      return { ...base, _ownerName: `${firstName} ${lastName}`.trim(),
        Skip_Trace_Phone: 'Skipped: Missing Name/City/State',
        _phone2: '', _phone3: '', _phone4: '', _email: 'N/A', _matchedName: 'N/A' };
    }

    const fullName     = `${firstName} ${lastName}`.trim();
    const cityStateZip = `${city} ${state} ${zip}`.trim();
    let phone1 = 'Not Found', phone2 = '', phone3 = '', phone4 = '';
    let foundEmail = 'Not Found', matchedName = fullName;
    let ownerName = fullName;

    try {
      let personId: string | null = null;

      if (addressOnly) {
        const r = await searchByAddress(street, cityStateZip, apiKey);
        personId = r.personId;
        matchedName = r.matchedName || '';
        ownerName = r.matchedName || '';   // owner discovered from the address
      } else {
        const r = await searchByName(fullName, cityStateZip, street, apiKey);
        personId = r.personId; matchedName = r.matchedName;
        if (!personId && street) {
          const fb = await searchByName(fullName, cityStateZip, '', apiKey);
          personId = fb.personId; matchedName = fb.matchedName;
        }
      }

      if (personId) {
        const profileJson = await getPersonDetails(personId, apiKey);
        if (profileJson) {
          const allPhones: string[] = [];
          const primaryTel = profileJson['Person Details']?.[0]?.Telephone?.trim?.();
          if (primaryTel) allPhones.push(primaryTel);
          if (profileJson['All Phone Details']?.length > 0) {
            for (const p of profileJson['All Phone Details']) {
              const ph = (typeof p === 'string' ? p : (p['Phone Number'] || p.Phone || p.Telephone))?.trim?.();
              if (ph && !allPhones.includes(ph)) allPhones.push(ph);
            }
          }
          if (allPhones.length > 0) { phone1 = allPhones[0]; phone2 = allPhones[1] || ''; phone3 = allPhones[2] || ''; phone4 = allPhones[3] || ''; }
          const emails = profileJson['Email Addresses'];
          if (emails?.length > 0) {
            foundEmail = emails.map((e: any) => typeof e === 'string' ? e : (e.Email || e.email || JSON.stringify(e))).join(', ');
          }
        }
      } else {
        phone1 = 'No match found';
      }
    } catch {
      phone1 = 'Lookup Error';
    }

    return {
      _firstName: firstName, _lastName: lastName,
      _street: row[columnMap.street] || '', _city: row[columnMap.city] || '',
      _state: row[columnMap.state] || '', _zip: row[columnMap.zip] || '',
      _mailingStreet: row[columnMap.mailingStreet] || '', _mailingCity: row[columnMap.mailingCity] || '',
      _mailingState: row[columnMap.mailingState] || '', _mailingZip: row[columnMap.mailingZip] || '',
      Skip_Trace_Phone: phone1, _phone2: phone2, _phone3: phone3, _phone4: phone4,
      _email: foundEmail, _matchedName: matchedName, _ownerName: ownerName,
    };
  };
}

export function cleanResult(r: any) {
  const ownerName = (r._ownerName || `${r._firstName} ${r._lastName}`).trim();
  return {
    'Owner Full Name': ownerName,
    'Property Address': r._street, 'Property City': r._city, 'Property State': r._state, 'Property Zip': r._zip,
    'Mailing Address': r._mailingStreet, 'Mailing City': r._mailingCity, 'Mailing State': r._mailingState, 'Mailing Zip': r._mailingZip,
    'Primary Phone': r.Skip_Trace_Phone, 'Phone 2': r._phone2, 'Phone 3': r._phone3, 'Phone 4': r._phone4,
    'Email': r._email, 'Matched Name': r._matchedName,
  };
}

async function processWithConcurrency(items: any[], handler: (i: any) => Promise<any>, concurrency: number, delayMs: number): Promise<any[]> {
  const results: any[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    results.push(...await Promise.all(batch.map(handler)));
    if (i + concurrency < items.length) await sleep(delayMs);
  }
  return results;
}

const PASS_CONFIG = [
  { concurrency: 8, batchDelay: 100, preDelay: 0 },
  { concurrency: 5, batchDelay: 200, preDelay: 500 },
  { concurrency: 3, batchDelay: 300, preDelay: 800 },
];

// Process one chunk of raw rows → clean results (with waterfall + retry passes).
export async function processChunk(records: any[], columnMap: any, apiKey: string): Promise<any[]> {
  const lookup = buildLookup(columnMap, apiKey);
  let results = await processWithConcurrency(records, lookup, PASS_CONFIG[0].concurrency, PASS_CONFIG[0].batchDelay);

  for (let pass = 1; pass < PASS_CONFIG.length; pass++) {
    const retryIdx = results.map((r, i) => needsRetry(r.Skip_Trace_Phone) ? i : -1).filter(i => i !== -1);
    if (retryIdx.length === 0) break;
    const cfg = PASS_CONFIG[pass];
    await sleep(cfg.preDelay);
    const retryRows = retryIdx.map(i => records[i]);
    const retryResults = await processWithConcurrency(retryRows, lookup, cfg.concurrency, cfg.batchDelay);
    retryIdx.forEach((orig, k) => { if (!needsRetry(retryResults[k].Skip_Trace_Phone)) results[orig] = retryResults[k]; });
  }
  return results.map(cleanResult);
}

export const CHUNK_SIZE = 25;

// Publish a QStash message that will POST {jobId, secret} to /api/process.
export async function enqueueProcess(jobId: string, delaySeconds = 0): Promise<boolean> {
  const token = await readQStashToken();
  if (!token) return false;
  const secret = await readProcessSecret();
  const appUrl = await readAppUrl();
  const dest = `${appUrl}/api/process`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (delaySeconds > 0) headers['Upstash-Delay'] = `${delaySeconds}s`;
  const res = await fetch(`https://qstash.upstash.io/v2/publish/${dest}`, {
    method: 'POST', headers, body: JSON.stringify({ jobId, secret }),
  });
  if (!res.ok) {
    console.error(`[engine] QStash publish failed ${res.status}: ${await res.text().catch(() => '')}`);
    return false;
  }
  return true;
}

export async function sendCompletionEmail(
  userEmail: string, fileName: string | undefined, totalRecords: number, successfulHits: number
) {
  const resendKey = await readResendKey();
  if (!resendKey || !userEmail) return;
  const appUrl = await readAppUrl();
  const hitRate = totalRecords > 0 ? Math.round((successfulHits / totalRecords) * 100) : 0;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'PropyTrace <onboarding@resend.dev>',
      to: userEmail,
      subject: `✅ Skip trace complete — ${successfulHits.toLocaleString()} contacts found`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#020c1b;color:#f0f6ff;padding:32px;border-radius:12px;">
          <div style="margin-bottom:24px;"><span style="background:#059669;color:white;font-weight:900;font-size:18px;padding:6px 14px;border-radius:8px;">PropyTrace</span></div>
          <h2 style="font-size:24px;font-weight:900;margin:0 0 8px;">Your skip trace is done! 🎯</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:16px 0 24px;">
            <div style="background:#041225;border:1px solid #0e2d52;border-radius:10px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:900;color:#fff;">${totalRecords.toLocaleString()}</div><div style="font-size:12px;color:#6b90b5;">Records</div></div>
            <div style="background:#041225;border:1px solid #0e2d52;border-radius:10px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:900;color:#34d399;">${successfulHits.toLocaleString()}</div><div style="font-size:12px;color:#6b90b5;">Contacts Found</div></div>
            <div style="background:#041225;border:1px solid #0e2d52;border-radius:10px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:900;color:#6ee7b7;">${hitRate}%</div><div style="font-size:12px;color:#6b90b5;">Hit Rate</div></div>
          </div>
          <p style="color:#6b90b5;font-size:13px;">File: <strong style="color:#f0f6ff;">${fileName || 'Your list'}</strong></p>
          <a href="${appUrl}" style="display:inline-block;margin-top:12px;background:#059669;color:white;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;">Download Results →</a>
        </div>`,
    }),
  }).catch(() => {});
}
