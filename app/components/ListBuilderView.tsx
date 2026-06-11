'use client';
import { useState, useEffect, useRef } from 'react';
import { PROVIDER_COLUMN_MAP } from '../lib/propertyProvider';

interface ColumnMap {
  firstName: string; lastName: string; street: string; city: string; state: string; zip: string;
  mailingStreet: string; mailingCity: string; mailingState: string; mailingZip: string;
}

interface Props {
  onStartTrace: (records: Record<string, string>[], columnMap: ColumnMap, fileName: string) => void;
}

interface Filters {
  state: string; city: string; zip: string;
  minEquityPct: number;
  ownerType: 'any' | 'absentee' | 'owner-occupied';
  propertyType: 'any' | 'single-family' | 'multi-family' | 'condo' | 'land';
  limit: number;
}

const ownerTypes = [
  { id: 'any', label: 'Any owner' },
  { id: 'absentee', label: 'Absentee owners' },
  { id: 'owner-occupied', label: 'Owner-occupied' },
] as const;

const propertyTypes = [
  { id: 'any', label: 'Any type' },
  { id: 'single-family', label: 'Single family' },
  { id: 'multi-family', label: 'Multi family' },
  { id: 'condo', label: 'Condo' },
  { id: 'land', label: 'Vacant land' },
] as const;

const limits = [100, 250, 500, 1000, 2500];

export default function ListBuilderView({ onStartTrace }: Props) {
  const [filters, setFilters] = useState<Filters>({
    state: '', city: '', zip: '', minEquityPct: 40, ownerType: 'absentee', propertyType: 'single-family', limit: 250,
  });
  const [estimate, setEstimate] = useState<number | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [pulling, setPulling] = useState(false);
  const [error, setError] = useState('');
  const debounce = useRef<any>(null);

  const hasGeo = !!(filters.state || filters.city || filters.zip);

  // Live market-size estimate as filters change.
  useEffect(() => {
    if (!hasGeo) { setEstimate(null); return; }
    setEstimating(true);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/property-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'estimate', ...filters }),
        });
        const data = await res.json();
        if (res.ok) setEstimate(data.estimate);
      } catch { /* ignore */ }
      finally { setEstimating(false); }
    }, 450);
    return () => clearTimeout(debounce.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.state, filters.city, filters.zip, filters.minEquityPct, filters.ownerType, filters.propertyType]);

  const update = (patch: Partial<Filters>) => setFilters(prev => ({ ...prev, ...patch }));

  const buildPreview = async () => {
    setError('');
    if (!hasGeo) { setError('Enter at least a state, city, or ZIP.'); return; }
    setPulling(true);
    try {
      const res = await fetch('/api/property-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pull', ...filters, limit: Math.min(10, filters.limit) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not build preview');
      setPreview(data.records);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPulling(false);
    }
  };

  const pullAndTrace = async () => {
    setError('');
    if (!hasGeo) { setError('Enter at least a state, city, or ZIP.'); return; }
    setPulling(true);
    try {
      const res = await fetch('/api/property-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pull', ...filters }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not build list');
      const where = filters.zip || filters.city || filters.state;
      onStartTrace(data.records, PROVIDER_COLUMN_MAP, `List — ${where} (${data.count})`);
    } catch (err: any) {
      setError(err.message);
      setPulling(false);
    }
  };

  const previewCols = preview.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--navy)' }}>
          Build a List <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>NEW</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
          Target owners by location, equity, and type — then skip trace the whole list in one click. No external list provider needed.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">{error}</div>
      )}

      {/* Filters */}
      <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {([['state', 'State', 'GA'], ['city', 'City', 'Atlanta'], ['zip', 'ZIP', '30312']] as const).map(([key, label, ph]) => (
            <div key={key}>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-2)' }}>{label}</label>
              <input
                value={(filters as any)[key]}
                onChange={e => update({ [key]: e.target.value } as any)}
                placeholder={ph}
                className="w-full border rounded-xl px-3 py-2.5 outline-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-2)' }}>Owner type</label>
            <select value={filters.ownerType} onChange={e => update({ ownerType: e.target.value as any })}
              className="w-full border rounded-xl px-3 py-2.5 outline-none text-sm" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-1)' }}>
              {ownerTypes.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-2)' }}>Property type</label>
            <select value={filters.propertyType} onChange={e => update({ propertyType: e.target.value as any })}
              className="w-full border rounded-xl px-3 py-2.5 outline-none text-sm" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-1)' }}>
              {propertyTypes.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-2)' }}>
            <span>Min. estimated equity</span>
            <span className="text-sm font-black" style={{ color: 'var(--blue)' }}>{filters.minEquityPct}%+</span>
          </label>
          <input type="range" min={0} max={100} step={5} value={filters.minEquityPct}
            onChange={e => update({ minEquityPct: Number(e.target.value) })} className="w-full accent-blue-600" />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-2)' }}>List size</label>
          <div className="flex flex-wrap gap-2">
            {limits.map(l => (
              <button key={l} onClick={() => update({ limit: l })}
                className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
                style={{
                  background: filters.limit === l ? 'var(--navy)' : 'var(--bg-base)',
                  color: filters.limit === l ? '#fff' : 'var(--text-1)',
                  borderColor: filters.limit === l ? 'var(--navy)' : 'var(--border)',
                }}>
                {l.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estimate + actions */}
      <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>Matching properties in market</p>
            <p className="text-3xl font-black" style={{ color: 'var(--navy)' }}>
              {!hasGeo ? '—' : estimating ? '…' : estimate != null ? estimate.toLocaleString() : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>You'll pull</p>
            <p className="text-3xl font-black" style={{ color: 'var(--blue)' }}>{filters.limit.toLocaleString()}</p>
            <p className="text-xs" style={{ color: '#059669' }}>✓ Only charged for contacts found</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={buildPreview} disabled={pulling || !hasGeo}
            className="px-5 py-3 font-semibold rounded-xl border transition-all disabled:opacity-50"
            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-1)' }}>
            Preview sample
          </button>
          <button onClick={pullAndTrace} disabled={pulling || !hasGeo}
            className="flex-1 text-white font-black py-3 px-6 rounded-xl transition-all hover:opacity-90 hover:scale-[1.01] shadow-lg disabled:opacity-50"
            style={{ background: 'var(--navy)' }}>
            {pulling ? 'Building list…' : `⚡ Pull ${filters.limit.toLocaleString()} & Skip Trace →`}
          </button>
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--navy)' }}>Sample preview ({preview.length} of {filters.limit.toLocaleString()})</h3>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--blue-light)' }}>
                  {previewCols.slice(0, 6).map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap" style={{ color: 'var(--navy)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {preview.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-base)' }}>
                    {previewCols.slice(0, 6).map(h => (
                      <td key={h} className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--text-2)' }}>{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
