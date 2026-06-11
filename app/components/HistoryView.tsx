'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import JobDetailModal from './JobDetailModal';

interface Props { session: any; }

const statusBadge: Record<string, { bg: string; color: string }> = {
  completed: { bg: '#d1fae5', color: '#065f46' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  failed: { bg: '#fee2e2', color: '#991b1b' },
  pending: { bg: '#fef3c7', color: '#92400e' },
};

export default function HistoryView({ session }: Props) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('trace_jobs')
        .select('id, created_at, file_name, total_records, successful_hits, credits_used, status')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setJobs(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = jobs.filter(j => !search || (j.file_name || '').toLowerCase().includes(search.toLowerCase()));
  const totalCreditsUsed = jobs.reduce((s, j) => s + (j.credits_used || 0), 0);
  const totalHits = jobs.reduce((s, j) => s + (j.successful_hits || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Job History</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
            {jobs.length} total jobs · {totalHits.toLocaleString()} contacts found · {totalCreditsUsed.toLocaleString()} credits used
          </p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Search jobs..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border text-sm rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64 transition-all"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--blue)', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-medium" style={{ color: 'var(--text-1)' }}>{search ? 'No jobs match your search' : 'No jobs yet'}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>{!search && 'Your skip trace history will appear here'}</p>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
              <span>Job</span>
              <span>Records</span>
              <span>Hits</span>
              <span>Hit Rate</span>
              <span>Credits</span>
              <span>Status</span>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filtered.map((job) => {
                const rate = job.total_records > 0 ? Math.round((job.successful_hits / job.total_records) * 100) : 0;
                const date = new Date(job.created_at);
                const badge = statusBadge[job.status] || statusBadge.pending;

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="px-6 py-4 cursor-pointer transition-colors"
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue-light)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    {/* Mobile */}
                    <div className="md:hidden flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--text-1)' }}>{job.file_name || 'Untitled Job'}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}{(job.successful_hits || 0)} hits · {rate}%
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0" style={{ background: badge.bg, color: badge.color }}>
                        {job.status}
                      </span>
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center">
                      <div className="min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--text-1)' }}>{job.file_name || 'Untitled Job'}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-1)' }}>{(job.total_records || 0).toLocaleString()}</span>
                      <span className="text-sm font-medium" style={{ color: '#059669' }}>{(job.successful_hits || 0).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[80px] rounded-full h-1.5" style={{ background: 'var(--border)' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${rate}%`, background: 'var(--blue)' }} />
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-2)' }}>{rate}%</span>
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-2)' }}>{(job.credits_used || 0).toLocaleString()}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: badge.bg, color: badge.color }}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {selectedJob && <JobDetailModal job={selectedJob} session={session} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}
