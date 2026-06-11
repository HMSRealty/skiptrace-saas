export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

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

    const { data: job, error } = await supabaseAdmin
      .from('trace_jobs')
      .select('result_data, file_name, user_id, status')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Ensure the requesting user owns this job
    if (job.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (job.status !== 'completed' || !job.result_data) {
      return NextResponse.json({ error: 'Results not available for this job' }, { status: 404 });
    }

    return NextResponse.json({ data: job.result_data, fileName: job.file_name });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
