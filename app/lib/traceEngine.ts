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

// ── Token-bucket rate limiter ───────────────────────────────────────────────
// Plan allows 50 req/s; we pace at ~45 to stay safely under. Shared across all
// concurrent lookups in a chunk so we use the full budget without 429s.
const RATE_PER_SEC = 45;
let tokens = RATE_PER_SEC;
let lastRefill = Date.now();
async function acquireToken(): Promise<void> {
  for (;;) {
    const now = Date.now();
    tokens = Math.min(RATE_PER_SEC, tokens + ((now - lastRefill) / 1000) * RATE_PER_SEC);
    lastRefill = now;
    if (tokens >= 1) { tokens -= 1; return; }
    await sleep(Math.ceil((1 - tokens) / RATE_PER_SEC * 1000));
  }
}

// Fetch wrapper: rate-limited + exponential backoff on 429.
async function fetchWithBackoff(url: string, opts: RequestInit, maxRetries = 4): Promise<Response> {
  let delay = 500;
  for (let attempt = 0; ; attempt++) {
    await acquireToken();
    const res = await fetch(url, opts);
    if (res.status !== 429 || attempt >= maxRetries) return res;
    await sleep(delay);
    delay *= 2;
  }
}

type Candidate = { personId: string; name: string; livesIn: string; usedToLive: string };

// How many candidate people to try (deep) before giving up on a record.
// Higher = better hit rate, more API calls per hard record. Easy hits stop at #1.
const MAX_CANDIDATES = 10;

// Strip suffixes and collapse to first+last for a broader fallback query.
function normalizeName(fullName: string): string {
  const cleaned = fullName
    .replace(/[.,]/g, ' ')
    .replace(/\b(jr|sr|ii|iii|iv|v|md|phd|esq|dr|mr|mrs|ms)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length >= 3) return `${parts[0]} ${parts[parts.length - 1]}`; // first + last
  return cleaned;
}

function extractCandidates(json: any, max = 20): Candidate[] {
  const out: Candidate[] = [];
  if (Array.isArray(json?.PeopleDetails)) {
    for (const p of json.PeopleDetails) {
      const id = p['Person ID'];
      if (id) out.push({
        personId: id,
        name: p.Name || '',
        livesIn: p['Lives in'] || '',
        usedToLive: p['Used to live in'] || '',
      });
      if (out.length >= max) break;
    }
  }
  return out;
}

// Rank candidates: those who currently live in the record's city/state first,
// then those who used to live there. The actual owner is most likely a local.
function rankCandidates(cands: Candidate[], city: string, state: string): Candidate[] {
  const c = city.toLowerCase().trim();
  const s = state.toLowerCase().trim();
  const score = (cand: Candidate) => {
    const lives = cand.livesIn.toLowerCase();
    const used = cand.usedToLive.toLowerCase();
    let sc = 0;
    if (c && lives.includes(c)) sc += 4;
    if (s && lives.includes(s)) sc += 2;
    if (c && used.includes(c)) sc += 1;
    return sc;
  };
  return [...cands].sort((a, b) => score(b) - score(a));
}

// Name search → list of candidate people (not just the first).
async function searchByNameCandidates(
  fullName: string, cityStateZip: string, street: string, apiKey: string
): Promise<Candidate[]> {
  let url = `https://${RAPID_HOST}/search/bynameaddress?name=${encodeURIComponent(fullName)}&citystatezip=${encodeURIComponent(cityStateZip)}&page=1`;
  if (street) url += `&street=${encodeURIComponent(street)}`;
  const res = await fetchWithBackoff(url, { method: 'GET', headers: { 'x-rapidapi-host': RAPID_HOST, 'x-rapidapi-key': apiKey } });
  if (!res.ok) { console.error(`[engine] search ${res.status} for "${fullName}"`); throw new Error(`Search API ${res.status}`); }
  return extractCandidates(await res.json());
}

// Address search → list of candidate people.
async function searchByAddressCandidates(
  street: string, cityStateZip: string, apiKey: string
): Promise<Candidate[]> {
  const url = `https://${RAPID_HOST}/search/byaddress?street=${encodeURIComponent(street)}&citystatezip=${encodeURIComponent(cityStateZip)}`;
  const res = await fetchWithBackoff(url, { method: 'GET', headers: { 'x-rapidapi-host': RAPID_HOST, 'x-rapidapi-key': apiKey } });
  if (!res.ok) { console.error(`[engine] address search ${res.status} for "${street}"`); throw new Error(`Address API ${res.status}`); }
  return extractCandidates(await res.json());
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
      // ── Gather candidates across waterfall stages, deduped by Person ID ──
      const seen = new Set<string>();
      const candidates: Candidate[] = [];
      const addCands = (cs: Candidate[]) => { for (const c of cs) if (!seen.has(c.personId)) { seen.add(c.personId); candidates.push(c); } };

      if (addressOnly) {
        addCands(await searchByAddressCandidates(street, cityStateZip, apiKey));
      } else {
        // Stage 2: name + street.  Stage 3: name without street.  Stage 4: normalized name.
        if (street) addCands(await searchByNameCandidates(fullName, cityStateZip, street, apiKey));
        if (candidates.length === 0) addCands(await searchByNameCandidates(fullName, cityStateZip, '', apiKey));
        if (candidates.length === 0) {
          const alt = normalizeName(fullName);
          if (alt && alt.toLowerCase() !== fullName.toLowerCase()) {
            addCands(await searchByNameCandidates(alt, cityStateZip, '', apiKey));
          }
        }
      }

      // ── Rank by locality (likely owner lives in the record's city/state) ──
      const ranked = addressOnly ? candidates : rankCandidates(candidates, city, state);

      // ── Try candidates (deep) until one yields a phone or email ──
      let matched = false;
      for (const cand of ranked.slice(0, MAX_CANDIDATES)) {
        const profileJson = await getPersonDetails(cand.personId, apiKey);
        if (!profileJson) continue;

        const allPhones: string[] = [];
        const primaryTel = profileJson['Person Details']?.[0]?.Telephone?.trim?.();
        if (primaryTel) allPhones.push(primaryTel);
        if (profileJson['All Phone Details']?.length > 0) {
          for (const p of profileJson['All Phone Details']) {
            const ph = (typeof p === 'string' ? p : (p['Phone Number'] || p.Phone || p.Telephone))?.trim?.();
            if (ph && !allPhones.includes(ph)) allPhones.push(ph);
          }
        }
        const emails = profileJson['Email Addresses'];
        const emailStr = emails?.length > 0
          ? emails.map((e: any) => typeof e === 'string' ? e : (e.Email || e.email || JSON.stringify(e))).join(', ')
          : '';

        if (allPhones.length > 0 || emailStr) {
          if (allPhones.length > 0) { phone1 = allPhones[0]; phone2 = allPhones[1] || ''; phone3 = allPhones[2] || ''; phone4 = allPhones[3] || ''; }
          if (emailStr) foundEmail = emailStr;
          matchedName = cand.name || matchedName;
          if (addressOnly) ownerName = cand.name || ownerName;
          matched = true;
          break;
        }
      }

      if (!matched) {
        phone1 = candidates.length > 0 ? 'Not Found' : 'No match found';
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

// Concurrency is high to saturate the 45 req/s token bucket; the limiter — not
// these delays — governs actual request rate, so delays are 0.
const PASS_CONFIG = [
  { concurrency: 40, batchDelay: 0, preDelay: 0 },
  { concurrency: 40, batchDelay: 0, preDelay: 300 },
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

export const CHUNK_SIZE = 40;

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
