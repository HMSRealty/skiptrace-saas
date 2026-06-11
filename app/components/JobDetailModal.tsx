'use client';
import { useState } from 'react';
import Papa from 'papaparse';

interface Props {
  job: any;
  session: any;
  onClose: () => void;
}

const statusBadge: Record<string, { bg: string; color: string }> = {
  completed: { bg: '#d1fae5', color: '#065f46' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  failed: { bg: '#fee2e2', color: '#991b1b' },
  pending: { bg: '#fef3c7', color: '#92400e' },
};

export default function JobDetailModal({ job, session, onClose }: Props) {
  const [downloading, setDownloading] = useState(false);

  const rate = job.total_records > 0 ? Math.round((job.successful_hits / job.total_records) * 100) : 0;
  const date = new Date(job.created_at);
  const badge = statusBadge[job.status] || statusBadge.pending;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}?userId=${session.user.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Download failed');

      const csv = Papa.unparse(json.data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leadminer_${json.fileName || job.id}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--blue-light)' }}>📋</div>
            <div className="min-w-0">
              <h2 className="font-bold text-lg truncate" style={{ color: 'var(--text-1)' }}>{job.file_name || 'Untitled Job'}</h2>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                {' · '}
                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 ml-4 p-1 rounded-lg transition-colors" style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-base)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 p-6">
          {[
            { label: 'Records Processed', value: (job.total_records || 0).toLocaleString(), valueColor: 'var(--text-1)' },
            { label: 'Contacts Found', value: (job.successful_hits || 0).toLocaleString(), valueColor: '#059669' },
            { label: 'Credits Used', value: (job.credits_used || 0).toLocaleString(), valueColor: 'var(--blue)' },
            { label: 'Status', value: job.status, valueColor: '' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-2)' }}>{s.label}</p>
              {s.label === 'Status' ? (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: badge.bg, color: badge.color }}>
                  {job.status}
                </span>
              ) : (
                <p className="text-2xl font-black" style={{ color: s.valueColor }}>{s.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Hit rate bar */}
        <div className="px-6 pb-4">
          <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>Hit Rate</p>
              <p className="font-bold" style={{ color: 'var(--navy)' }}>{rate}%</p>
            </div>
            <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${rate}%`, background: 'var(--blue)' }} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 flex gap-3">
          {job.status === 'completed' ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--navy)' }}
            >
              {downloading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download Results CSV
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 text-center py-3 text-sm rounded-xl border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-2)' }}>
              Results not available — job {job.status}
            </div>
          )}
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl font-medium transition-all border"
            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--border)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-base)'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
