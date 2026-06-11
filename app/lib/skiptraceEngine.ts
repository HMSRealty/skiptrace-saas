// ─── SKIP-TRACE ENGINE ───────────────────────────────────────────────
// Pure lookup logic, shared by the chunked /api/jobs/[jobId]/process route.
// Extracted from the old synchronous /api/skiptrace route so it can be run
// one chunk at a time and stay well under the serverless time limit.

export interface ColumnMap {
  firstName: string; lastName: string;
  street: string; city: string; state: string; zip: string;
  mailingStreet: string; mailingCity: string; mailingState: string; mailingZip: string;
}

export interface CleanResult {
  'Owner Full Name': string;
  'Property Address': string;
  'Property City': string;
  'Property State': string;
  'Property Zip': string;
  'Mailing Address': string;
  'Mailing City': string;
  'Mailing State': string;
  'Mailing Zip': string;
  'Primary Phone': string;
  'Phone 2': string;
  'Phone 3': string;
  'Phone 4': string;
  'Email': string;
  'Matched Name': string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Returns true if this record still needs a retry
export const needsRetry = (phone: string) =>
  ['Not Found', 'No match found', 'Lookup Error'].includes(phone);

// Counts a clean result as a successful hit (real phone number found)
export const isHit = (r: CleanResult) =>
  !!r['Primary Phone'] &&
  !needsRetry(r['Primary Phone']) &&
  !r['Primary Phone'].startsWith('Skipped');

async function processWithConcurrency<T>(
  items: T[],
  handler: (item: T) => Promise<any>,
  concurrency: number,
  delayBetweenBatches: number
): Promise<any[]> {
  const results: any[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(handler));
    results.push(...batchResults);
    if (i + concurrency < items.length) {
      await sleep(delayBetweenBatches);
    }
  }
  return results;
}

// Retry passes applied *within* a single chunk. Because chunks are small
// (see CHUNK_SIZE) every chunk still completes comfortably inside the limit.
const PASS_CONFIG = [
  { concurrency: 8, batchDelay: 150,  preDelay: 0    }, // Pass 1 — main run
  { concurrency: 6, batchDelay: 300,  preDelay: 1000 }, // Pass 2
  { concurrency: 5, batchDelay: 500,  preDelay: 1500 }, // Pass 3
  { concurrency: 4, batchDelay: 700,  preDelay: 2000 }, // Pass 4
  { concurrency: 3, batchDelay: 900,  preDelay: 2500 }, // Pass 5
  { concurrency: 3, batchDelay: 1100, preDelay: 3000 }, // Pass 6 — final sweep
];

// Number of input rows processed per /process invocation. Each row can take
// a few seconds across retries, so this keeps a chunk well under maxDuration.
export const CHUNK_SIZE = 75;

const RAPID_HOST = 'skip-tracing-working-api.p.rapidapi.com';

