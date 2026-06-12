export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabaseAdmin';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const needsRetry = (phone: string) =>
  ['Not Found', 'No match found', 'Lookup Error'].includes(phone);

async function processWithConcurrency(
  items: any[],
  handler: (item: any) => Promise<any>,
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

const PASS_CONFIG = [
  { concurrency: 8, batchDelay: 100, preDelay: 0 },
  { concurrency: 5, batchDelay: 200, preDelay: 500 },
  { concurrency: 3, batchDelay: 300, preDelay: 800 },
];

function buildLookup(columnMap: any, apiKey: string) {
  return async (row: any) => {
    const firstName = row[columnMap.firstName] || '';
    const lastName  = row[columnMap.lastName]  || '';
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
      let searchUrl = `https://skip-tracing-working-api.p.rapidapi.com/search/bynameaddress?name=${encodeURIComponent(fullName)}&citystatezip=${encodeURIComponent(cityStateZip)}&page=1`;
      if (street) searchUrl += `&street=${encodeURIComponent(street)}`;

      const searchRes = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'skip-tracing-working-api.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
        },
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
          `https://skip-tracing-working-api.p.rapidapi.com/search/detailsbyID?peo_id=${encodeURIComponent(personId)}`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'skip-tracing-working-api.p.rapidapi.com',
              'x-rapidapi-key': apiKey,
            },
          }
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
    } catch {
      phone1 = 'Lookup Error';
    }

    return {
      _firstName: firstName, _lastName: lastName,
      _street: row[columnMap.street] || '', _city: row[columnMap.city] || '',
      _state: row[columnMap.state] || '', _zip: row[columnMap.zip] || '',
      _mailingStreet: row[columnMap.mailingStreet] || '', _mailingCity: row[columnMap.mailingCity] || '',
      _mailingState: row[columnMap.mailingState] || '', _mailingZip: row[columnMap.mailingZip] || '',
      Skip_Trace_Phone: phone1,
      _phone2: phone2, _phone3: phone3, _phone4: phone4,
      _email: foundEmail, _matchedName: matchedName,
    };
  };
}

function cleanResult(r: any) {
  return {
    'Owner Full Name':   `${r._firstName} ${r._lastName}`.trim(),
    'Property Address':  r._street,
    'Property City':     r._city,
    'Property State':    r._state,
    'Property Zip':      r._zip,
    'Mailing Address':   r._mailingStreet,
    'Mailing City':      r._mailingCity,
    'Mailing State':     r._mailingState,
    'Mailing Zip':       r._mailingZip,
    'Primary Phone':     r.Skip_Trace_Phone,
    'Phone 2':           r._phone2,
    'Phone 3':           r._phone3,
    'Phone 4':           r._phone4,
    'Email':             r._email,
    'Matched Name':      r._matchedName,
  };
}

async function readRapidApiKey(): Promise<string> {
  if (process.env.RAPIDAPI_KEY) return process.env.RAPIDAPI_KEY;
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const env = (getRequestContext().env as any) || {};
    if (env.RAPIDAPI_KEY) return env.RAPIDAPI_KEY;
  } catch {}
  return '';
}

