'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import JobDetailModal from './JobDetailModal';

type View = 'dashboard' | 'new-trace' | 'history' | 'buy-credits';

interface Props {
  session: any;
  credits: number;
  onNavigate: (v: View) => void;
  onRefreshCredits: () => void;
}

interface JobStats {
  totalJobs: number;
  totalRecords: number;
  totalHits: number;
  recentJobs: any[];
}

const statusBadge: Record<string, { bg: string; color: string }> = {
  completed: { bg: '#d1fae5', color: '#065f46' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  failed: { bg: '#fee2e2', color: '#991b1b' },
  pending: { bg: '#fef3c7', color: '#92400e' },
};

export default function DashboardView({ session, credits, onNavigate, onRefreshCredits }: Props) {
  const [stats, setStats] = useState<JobStats>({ totalJobs: 0, totalRecords: 0, totalHits: 0, recentJobs: [] });
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: jobs } = await supabase
        .from('trace_jobs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (jobs) {
        const totalRecords = jobs.reduce((s, j) => s + (j.total_records || 0), 0);
        const totalHits = jobs.reduce((s, j) => s + (j.successful_hits || 0), 0);
        setStats({ totalJobs: jobs.length, totalRecords, totalHits, recentJobs: jobs.slice(0, 5) });
      }
      setLoading(false);
    }
    load();
  }, []);

  const hitRate = stats.totalRecords > 0 ? Math.round((stats.totalHits / stats.totalRecords) * 100) : 0;

  const statCards = [
    { label: 'Total Jobs Run', value: stats.totalJobs.toLocaleString(), accent: '#1d4ed8', lightBg: '#eff6ff' },
    { label: 'Contacts Found', value: stats.totalHits.toLocaleString(), accent: '#059669', lightBg: '#ecfdf5' },
    { label: 'Avg Hit Rate', value: `${hitRate}%`, accent: '#7c3aed', lightBg: '#f5f3ff' },
    { label: 'Credits Remaining', value: credits.toLocaleString(), accent: '#0891b2', lightBg: '#ecfeff' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--blue)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>{greeting} 👋</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>Here's what's happening with your skip traces.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl p-5 border" style={{ background: card.lightBg, borderColor: 'var(--border)' }}>
            <p className="text-3xl font-black" style={{ color: card.accent }}>{card.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('new-trace')}
          className="flex items-center gap-4 p-5 text-white rounded-2xl shadow-lg transition-all hover:opacity-95 hover:scale-[1.01] group"
          style={{ background: 'var(--navy)' }}
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚡</div>
          <div className="text-left">
            <p className="font-bold text-lg">Launch New Skip Trace</p>
            <p className="text-white/70 text-sm">Upload a CSV and enrich it now</p>
          </div>
        </button>
        <button
          onClick={() => onNavigate('buy-credits')}
          className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:scale-[1.01] group border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform" style={{ background: 'var(--blue-light)' }}>💳</div>
          <div className="text-left">
            <p className="font-bold text-lg" style={{ color: 'var(--text-1)' }}>Buy More Credits</p>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>Starting at $49 for 500 credits</p>
          </div>
        </button>
      </div>

      {/* Recent jobs */}
      <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-1)' }}>Recent Jobs</h3>
          <button onClick={() => onNavigate('history')} className="text-sm font-medium transition-colors" style={{ color: 'var(--blue)' }}>
            View all →
          </button>
        </div>

        {stats.recentJobs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="font-medium" style={{ color: 'var(--text-1)' }}>No jobs yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Run your first skip trace to see results here</p>
            <button onClick={() => onNavigate('new-trace')} className="mt-4 text-sm font-medium" style={{ color: 'var(--blue)' }}>Get started →</button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {stats.recentJobs.map((job) => {
              const rate = job.total_records > 0 ? Math.round((job.successful_hits / job.total_records) * 100) : 0;
              const badge = statusBadge[job.status] || statusBadge.pending;
              return (
                <div key={job.id} onClick={() => setSelectedJob(job)} className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors" style={{ background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue-light)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--bg-base)' }}>📋</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--text-1)' }}>{job.file_name || 'Untitled Job'}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                      {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{(job.successful_hits || 0).toLocaleString()} hits</p>
                    <p className="text-xs" style={{ color: 'var(--text-2)' }}>{(job.total_records || 0).toLocaleString()} records · {rate}% rate</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: badge.bg, color: badge.color }}>
                    {job.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedJob && <JobDetailModal job={selectedJob} session={session} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}