function lookupRecord(columnMap: ColumnMap) {
  return async (row: Record<string, string>): Promise<any> => {
    const firstName = row[columnMap.firstName] || '';
    const lastName  = row[columnMap.lastName]  || '';

    // Use property address; fall back to mailing address if missing
    const street = row[columnMap.street] || row[columnMap.mailingStreet] || '';
    const city   = row[columnMap.city]   || row[columnMap.mailingCity]   || '';
    const state  = row[columnMap.state]  || row[columnMap.mailingState]  || '';
    const zip    = row[columnMap.zip]    || row[columnMap.mailingZip]    || '';

    if (!firstName || !lastName || !city || !state) {
      return {
        _firstName: firstName, _lastName: lastName,
        _street: row[columnMap.street] || '', _city: city,
        _state: state, _zip: row[columnMap.zip] || '',
        _mailingStreet: row[columnMap.mailingStreet] || '', _mailingCity: row[columnMap.mailingCity] || '',
        _mailingState: row[columnMap.mailingState] || '', _mailingZip: row[columnMap.mailingZip] || '',
        Skip_Trace_Phone: 'Skipped: Missing Name/City/State',
        _phone2: '', _phone3: '', _phone4: '', _email: 'N/A', _matchedName: 'N/A',
      };
    }

    const fullName     = `${firstName} ${lastName}`.trim();
    const cityStateZip = `${city} ${state} ${zip}`.trim();
    let phone1 = 'Not Found';
    let phone2 = '';
    let phone3 = '';
    let phone4 = '';
    let foundEmail  = 'Not Found';
    let matchedName = fullName;

    try {
      let searchUrl = `https://${RAPID_HOST}/search/bynameaddress?name=${encodeURIComponent(fullName)}&citystatezip=${encodeURIComponent(cityStateZip)}&page=1`;
      if (street) searchUrl += `&street=${encodeURIComponent(street)}`;

      const searchRes = await fetch(searchUrl, {
        method: 'GET',
        headers: { 'x-rapidapi-host': RAPID_HOST, 'x-rapidapi-key': process.env.RAPIDAPI_KEY! },
      });

      if (!searchRes.ok) throw new Error(`Search API ${searchRes.status}`);

      const searchJson = await searchRes.json();
      let personId: string | null = null;

      if (searchJson.PeopleDetails?.length > 0) {
        personId    = searchJson.PeopleDetails[0]['Person ID'];
        matchedName = searchJson.PeopleDetails[0].Name || fullName;
      }

      if (personId) {
        const detailsRes = await fetch(
          `https://${RAPID_HOST}/search/detailsbyID?peo_id=${encodeURIComponent(personId)}`,
          { method: 'GET', headers: { 'x-rapidapi-host': RAPID_HOST, 'x-rapidapi-key': process.env.RAPIDAPI_KEY! } }
        );

        if (detailsRes.ok) {
          const profileJson = await detailsRes.json();
          const allPhones: string[] = [];

          const primaryTel = profileJson['Person Details']?.[0]?.Telephone?.trim();
          if (primaryTel) allPhones.push(primaryTel);

          if (profileJson['All Phone Details']?.length > 0) {
            for (const p of profileJson['All Phone Details']) {
              const phoneStr = (typeof p === 'string' ? p : (p['Phone Number'] || p.Phone || p.Telephone))?.trim();
              if (phoneStr && !allPhones.includes(phoneStr)) allPhones.push(phoneStr);
            }
          }

          if (allPhones.length > 0) {
            phone1 = allPhones[0];
            phone2 = allPhones[1] || '';
            phone3 = allPhones[2] || '';
            phone4 = allPhones[3] || '';
          }

          const emailsArray = profileJson['Email Addresses'];
          if (emailsArray?.length > 0) {
            foundEmail = emailsArray.map((e: any) =>
              typeof e === 'string' ? e : (e.Email || e.email || JSON.stringify(e))
            ).join(', ');
          }
        }
      } else {
        phone1 = 'No match found';
      }
    } catch (err) {
      console.error(`Error processing ${fullName}:`, err);
      phone1 = 'Lookup Error';
    }

    return {
      _firstName: firstName, _lastName: lastName,
      _street: row[columnMap.street] || '', _city: row[columnMap.city] || '',
      _state: row[columnMap.state] || '', _zip: row[columnMap.zip] || '',
      _mailingStreet: row[columnMap.mailingStreet] || '', _mailingCity: row[columnMap.mailingCity] || '',
      _mailingState: row[columnMap.mailingState] || '', _mailingZip: row[columnMap.mailingZip] || '',
      Skip_Trace_Phone: phone1, // used by needsRetry()
      _phone2: phone2, _phone3: phone3, _phone4: phone4,
      _email: foundEmail, _matchedName: matchedName,
    };
  };
}

function toClean(r: any): CleanResult {
  return {
    'Owner Full Name':  `${r._firstName} ${r._lastName}`.trim(),
    'Property Address': r._street,
    'Property City':    r._city,
    'Property State':   r._state,
    'Property Zip':     r._zip,
    'Mailing Address':  r._mailingStreet,
    'Mailing City':     r._mailingCity,
    'Mailing State':    r._mailingState,
    'Mailing Zip':      r._mailingZip,
    'Primary Phone':    r.Skip_Trace_Phone,
    'Phone 2':          r._phone2,
    'Phone 3':          r._phone3,
    'Phone 4':          r._phone4,
    'Email':            r._email,
    'Matched Name':     r._matchedName,
  };
}

// Runs the full multi-pass engine over a single chunk of rows and returns
// clean results. Safe to call repeatedly, one chunk per serverless invocation.
export async function processChunk(
  rows: Record<string, string>[],
  columnMap: ColumnMap
): Promise<CleanResult[]> {
  const handler = lookupRecord(columnMap);

  const cfg0 = PASS_CONFIG[0];
  const results = await processWithConcurrency(rows, handler, cfg0.concurrency, cfg0.batchDelay);

  for (let pass = 1; pass < PASS_CONFIG.length; pass++) {
    const retryIndices = results
      .map((r, i) => needsRetry(r.Skip_Trace_Phone) ? i : -1)
      .filter(i => i !== -1);

    if (retryIndices.length === 0) break;

    const cfg = PASS_CONFIG[pass];
    await sleep(cfg.preDelay);

    const retryRows    = retryIndices.map(i => rows[i]);
    const retryResults = await processWithConcurrency(retryRows, handler, cfg.concurrency, cfg.batchDelay);

    retryIndices.forEach((originalIdx, retryIdx) => {
      if (!needsRetry(retryResults[retryIdx].Skip_Trace_Phone)) {
        results[originalIdx] = retryResults[retryIdx];
      }
    });
  }

  return results.map(toClean);
}
