import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

// This route no longer does the lookups. It validates the request, reserves
// the job, and stores the raw input so the work can be processed one chunk at
// a time by /api/jobs/[jobId]/process — which keeps every serverless
// invocation well under the time limit and lets the client show real progress.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { records, columnMap, userId, fileName, userEmail } = body;

    if (!records || !Array.isArray(records) || records.length === 0 || !userId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Reserve check: the user must be able to afford the worst case (every
    // record a hit). Actual deduction happens at completion and only counts
    // successful hits — see /api/jobs/[jobId]/process.
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
        return NextResponse.json(
          { error: `Insufficient credits. Need up to ${records.length}, have ${profile.credits_balance}.` },
          { status: 402 }
        );
      }
    }

    // Create the job carrying its own input so the processor is self-contained.
    const { data: job, error: jobErr } = await supabaseAdmin
      .from('trace_jobs')
      .insert({
        user_id: userId,
        file_name: fileName || 'Untitled',
        total_records: records.length,
        status: 'processing',
        processed_count: 0,
        input_records: records,
        column_map: columnMap,
        user_email: userEmail || null,
      })
      .select('id')
      .single();

    if (jobErr || !job) {
      console.error('Failed to create job:', jobErr);
      return NextResponse.json(
        { error: 'Could not create job. Ensure the trace_jobs table has the input_records, column_map, processed_count and user_email columns (see db/schema.sql).' },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobId: job.id, totalRecords: records.length });
  } catch (error: any) {
    console.error('Critical API failure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
