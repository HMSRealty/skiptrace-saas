export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!jobId || !userId) {
      return NextResponse.json({ error: 'Missing jobId or userId' }, { status: 400 });
    }

    const { data: job, error } = await getSupabaseAdmin()
      .from('trace_jobs')
      .select('id, status, file_name, total_records, successful_hits, credits_used, result_data, error_message, user_id, created_at')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      fileName: job.file_name,
      totalRecords: job.total_records,
      successfulHits: job.successful_hits,
      creditsUsed: job.credits_used,
      data: job.result_data,
      error: job.error_message,
      createdAt: job.created_at,
    });

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
