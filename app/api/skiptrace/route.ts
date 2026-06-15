export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabaseAdmin';
import {
  processChunk, readRapidApiKey, isBillable, sendCompletionEmail,
  enqueueProcess, readQStashToken, CHUNK_SIZE,
} from '../../lib/traceEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // ── INIT ──────────────────────────────────────────────────────────
    if (action === 'init') {
      const { userId, fileName, totalRecords, records, columnMap, userEmail } = body;
      if (!userId || !totalRecords) {
        return NextResponse.json({ error: 'Missing userId or totalRecords' }, { status: 400 });
      }

      const sb = await getSupabaseAdmin();
      const { data: profile, error: profileErr } = await sb
        .from('profiles').select('credits_balance').eq('id', userId).single();
      if (profileErr || !profile) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
      }
      if (profile.credits_balance < totalRecords) {
        return NextResponse.json({ error: `Insufficient credits. Need ${totalRecords}, have ${profile.credits_balance}.` }, { status: 402 });
      }

      const qstashEnabled = !!(await readQStashToken()) && Array.isArray(records) && records.length > 0;
      const totalChunks = Math.ceil(totalRecords / CHUNK_SIZE);

      // Base columns exist in every schema. The background columns
      // (chunk_cursor, input_records, …) are only added when QStash is enabled,
      // so the app keeps working even before the background_jobs.sql migration.
      const insertRow: any = {
        user_id: userId,
        file_name: fileName || 'Untitled',
        total_records: totalRecords,
        status: 'processing',
        successful_hits: 0,
        credits_used: 0,
      };
      if (qstashEnabled) {
        insertRow.chunk_cursor = 0;
        insertRow.total_chunks = totalChunks;
        insertRow.user_email = userEmail || null;
        insertRow.input_records = records;
        insertRow.column_map = columnMap;
      }

      const insert = await sb.from('trace_jobs').insert(insertRow).select('id').single();
      if (insert.error || !insert.data?.id) {
        return NextResponse.json({ error: `Could not create job: ${insert.error?.message || 'unknown'}` }, { status: 500 });
      }
      const jobId = insert.data.id;

      if (qstashEnabled) {
        const ok = await enqueueProcess(jobId, 0);
        if (ok) return NextResponse.json({ jobId, mode: 'background' });
        // QStash failed — fall back to client mode.
      }
      return NextResponse.json({ jobId, mode: 'client' });
    }

    // ── CHUNK (client-driven fallback) ─────────────────────────────────
    if (action === 'chunk') {
      const { records, columnMap } = body;
      if (!records || !columnMap) {
        return NextResponse.json({ error: 'Missing records or columnMap' }, { status: 400 });
      }
      const apiKey = await readRapidApiKey();
      const data = await processChunk(records, columnMap, apiKey);
      const hits = data.filter(isBillable).length;
      return NextResponse.json({ data, hits });
    }

    // ── FINALIZE (client-driven fallback) ──────────────────────────────
    if (action === 'finalize') {
      const { jobId, userId, allResults, fileName, userEmail } = body;
      if (!jobId || !userId || !allResults) {
        return NextResponse.json({ error: 'Missing jobId/userId/allResults' }, { status: 400 });
      }
      const sb = await getSupabaseAdmin();
      const totalRecords = allResults.length;
      const successfulHits = allResults.filter(isBillable).length;
      const billable = successfulHits;

      const claim = await sb.from('trace_jobs')
        .update({ status: 'completed', successful_hits: successfulHits, credits_used: billable, result_data: allResults })
        .eq('id', jobId).eq('status', 'processing').select('id').maybeSingle();

      const alreadyFinalized = !claim.data;
      if (!alreadyFinalized) {
        if (billable > 0) {
          const rpc = await sb.rpc('deduct_credits', { p_user_id: userId, p_amount: billable });
          if (rpc.error) {
            const { data: profile } = await sb.from('profiles').select('credits_balance').eq('id', userId).single();
            if (profile) await sb.from('profiles').update({ credits_balance: Math.max(0, profile.credits_balance - billable) }).eq('id', userId);
          }
        }
        if (userEmail) await sendCompletionEmail(userEmail, fileName, totalRecords, successfulHits);
      }
      return NextResponse.json({ ok: true, hits: successfulHits, total: totalRecords });
    }

    // ── CANCEL ─────────────────────────────────────────────────────────
    if (action === 'cancel') {
      const { jobId, userId } = body;
      if (!jobId || !userId) return NextResponse.json({ error: 'Missing jobId/userId' }, { status: 400 });
      const sb = await getSupabaseAdmin();
      // Only the owner can cancel, and only while still processing.
      const upd = await sb.from('trace_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId).eq('user_id', userId).eq('status', 'processing')
        .select('id').maybeSingle();
      return NextResponse.json({ ok: true, cancelled: !!upd.data });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