async function readResendKey(): Promise<string | undefined> {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const env = (getRequestContext().env as any) || {};
    if (env.RESEND_API_KEY) return env.RESEND_API_KEY;
  } catch {}
  return undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'init') {
      const { userId, fileName, totalRecords } = body;
      if (!userId || !totalRecords) {
        return NextResponse.json({ error: 'Missing userId or totalRecords' }, { status: 400 });
      }

      const sb = await getSupabaseAdmin();
      const { data: profile, error: profileErr } = await sb
        .from('profiles')
        .select('credits_balance')
        .eq('id', userId)
        .single();
      if (profileErr || !profile) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
      }
      if (profile.credits_balance < totalRecords) {
        return NextResponse.json({ error: `Insufficient credits. Need ${totalRecords}, have ${profile.credits_balance}.` }, { status: 402 });
      }

      const insertResult = await sb
        .from('trace_jobs')
        .insert({
          user_id: userId,
          file_name: fileName || 'Untitled',
          total_records: totalRecords,
          status: 'processing',
          successful_hits: 0,
          credits_used: 0,
        })
        .select()
        .single();

      if (insertResult.error || !insertResult.data?.id) {
        return NextResponse.json({ error: `Could not create job: ${insertResult.error?.message || 'unknown'}` }, { status: 500 });
      }

      return NextResponse.json({ jobId: insertResult.data.id });
    }

    if (action === 'chunk') {
      const { records, columnMap } = body;
      if (!records || !columnMap) {
        return NextResponse.json({ error: 'Missing records or columnMap' }, { status: 400 });
      }

      const apiKey = await readRapidApiKey();
      const lookup = buildLookup(columnMap, apiKey);

      // Pass 1
      let results = await processWithConcurrency(records, lookup, PASS_CONFIG[0].concurrency, PASS_CONFIG[0].batchDelay);

      // Retry passes (limited to 2 for chunk speed)
      for (let pass = 1; pass < PASS_CONFIG.length; pass++) {
        const retryIndices = results.map((r, i) => needsRetry(r.Skip_Trace_Phone) ? i : -1).filter(i => i !== -1);
        if (retryIndices.length === 0) break;
        const cfg = PASS_CONFIG[pass];
        await sleep(cfg.preDelay);
        const retryRows = retryIndices.map(i => records[i]);
        const retryResults = await processWithConcurrency(retryRows, lookup, cfg.concurrency, cfg.batchDelay);
        retryIndices.forEach((originalIdx, retryIdx) => {
          if (!needsRetry(retryResults[retryIdx].Skip_Trace_Phone)) {
            results[originalIdx] = retryResults[retryIdx];
          }
        });
      }

      const cleanResults = results.map(cleanResult);
      const hits = cleanResults.filter(r => r['Primary Phone'] && !needsRetry(r['Primary Phone'])).length;

      return NextResponse.json({ data: cleanResults, hits });
    }

    if (action === 'finalize') {
      const { jobId, userId, allResults, fileName, userEmail } = body;
      if (!jobId || !userId || !allResults) {
        return NextResponse.json({ error: 'Missing jobId/userId/allResults' }, { status: 400 });
      }

      const sb = await getSupabaseAdmin();
      const successfulHits = allResults.filter((r: any) => r['Primary Phone'] && !needsRetry(r['Primary Phone'])).length;
      const totalRecords = allResults.length;

      // Deduct credits
      const { data: profile } = await sb.from('profiles').select('credits_balance').eq('id', userId).single();
      if (profile) {
        await sb.from('profiles').update({ credits_balance: profile.credits_balance - totalRecords }).eq('id', userId);
      }

      await sb.from('trace_jobs').update({
        status: 'completed',
        successful_hits: successfulHits,
        credits_used: totalRecords,
        result_data: allResults,
      }).eq('id', jobId);

      const resendKey = await readResendKey();
      if (resendKey && userEmail) {
        const hitRate = Math.round((successfulHits / totalRecords) * 100);
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'PropyTrace <onboarding@resend.dev>',
            to: userEmail,
            subject: `✅ Skip trace complete — ${successfulHits.toLocaleString()} contacts found`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#020c1b;color:#f0f6ff;padding:32px;border-radius:12px;">
                <div style="margin-bottom:24px;">
                  <span style="background:#059669;color:white;font-weight:900;font-size:18px;padding:6px 14px;border-radius:8px;">PropyTrace</span>
                </div>
                <h2 style="font-size:24px;font-weight:900;margin:0 0 8px;">Your skip trace is done! 🎯</h2>
                <p style="color:#6b90b5;margin:0 0 24px;">Here's a summary of your results:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px;">
                  <div style="background:#041225;border:1px solid #0e2d52;border-radius:10px;padding:16px;text-align:center;">
                    <div style="font-size:28px;font-weight:900;color:#fff;">${totalRecords.toLocaleString()}</div>
                    <div style="font-size:12px;color:#6b90b5;">Records</div>
                  </div>
                  <div style="background:#041225;border:1px solid #0e2d52;border-radius:10px;padding:16px;text-align:center;">
                    <div style="font-size:28px;font-weight:900;color:#34d399;">${successfulHits.toLocaleString()}</div>
                    <div style="font-size:12px;color:#6b90b5;">Contacts Found</div>
                  </div>
                  <div style="background:#041225;border:1px solid #0e2d52;border-radius:10px;padding:16px;text-align:center;">
                    <div style="font-size:28px;font-weight:900;color:#6ee7b7;">${hitRate}%</div>
                    <div style="font-size:12px;color:#6b90b5;">Hit Rate</div>
                  </div>
                </div>
                <p style="color:#6b90b5;font-size:13px;">File: <strong style="color:#f0f6ff;">${fileName || 'Your list'}</strong></p>
                <a href="https://propytrace.pages.dev" style="display:inline-block;margin-top:20px;background:#059669;color:white;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;">
                  Download Results →
                </a>
                <p style="color:#6b90b5;font-size:11px;margin-top:24px;">PropyTrace · Find every owner, miss nothing.</p>
              </div>
            `,
          }),
        }).catch(() => {});
      }

      return NextResponse.json({ ok: true, hits: successfulHits, total: totalRecords });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
