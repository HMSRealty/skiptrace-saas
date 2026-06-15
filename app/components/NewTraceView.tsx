'use client';
import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';

const STORAGE_KEY = 'propytrace_trace_session_v2';
const JOB_KEY = 'propytrace_active_job_v1';

interface Props {
  session: any;
  credits: number;
  onTraceComplete: () => void;
  onBuyCredits: () => void;
}

interface CSVRecord { [key: string]: string; }
type Step = 'upload' | 'map' | 'processing' | 'done';

type InitialState = {
  step: Step;
  fileName: string;
  headers: string[];
  fullData: CSVRecord[];
  columnMap: any;
};

function readInitialState(): InitialState {
  const empty: InitialState = { step: 'upload', fileName: '', headers: [], fullData: [], columnMap: null };
  if (typeof window === 'undefined') return empty;
  let job: any = null;
  let sess: any = null;
  try { job = JSON.parse(localStorage.getItem(JOB_KEY) || 'null'); } catch {}
  try { sess = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch {}
  if (job?.jobId) {
    return {
      step: 'processing',
      fileName: job.fileName || sess?.fileName || 'Resuming...',
      headers: sess?.headers || [],
      fullData: sess?.fullData || new Array(job.totalRecords || 0).fill({}),
      columnMap: sess?.columnMap || null,
    };
  }
  if (sess?.headers && sess?.fullData) {
    return {
      step: 'map',
      fileName: sess.fileName || 'Restored list',
      headers: sess.headers,
      fullData: sess.fullData,
      columnMap: sess.columnMap || null,
    };
  }
  return empty;
}

export default function NewTraceView({ session, credits, onTraceComplete, onBuyCredits }: Props) {
  const [step, setStep] = useState<Step>(() => readInitialState().step);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>(() => readInitialState().fileName);
  const [headers, setHeaders] = useState<string[]>(() => readInitialState().headers);
  const [fullData, setFullData] = useState<CSVRecord[]>(() => readInitialState().fullData);
  const [previewData, setPreviewData] = useState<CSVRecord[]>(() => readInitialState().fullData.slice(0, 3));
  const [dragOver, setDragOver] = useState(false);

  const [columnMap, setColumnMap] = useState(() => readInitialState().columnMap || {
    firstName: '', lastName: '', street: '', city: '', state: '', zip: '',
    mailingStreet: '', mailingCity: '', mailingState: '', mailingZip: '',
  });

  // Save mapping state on changes (only while in map step with data)
  useEffect(() => {
    if (step === 'map' && fullData.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          fileName: fileName || file?.name || '',
          headers,
          fullData,
          columnMap,
        }));
      } catch {
        // ignore quota errors for very large CSVs
      }
    }
  }, [step, headers, fullData, columnMap, file, fileName]);

  const [processingMsg, setProcessingMsg] = useState('Starting...');
  const [processingPct, setProcessingPct] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(0);
  const [result, setResult] = useState<{ hits: number; total: number } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [doneCancelled, setDoneCancelled] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
  };

  const startProgressTicker = (estimatedMs: number, startedAtMs: number) => {
    const statusMsgs = [
      { at: 0,  text: 'Searching records...' },
      { at: 18, text: 'Extracting phone numbers...' },
      { at: 35, text: 'Retrying missed results...' },
      { at: 52, text: 'Cross-referencing addresses...' },
      { at: 68, text: 'Deep retry in progress...' },
      { at: 82, text: 'Final sweep running...' },
      { at: 93, text: 'Packaging your results...' },
    ];
    if (tickerRef.current) clearInterval(tickerRef.current);
    tickerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAtMs;
      const pct = Math.min((elapsed / estimatedMs) * 92, 92);
      setProcessingPct(Math.round(pct));
      const current = [...statusMsgs].reverse().find(s => pct >= s.at);
      if (current) setProcessingMsg(current.text);
      setEtaSeconds(Math.max(0, Math.ceil((estimatedMs - elapsed) / 1000)));
    }, 400);
  };

  const CHUNK_SIZE = 20;

  const finishLocal = (allResults: any[], totalRec: number) => {
    clearTimers();
    setProcessingPct(100);
    setProcessingMsg('Done!');
    // Matches server-side success-based billing: a hit = a real phone OR a real email.
    const hits = allResults.filter((r: any) => {
      const phone = r['Primary Phone'];
      const email = r['Email'];
      const phoneGood = phone && !['Not Found', 'No match found', 'Lookup Error'].includes(phone) && !String(phone).startsWith('Skipped');
      const emailGood = email && email !== 'Not Found' && email !== 'N/A';
      return phoneGood || emailGood;
    }).length;
    const csvOut = Papa.unparse(allResults);
    const blob = new Blob([csvOut], { type: 'text/csv;charset=utf-8;' });
    setDownloadUrl(URL.createObjectURL(blob));
    setResult({ hits, total: totalRec });
    setStep('done');
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    try { localStorage.removeItem(JOB_KEY); } catch {}
    setActiveJobId(null);
  };

  // Process chunks one by one. Updates localStorage after each chunk so refresh resumes.
  const runChunkedTrace = async (
    jobId: string,
    records: CSVRecord[],
    map: any,
    startedAt: number,
    estimatedMs: number,
    startFromChunk: number,
    initialResults: any[]
  ) => {
    startProgressTicker(estimatedMs, startedAt);
    const chunks: CSVRecord[][] = [];
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      chunks.push(records.slice(i, i + CHUNK_SIZE));
    }
    let allResults = [...initialResults];

    try {
      for (let i = startFromChunk; i < chunks.length; i++) {
        const res = await fetch('/api/skiptrace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'chunk', records: chunks[i], columnMap: map }),
        });
        const j = await res.json();
        if (!res.ok || !j.data) throw new Error(j.error || `Chunk ${i + 1} failed`);
        allResults = allResults.concat(j.data);

        // Real progress: how many records done / total
        const done = Math.min(records.length, allResults.length);
        const pct = Math.min(95, Math.round((done / records.length) * 95));
        setProcessingPct(pct);
        setProcessingMsg(`Processed ${done.toLocaleString()} of ${records.length.toLocaleString()}...`);

        // Save progress to localStorage (so refresh resumes)
        try {
          localStorage.setItem(JOB_KEY, JSON.stringify({
            jobId,
            mode: 'client',
            startedAt,
            estimatedMs,
            totalRecords: records.length,
            fileName: fileName || file?.name || '',
            records,
            columnMap: map,
            completedChunks: i + 1,
            resultsSoFar: allResults,
          }));
        } catch {}
      }

      setProcessingMsg('Finalizing...');
      setProcessingPct(98);
      await fetch('/api/skiptrace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finalize',
          jobId,
          userId: session.user.id,
          allResults,
          fileName: fileName || file?.name,
          userEmail: session.user.email,
        }),
      });

      finishLocal(allResults, records.length);
    } catch (err: any) {
      clearTimers();
      setError(err.message || 'Skip trace failed during chunk processing.');
      setStep('map');
    }
  };

  // Build the download + done screen from a finished job's result rows.
  const finishFromData = (results: any[], totalRec: number, cancelled = false) => {
    clearTimers();
    setProcessingPct(100);
    setProcessingMsg(cancelled ? 'Cancelled' : 'Done!');
    const hits = (results || []).filter((r: any) => {
      const phone = r['Primary Phone'];
      const email = r['Email'];
      const phoneGood = phone && !['Not Found', 'No match found', 'Lookup Error'].includes(phone) && !String(phone).startsWith('Skipped');
      const emailGood = email && email !== 'Not Found' && email !== 'N/A';
      return phoneGood || emailGood;
    }).length;
    if (results && results.length) {
      const blob = new Blob([Papa.unparse(results)], { type: 'text/csv;charset=utf-8;' });
      setDownloadUrl(URL.createObjectURL(blob));
    }
    setResult({ hits, total: totalRec });
    setDoneCancelled(cancelled);
    setStep('done');
    setCancelling(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    try { localStorage.removeItem(JOB_KEY); } catch {}
    setActiveJobId(null);
  };

  // BACKGROUND MODE: QStash drives the worker. Browser just polls job status.
  const startBackgroundPolling = (jobId: string, totalRec: number) => {
    setProcessingMsg('Queued — processing in the background...');
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}?userId=${encodeURIComponent(session.user.id)}`);
        if (!res.ok) return;
        const job = await res.json();
        // Real progress from chunk cursor.
        if (job.totalChunks > 0) {
          const pct = Math.min(99, Math.round((job.chunkCursor / job.totalChunks) * 100));
          setProcessingPct(pct);
          const done = Math.min(totalRec, job.chunkCursor * 25);
          setProcessingMsg(
            job.status === 'cancelled'
              ? 'Cancelling — finishing current batch...'
              : `Processed ${done.toLocaleString()} of ${totalRec.toLocaleString()}...`
          );
        }
        if (job.status === 'completed' || job.status === 'cancelled') {
          finishFromData(job.data || [], job.totalRecords || totalRec, job.status === 'cancelled');
        } else if (job.status === 'failed') {
          clearTimers();
          setError(job.error || 'Skip trace failed.');
          setStep('map');
          setCancelling(false);
          try { localStorage.removeItem(JOB_KEY); } catch {}
        }
      } catch {}
    }, 3000);
  };

  // Cancel an in-flight job.
  const handleCancel = async () => {
    if (!activeJobId) return;
    setCancelling(true);
    try {
      await fetch('/api/skiptrace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', jobId: activeJobId, userId: session.user.id }),
      });
    } catch {}
    // Background mode: polling will pick up the 'cancelled' status and finalize.
    // Client mode: stop the local loop immediately.
    const saved = (() => { try { return JSON.parse(localStorage.getItem(JOB_KEY) || 'null'); } catch { return null; } })();
    if (saved?.mode === 'client') {
      clearTimers();
      finishFromData(saved.resultsSoFar || [], saved.totalRecords || fullData.length, true);
    }
  };

  // Resume an in-progress job on mount (either mode)
  useEffect(() => {
    let saved: any = null;
    try { saved = JSON.parse(localStorage.getItem(JOB_KEY) || 'null'); } catch {}
    if (!saved?.jobId) return;
    setActiveJobId(saved.jobId);

    if (saved.mode === 'background') {
      if (saved.totalRecords && fullData.length === 0) setFullData(new Array(saved.totalRecords).fill({}));
      startBackgroundPolling(saved.jobId, saved.totalRecords || 0);
    } else if (saved.records && saved.columnMap) {
      runChunkedTrace(
        saved.jobId, saved.records, saved.columnMap,
        saved.startedAt || Date.now(), saved.estimatedMs || 60000,
        saved.completedChunks || 0, saved.resultsSoFar || [],
      );
    }
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a .csv file.');
      return;
    }
    setError('');
    setFile(selectedFile);
    setFileName(selectedFile.name);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields) {
          setHeaders(results.meta.fields);
          const parsed = results.data as CSVRecord[];
          setFullData(parsed);
          setPreviewData(parsed.slice(0, 3));
          const lc = results.meta.fields.map(f => f.toLowerCase());
          const pick = (...tests: string[]) =>
            results.meta.fields![lc.findIndex(x => tests.some(t => x.includes(t)))] || '';
          setColumnMap({
            firstName:    pick('first', 'fname'),
            lastName:     pick('last', 'lname'),
            street:       pick('street', 'address'),
            city:         pick('city'),
            state:        pick('state'),
            zip:          pick('zip', 'postal'),
            mailingStreet: pick('mailing street', 'mail street', 'mailing address', 'mail address'),
            mailingCity:   pick('mailing city', 'mail city'),
            mailingState:  pick('mailing state', 'mail state'),
            mailingZip:    pick('mailing zip', 'mail zip', 'mailing postal', 'mail postal'),
          });
          setStep('map');
        }
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleStartTrace = async () => {
    if (credits < fullData.length) {
      setError(`Not enough credits. You need ${fullData.length} credits but have ${credits}.`);
      return;
    }

    setStep('processing');
    setError('');
    setProcessingPct(0);
    setProcessingMsg('Starting...');

    const estimatedMs = Math.max(15000, fullData.length * 1500);
    const startedAt = Date.now();

    try {
      const initRes = await fetch('/api/skiptrace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'init',
          userId: session.user.id,
          fileName: fileName || file?.name,
          totalRecords: fullData.length,
          records: fullData,
          columnMap,
          userEmail: session.user.email,
        }),
      });
      const initData = await initRes.json();
      if (!initRes.ok || !initData.jobId) {
        throw new Error(initData.error || 'Could not start skip trace.');
      }

      const jobId = initData.jobId;
      setActiveJobId(jobId);

      if (initData.mode === 'background') {
        // True background processing — survives tab close.
        try {
          localStorage.setItem(JOB_KEY, JSON.stringify({
            jobId, mode: 'background', startedAt, estimatedMs,
            totalRecords: fullData.length, fileName: fileName || file?.name || '',
          }));
        } catch {}
        startBackgroundPolling(jobId, fullData.length);
      } else {
        // Client-driven fallback (QStash not configured).
        try {
          localStorage.setItem(JOB_KEY, JSON.stringify({
            jobId, mode: 'client', startedAt, estimatedMs,
            totalRecords: fullData.length, fileName: fileName || file?.name || '',
            records: fullData, columnMap, completedChunks: 0, resultsSoFar: [],
          }));
        } catch {}
        await runChunkedTrace(jobId, fullData, columnMap, startedAt, estimatedMs, 0, []);
      }
    } catch (err: any) {
      setError(err.message || 'Could not start skip trace.');
      setStep('map');
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `propytrace_${fileName || file?.name || 'results'}_${Date.now()}.csv`;
    link.click();
  };

  const reset = () => {
    clearTimers();
    setActiveJobId(null);
    setCancelling(false);
    setDoneCancelled(false);
    setStep('upload');
    setFile(null);
    setFileName('');
    setHeaders([]);
    setFullData([]);
    setPreviewData([]);
    setResult(null);
    setDownloadUrl(null);
    setError('');
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    try { localStorage.removeItem(JOB_KEY); } catch {}
  };

  const mapLabels: Record<string, string> = {
    firstName: 'First Name', lastName: 'Last Name',
    street: 'Street Address', city: 'City', state: 'State', zip: 'ZIP Code',
    mailingStreet: 'Mailing Address', mailingCity: 'Mailing City',
    mailingState: 'Mailing State', mailingZip: 'Mailing ZIP',
  };
  const requiredFields = ['firstName', 'lastName', 'city', 'state'];
  const mailingFields = ['mailingStreet', 'mailingCity', 'mailingState', 'mailingZip'];
  const primaryFields = ['firstName', 'lastName', 'street', 'city', 'state', 'zip'];

  const stepOrder: Step[] = ['upload', 'map', 'processing', 'done'];
  const stepIdx = stepOrder.indexOf(step);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepOrder.map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: step === s ? 'var(--navy)' : idx < stepIdx ? '#d1fae5' : 'var(--border)',
                color: step === s ? '#fff' : idx < stepIdx ? '#065f46' : 'var(--text-2)',
              }}
            >
              {idx < stepIdx ? '✓' : idx + 1}
            </div>
            <span className="text-sm hidden sm:block font-medium" style={{ color: step === s ? 'var(--text-1)' : 'var(--text-2)' }}>
              {s === 'upload' ? 'Upload' : s === 'map' ? 'Map Columns' : s === 'processing' ? 'Processing' : 'Done'}
            </span>
            {idx < 3 && <div className="w-8 h-px mx-1" style={{ background: 'var(--border)' }} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-start gap-3">
          <span className="text-lg shrink-0">⚠️</span>
          <div>
            <p>{error}</p>
            {error.includes('credits') && (
              <button onClick={onBuyCredits} className="mt-1 underline font-medium" style={{ color: 'var(--blue)' }}>
                Buy more credits →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div
          className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all"
          style={{
            borderColor: dragOver ? 'var(--blue)' : 'var(--border-strong)',
            background: dragOver ? 'var(--blue-light)' : 'var(--bg-surface)',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={e => { if (!dragOver) (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue)'; }}
          onMouseLeave={e => { if (!dragOver) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
        >
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <div className="text-5xl mb-4">{dragOver ? '📂' : '📁'}</div>
          <p className="text-xl font-semibold mb-2" style={{ color: 'var(--navy)' }}>
            {dragOver ? 'Drop your CSV here' : 'Upload your property list'}
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>Drag & drop or click to browse · CSV files only</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {['PropStream', 'ListSource', 'BatchLeads', 'DealMachine', 'Any CSV'].map(s => (
              <span key={s} className="px-2.5 py-1 rounded-full" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Map */}
      {step === 'map' && (
        <div className="space-y-6">
          <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--navy)' }}>Map Your Columns</h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>{fileName || file?.name} · {fullData.length.toLocaleString()} records</p>
              </div>
              <button onClick={reset} className="text-sm transition-colors" style={{ color: 'var(--text-2)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-1)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'}
              >
                ← Change file
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {primaryFields.map((key) => (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-2)' }}>
                    {mapLabels[key]} {requiredFields.includes(key) && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={(columnMap as any)[key]}
                    onChange={(e) => setColumnMap((prev: any) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                  >
                    <option value="">— Not mapped —</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="border-t pt-5 mt-2" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-2)' }}>
                Mailing Address <span className="normal-case font-normal">(optional — used as fallback)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mailingFields.map((key) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-2)' }}>
                      {mapLabels[key]}
                    </label>
                    <select
                      value={(columnMap as any)[key]}
                      onChange={(e) => setColumnMap((prev: any) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
                      style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                    >
                      <option value="">— Not mapped —</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--navy)' }}>Data Preview</h3>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--blue-light)' }}>
                    {headers.slice(0, 5).map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold" style={{ color: 'var(--navy)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {previewData.map((row, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-base)' }}>
                      {headers.slice(0, 5).map(h => (
                        <td key={h} className="px-3 py-2.5 truncate max-w-[120px]" style={{ color: 'var(--text-2)' }}>{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Credit summary */}
          <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>Credits required</p>
                <p className="text-3xl font-black" style={{ color: 'var(--navy)' }}>{fullData.length.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>Your balance</p>
                <p className="text-3xl font-black" style={{ color: credits >= fullData.length ? '#059669' : '#dc2626' }}>
                  {credits.toLocaleString()}
                </p>
              </div>
            </div>

            {credits < fullData.length ? (
              <button
                onClick={onBuyCredits}
                className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all hover:opacity-90"
                style={{ background: '#d97706' }}
              >
                💳 Buy {(fullData.length - credits).toLocaleString()} More Credits to Continue
              </button>
            ) : (
              <button
                onClick={handleStartTrace}
                className="w-full text-white font-black py-3.5 px-6 rounded-xl transition-all hover:opacity-90 hover:scale-[1.01] text-lg shadow-lg"
                style={{ background: 'var(--navy)' }}
              >
                ⚡ Launch Skip Trace
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === 'processing' && (
        <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <style>{`
            @keyframes radar-pulse {
              0%   { transform: scale(0.3); opacity: 0.8; }
              100% { transform: scale(2.8); opacity: 0; }
            }
            @keyframes scan-rotate {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @keyframes dot-pop {
              0%,100% { transform: scale(0); opacity: 0; }
              30%,70% { transform: scale(1); opacity: 1; }
            }
            @keyframes float-up {
              0%   { transform: translateY(0); opacity: 1; }
              100% { transform: translateY(-40px); opacity: 0; }
            }
            .radar-ring-1 { animation: radar-pulse 2s ease-out infinite; }
            .radar-ring-2 { animation: radar-pulse 2s ease-out infinite 0.66s; }
            .radar-ring-3 { animation: radar-pulse 2s ease-out infinite 1.33s; }
            .scan-line    { animation: scan-rotate 2s linear infinite; transform-origin: 50% 50%; }
            .dot-a { animation: dot-pop 2s ease-in-out infinite 0.3s; }
            .dot-b { animation: dot-pop 2s ease-in-out infinite 0.9s; }
            .dot-c { animation: dot-pop 2s ease-in-out infinite 1.5s; }
            .dot-d { animation: dot-pop 2s ease-in-out infinite 0.6s; }
            .float-phone { animation: float-up 1.8s ease-out infinite; }
            .float-email { animation: float-up 1.8s ease-out infinite 0.9s; }
          `}</style>

          <div className="relative flex items-center justify-center pt-10 pb-4" style={{ height: 260, background: 'linear-gradient(180deg, #0f2a5e 0%, #1d4ed8 100%)' }}>
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 260">
              {Array.from({length: 8}).map((_,r) => Array.from({length:13}).map((_,c) => (
                <circle key={`${r}-${c}`} cx={15+c*30} cy={15+r*30} r="1" fill="#93c5fd"/>
              )))}
            </svg>

            <div className="float-phone absolute text-white text-lg font-bold" style={{top:40,left:'30%'}}>📞</div>
            <div className="float-email absolute text-white text-lg" style={{top:50,left:'62%'}}>✉️</div>

            <svg width="200" height="200" viewBox="0 0 200 200" className="relative z-10">
              <circle cx="100" cy="100" r="90" fill="rgba(15,42,94,0.7)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>

              <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" className="radar-ring-1"/>
              <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" className="radar-ring-2"/>
              <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" className="radar-ring-3"/>

              <g className="scan-line">
                <path d="M100 100 L100 10" stroke="url(#sweepW)" strokeWidth="2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="sweepW" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="white" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="white" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M100 100 L100 10 A90 90 0 0 1 190 100 Z" fill="rgba(255,255,255,0.07)"/>
              </g>

              <circle cx="140" cy="55" r="5" fill="white" className="dot-a"/>
              <circle cx="55"  cy="130" r="4" fill="white" opacity="0.7" className="dot-b"/>
              <circle cx="160" cy="145" r="5" fill="white" className="dot-c"/>
              <circle cx="70"  cy="50"  r="4" fill="white" opacity="0.7" className="dot-d"/>

              <circle cx="100" cy="100" r="5" fill="white"/>
              <circle cx="100" cy="100" r="3" fill="#0f2a5e"/>
            </svg>
          </div>

          <div className="px-8 py-5" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>{processingMsg}</p>
              <span className="text-2xl font-black" style={{ color: 'var(--blue)' }}>{processingPct}%</span>
            </div>
            <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${processingPct}%`, background: 'var(--navy)' }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                {fullData.length.toLocaleString()} records · scanning with up to 5 retries
              </p>
              <p className="text-xs font-semibold" style={{ color: 'var(--blue)' }}>
                {etaSeconds > 0
                  ? `~${etaSeconds >= 60 ? `${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s` : `${etaSeconds}s`} remaining`
                  : 'Finishing up...'}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-2)' }}>
                Your job runs in the background — safe to close this tab and come back later.
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onTraceComplete()}
                  className="font-semibold whitespace-nowrap"
                  style={{ color: 'var(--blue)' }}
                >
                  View Job History →
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="font-semibold whitespace-nowrap px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50"
                  style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 'done' && result && (
        <div className="space-y-6">
          <div className="rounded-2xl p-8 text-center border" style={{ background: doneCancelled ? '#fffbeb' : '#f0fdf4', borderColor: doneCancelled ? '#fde68a' : '#bbf7d0' }}>
            <div className="text-5xl mb-4">{doneCancelled ? '🛑' : '🎉'}</div>
            <h3 className="text-2xl font-black mb-1" style={{ color: 'var(--navy)' }}>
              {doneCancelled ? 'Job Cancelled' : 'Skip Trace Complete!'}
            </h3>
            <p style={{ color: 'var(--text-2)' }}>
              {doneCancelled
                ? 'Processing stopped. You can download the records completed so far.'
                : 'Your results are ready to download.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Records Processed', value: result.total.toLocaleString(), color: 'var(--navy)' },
              { label: 'Contacts Found', value: result.hits.toLocaleString(), color: '#059669' },
              { label: 'Hit Rate', value: `${Math.round((result.hits / result.total) * 100)}%`, color: 'var(--blue)' },
            ].map(card => (
              <div key={card.label} className="rounded-2xl p-5 text-center border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <p className="text-3xl font-black" style={{ color: card.color }}>{card.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{card.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={!downloadUrl}
              className="flex-1 text-white font-black py-3.5 px-6 rounded-xl transition-all hover:opacity-90 hover:scale-[1.01] text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--navy)' }}
            >
              {downloadUrl ? '⬇ Download Results CSV' : 'No records to download'}
            </button>
            <button
              onClick={() => { reset(); onTraceComplete(); }}
              className="px-6 py-3.5 font-semibold rounded-xl transition-all border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
            >
              View History
            </button>
            <button
              onClick={reset}
              className="px-6 py-3.5 font-semibold rounded-xl transition-all border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
            >
              New Trace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
