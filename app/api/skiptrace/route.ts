export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Returns true if this record still needs a retry
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
  { concurrency: 8, batchDelay: 150,  preDelay: 0    }, // Pass 1 — main run
  { concurrency: 6, batchDelay: 300,  preDelay: 1000 }, // Pass 2
  { concurrency: 5, batchDelay: 500,  preDelay: 1500 }, // Pass 3
  { concurrency: 4, batchDelay: 700,  preDelay: 2000 }, // Pass 4
  { concurrency: 3, batchDelay: 900,  preDelay: 2500 }, // Pass 5
  { concurrency: 3, batchDelay: 1100, preDelay: 3000 }, // Pass 6 — final sweep
];

export async function POST(request: Request) {
  let jobId: string | null = null;
  try {
    const body = await request.json();
    const { records, columnMap, userId, fileName, userEmail } = body;

    if (!records || !userId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    let currentCredits: number | null = null;

    if (hasServiceRole) {
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('credits_balance')
        .eq('id', userId)
        .single();

      if (profileErr || !profile) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
      }
      if (profile.credits_balance < records.length) {
        return NextResponse.json({ error: `Insufficient credits. Need ${records.length}, have ${profile.credits_balance}.` }, { status: 402 });
      }
      currentCredits = profile.credits_balance;
    }

    // Create job record
    try {
      const { data: job } = await supabaseAdmin
        .from('trace_jobs')
        .insert({ user_id: userId, file_name: fileName || 'Untitled', total_records: records.length, status: 'processing' })
        .select()
        .single();
      jobId = job?.id ?? null;
    } catch { /* table may not exist yet */ }

    // Build the lookup function for a single row
    const lookupRecord = async (row: any) => {
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

      const fullName    = `${firstName} ${lastName}`.trim();
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
            'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
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
                'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
              },
            }
          );

          if (detailsRes.ok) {
            const profileJson = await detailsRes.json();
            const allPhones: string[] = [];

            // Primary phone first — from Person Details
            const primaryTel = profileJson['Person Details']?.[0]?.Telephone?.trim();
            if (primaryTel) allPhones.push(primaryTel);

            // Additional phones from All Phone Details
            if (profileJson['All Phone Details']?.length > 0) {
              for (const p of profileJson['All Phone Details']) {
                const phoneStr = (typeof p === 'string' ? p : (p['Phone Number'] || p.Phone || p.Telephone))?.trim();
                if (phoneStr && !allPhones.includes(phoneStr)) {
                  allPhones.push(phoneStr);
                }
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

      // Keep Skip_Trace_Phone for internal retry checking; clean output built after all passes
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

    // ─── MULTI-PASS ENGINE ───────────────────────────────────────────
    // Pass 1: run all records
    const cfg0 = PASS_CONFIG[0];
    let finalResults = await processWithConcurrency(records, lookupRecord, cfg0.concurrency, cfg0.batchDelay);

    // Passes 2–4: retry only the records that didn't get a phone number
    for (let pass = 1; pass < PASS_CONFIG.length; pass++) {
      // Find indices of records still needing a result
      const retryIndices = finalResults
        .map((r, i) => needsRetry(r.Skip_Trace_Phone) ? i : -1)
        .filter(i => i !== -1);

      if (retryIndices.length === 0) break; // everyone found — stop early

      const cfg = PASS_CONFIG[pass];
      console.log(`Pass ${pass + 1}: retrying ${retryIndices.length} unresolved records...`);

      await sleep(cfg.preDelay);

      const retryRows    = retryIndices.map(i => records[i]);
      const retryResults = await processWithConcurrency(retryRows, lookupRecord, cfg.concurrency, cfg.batchDelay);

      // Merge successful retries back into final results
      retryIndices.forEach((originalIdx, retryIdx) => {
        if (!needsRetry(retryResults[retryIdx].Skip_Trace_Phone)) {
          finalResults[originalIdx] = retryResults[retryIdx];
        }
      });
    }
    // ────────────────────────────────────────────────────────────────

    // ─── BUILD CLEAN OUTPUT (only the columns users care about) ───────
    const cleanResults = finalResults.map(r => ({
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
    }));

    const successfulHits = cleanResults.filter(r =>
      r['Primary Phone'] && !needsRetry(r['Primary Phone'])
    ).length;

    // Deduct credits
    const creditsToDeduct = records.length;
    if (hasServiceRole && currentCredits !== null) {
      await supabaseAdmin
        .from('profiles')
        .update({ credits_balance: currentCredits - creditsToDeduct })
        .eq('id', userId);
    }

    // Save completed job + clean results
    if (jobId) {
      await supabaseAdmin
        .from('trace_jobs')
        .update({
          status: 'completed',
          successful_hits: successfulHits,
          credits_used: creditsToDeduct,
          result_data: cleanResults,
        })
        .eq('id', jobId);
    }

    // ─── EMAIL NOTIFICATION ──────────────────────────────────────────
    if (process.env.RESEND_API_KEY && userEmail) {
      const hitRate = Math.round((successfulHits / records.length) * 100);
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'PropTrace <noreply@leadminer.app>',
          to: userEmail,
          subject: `✅ Skip trace complete — ${successfulHits.toLocaleString()} contacts found`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#020c1b;color:#f0f6ff;padding:32px;border-radius:12px;">
              <div style="margin-bottom:24px;">
                <span style="background:#2563eb;color:white;font-weight:900;font-size:18px;padding:6px 14px;border-radius:8px;">PropTrace</span>
              </div>
              <h2 style="font-size:24px;font-weight:900;margin:0 0 8px;">Your skip trace is done! 🎯</h2>
              <p style="color:#6b90b5;margin:0 0 24px;">Here's a summary of your results:</p>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px;">
                <div style="background:#041225;border:1px solid #0e2d52;border-radius:10px;padding:16px;text-align:center;">
                  <div style="font-size:28px;font-weight:900;color:#fff;">${records.length.toLocaleString()}</div>
                  <div style="font-size:12px;color:#6b90b5;">Records</div>
                </div>
                <div style="background:#041225;border:1px solid #0e2d52;border-radius:10px;padding:16px;text-align:center;">
                  <div style="font-size:28px;font-weight:900;color:#3b82f6;">${successfulHits.toLocaleString()}</div>
                  <div style="font-size:12px;color:#6b90b5;">Contacts Found</div>
                </div>
                <div style="background:#041225;border:1px solid #0e2d52;border-radius:10px;padding:16px;text-align:center;">
                  <div style="font-size:28px;font-weight:900;color:#60a5fa;">${hitRate}%</div>
                  <div style="font-size:12px;color:#6b90b5;">Hit Rate</div>
                </div>
              </div>
              <p style="color:#6b90b5;font-size:13px;">File: <strong style="color:#f0f6ff;">${fileName || 'Your list'}</strong></p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="display:inline-block;margin-top:20px;background:#2563eb;color:white;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;">
                Download Results →
              </a>
              <p style="color:#6b90b5;font-size:11px;margin-top:24px;">PropTrace · Find every owner, miss nothing.</p>
            </div>
          `,
        }),
      }).catch(e => console.error('Email send failed:', e));
    }

    return NextResponse.json({
      success: true,
      hits: successfulHits,
      total: records.length,
      data: cleanResults,
    });

  } catch (error: any) {
    console.error('Critical API failure:', error);
    if (jobId) {
      await supabaseAdmin
        .from('trace_jobs')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', jobId);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
