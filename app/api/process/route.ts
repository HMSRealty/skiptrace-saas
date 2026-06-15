export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabaseAdmin';
import {
  processChunk, readRapidApiKey, readProcessSecret, enqueueProcess,
  isBillable, sendCompletionEmail, CHUNK_SIZE,
} from '../../lib/traceEngine';

// Assemble all stored chunk results (ordered) and finalize the job exactly once.
async function finalizeJob(sb: any, jobId: string, cancelled: boolean) {
  const { data: chunks } = await sb
    .from('trace_chunk_results')
    .select('chunk_index, results')
    .eq('job_id', jobId)
    .order('chunk_index', { ascending: true });

  const allResults: any[] = [];
  for (const c of chunks || []) for (const r of (c.results || [])) allResults.push(r);

  const successfulHits = allResults.filter(isBillable).length;
  const billable = successfulHits;

  // Claim finalize atomically: only the first call (result_data still null) wins.
  const claim = await sb
    .from('trace_jobs')
    .update({
      status: cancelled ? 'cancelled' : 'completed',
      successful_hits: successfulHits,
      credits_used: billable,
      result_data: allResults,
    })
    .eq('id', jobId)
    .is('result_data', null)
    .select('id, user_id, total_records, file_name, user_email')
    .maybeSingle();

  if (!claim.data) return; // already finalized

  // Deduct credits once (atomic RPC, fallback to read-modify-write).
  if (billable > 0) {
    const rpc = await sb.rpc('deduct_credits', { p_user_id: claim.data.user_id, p_amount: billable });
    if (rpc.error) {
      const { data: profile } = await sb.from('profiles').select('credits_balance').eq('id', claim.data.user_id).single();
      if (profile) {
        await sb.from('profiles').update({ credits_balance: Math.max(0, profile.credits_balance - billable) }).eq('id', claim.data.user_id);
      }
    }
  }

  if (!cancelled && claim.data.user_email) {
    await sendCompletionEmail(claim.data.user_email, claim.data.file_name, claim.data.total_records, successfulHits);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const secret = await readProcessSecret();
    if (body.secret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jobId = body.jobId;
    if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });

    const sb = await getSupabaseAdmin();
    const { data: job, error } = await sb
      .from('trace_jobs')
      .select('id, status, chunk_cursor, total_chunks, column_map, successful_hits')
      .eq('id', jobId)
      .single();

    if (error || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Terminal states — stop chaining.
    if (job.status === 'completed' || job.status === 'failed') {
      return NextResponse.json({ ok: true, done: true });
    }
    if (job.status === 'cancelled') {
      await finalizeJob(sb, jobId, true);
      return NextResponse.json({ ok: true, cancelled: true });
    }

    const cursor: number = job.chunk_cursor ?? 0;
    if (cursor >= job.total_chunks) {
      await finalizeJob(sb, jobId, false);
      return NextResponse.json({ ok: true, done: true });
    }

    // Fetch just this chunk's input rows.
    const start = cursor * CHUNK_SIZE;
    let rows: any[] = [];
    const sliceRpc = await sb.rpc('get_input_slice', { p_job_id: jobId, p_start: start, p_count: CHUNK_SIZE });
    if (!sliceRpc.error && Array.isArray(sliceRpc.data)) {
      rows = sliceRpc.data;
    } else {
      const { data: full } = await sb.from('trace_jobs').select('input_records').eq('id', jobId).single();
      rows = (full?.input_records || []).slice(start, start + CHUNK_SIZE);
    }

    const apiKey = await readRapidApiKey();
    const results = await processChunk(rows, job.column_map, apiKey);
    const chunkHits = results.filter(isBillable).length;

    // Persist chunk result + advance cursor.
    await sb.from('trace_chunk_results').upsert({ job_id: jobId, chunk_index: cursor, results });
    await sb.from('trace_jobs').update({
      chunk_cursor: cursor + 1,
      successful_hits: (job.successful_hits ?? 0) + chunkHits,
    }).eq('id', jobId);

    // Re-check cancellation (user may have cancelled mid-chunk).
    const { data: fresh } = await sb.from('trace_jobs').select('status').eq('id', jobId).single();
    if (fresh?.status === 'cancelled') {
      await finalizeJob(sb, jobId, true);
      return NextResponse.json({ ok: true, cancelled: true });
    }

    // Continue or finish.
    if (cursor + 1 >= job.total_chunks) {
      await finalizeJob(sb, jobId, false);
      return NextResponse.json({ ok: true, done: true });
    } else {
      await enqueueProcess(jobId, 1);
      return NextResponse.json({ ok: true, next: cursor + 1 });
    }
  } catch (err: any) {
    console.error('[process] error:', err?.message);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
