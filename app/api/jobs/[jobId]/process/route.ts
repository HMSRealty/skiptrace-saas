import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { processChunk, isHit, CHUNK_SIZE, type ColumnMap } from '../../../../lib/skiptraceEngine';

export const maxDuration = 300;

// Processes the next CHUNK_SIZE records of a job. The client calls this
// repeatedly until { done: true }. Each call is small enough to finish well
// inside maxDuration, so arbitrarily large lists complete across many calls.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { userId } = await request.json().catch(() => ({}));

    if (!jobId || !userId) {
      return NextResponse.json({ error: 'Missing jobId or userId' }, { status: 400 });
    }

    const { data: job, error } = await supabaseAdmin
      .from('trace_jobs')
      .select('user_id, status, total_records, processed_count, input_records, column_map, result_data, user_email, file_name')
      .eq('id', jobId)
      .single();

    if (error || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    if (job.user_id !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // Already finished — return terminal state so the client stops polling.
    if (job.status === 'completed' || job.status === 'failed') {
      return NextResponse.json({
        done: true,
        status: job.status,
        processedCount: job.processed_count ?? job.total_records,
        totalRecords: job.total_records,
      });
    }

    const allRecords: Record<string, string>[] = job.input_records || [];
    const columnMap = job.column_map as ColumnMap;
    const startIdx = job.processed_count || 0;
    const chunk = allRecords.slice(startIdx, startIdx + CHUNK_SIZE);

    if (chunk.length === 0) {
      // Nothing left but somehow not marked complete — finalize.
      return await finalize(job, jobId, job.result_data || []);
    }

    const chunkResults = await processChunk(chunk, columnMap);
    const accumulated = [...(job.result_data || []), ...chunkResults];
    const processedCount = startIdx + chunk.length;
    const isDone = processedCount >= allRecords.length;

    if (isDone) {
      return await finalize(job, jobId, accumulated);
    }

    // Persist progress and let the client poll for the next chunk.
    await supabaseAdmin
      .from('trace_jobs')
      .update({ processed_count: processedCount, result_data: accumulated })
      .eq('id', jobId);

    return NextResponse.json({
      done: false,
      status: 'processing',
      processedCount,
      totalRecords: allRecords.length,
    });
  } catch (err: any) {
    console.error('Chunk processing failure:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Marks the job complete, deducts credits for SUCCESSFUL HITS ONLY, and emails.
async function finalize(job: any, jobId: string, results: any[]) {
  const successfulHits = results.filter(isHit).length;

  // Charge only for contacts we actually found.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits_balance')
      .eq('id', job.user_id)
      .single();
    if (profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ credits_balance: Math.max(0, (profile.credits_balance || 0) - successfulHits) })
        .eq('id', job.user_id);
    }
  }

  await supabaseAdmin
    .from('trace_jobs')
    .update({
      status: 'completed',
      processed_count: job.total_records,
      successful_hits: successfulHits,
      credits_used: successfulHits,
      result_data: results,
    })
    .eq('id', jobId);

  // Fire the completion email (best-effort).
  const userEmail = job.user_email;
  if (process.env.RESEND_API_KEY && userEmail) {
    const total = job.total_records || results.length;
    const hitRate = total > 0 ? Math.round((successfulHits / total) * 100) : 0;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'LeadMiner <noreply@leadminer.app>',
        to: userEmail,
        subject: `✅ Skip trace complete — ${successfulHits.toLocaleString()} contacts found`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#020c1b;color:#f0f6ff;padding:32px;border-radius:12px;">
            <div style="margin-bottom:24px;">
              <span style="background:#2563eb;color:white;font-weight:900;font-size:18px;padding:6px 14px;border-radius:8px;">LeadMiner</span>
            </div>
            <h2 style="font-size:24px;font-weight:900;margin:0 0 8px;">Your skip trace is done! 🎯</h2>
            <p style="color:#6b90b5;margin:0 0 24px;">You were only charged for the ${successfulHits.toLocaleString()} contacts we found.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px;">
              <div style="background:#041225;border:1px solid #0e2d52;border-radius:10px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:900;color:#fff;">${total.toLocaleString()}</div>
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
            <p style="color:#6b90b5;font-size:13px;">File: <strong style="color:#f0f6ff;">${job.file_name || 'Your list'}</strong></p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="display:inline-block;margin-top:20px;background:#2563eb;color:white;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;">
              Download Results →
            </a>
            <p style="color:#6b90b5;font-size:11px;margin-top:24px;">LeadMiner · You only pay for contacts we find.</p>
          </div>
        `,
      }),
    }).catch(e => console.error('Email send failed:', e));
  }

  return NextResponse.json({
    done: true,
    status: 'completed',
    processedCount: job.total_records,
    totalRecords: job.total_records,
    hits: successfulHits,
  });
}
