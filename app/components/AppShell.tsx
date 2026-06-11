'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import DashboardView from './DashboardView';
import NewTraceView from './NewTraceView';
import ListBuilderView from './ListBuilderView';
import HistoryView from './HistoryView';
import BuyCreditsView from './BuyCreditsView';

type View = 'dashboard' | 'new-trace' | 'list-builder' | 'history' | 'buy-credits';
interface Props { session: any; }
interface ColumnMap {
  firstName: string; lastName: string; street: string; city: string; state: string; zip: string;
  mailingStreet: string; mailingCity: string; mailingState: string; mailingZip: string;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )},
  { id: 'list-builder', label: 'Build a List', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
  { id: 'new-trace', label: 'New Trace', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )},
  { id: 'history', label: 'Job History', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )},
  { id: 'buy-credits', label: 'Buy Credits', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )},
] as const;

export default function AppShell({ session }: Props) {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [credits, setCredits] = useState(0);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Handoff from the List Builder into a new trace.
  const [pulledList, setPulledList] = useState<{ records: Record<string, string>[]; columnMap: ColumnMap; fileName: string } | null>(null);

  const startTraceFromList = (records: Record<string, string>[], columnMap: ColumnMap, fileName: string) => {
    setPulledList({ records, columnMap, fileName });
    setActiveView('new-trace');
  };

  const fetchCredits = async () => {
    setLoadingCredits(true);
    const { data } = await supabase.from('profiles').select('credits_balance').eq('id', session.user.id).single();
    if (data) setCredits(data.credits_balance ?? 0);
    setLoadingCredits(false);
  };

  useEffect(() => { fetchCredits(); }, []);

  const userInitial = session.user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-60' : 'w-16'} shrink-0 flex flex-col transition-all duration-200`}
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0" style={{ background: 'var(--navy)' }}>P</div>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight" style={{ color: 'var(--navy)' }}>PropTrace</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>PRO</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 mt-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeView === item.id ? 'var(--blue-light)' : 'transparent',
                color: activeView === item.id ? 'var(--blue)' : 'var(--text-2)',
              }}
              onMouseEnter={e => { if (activeView !== item.id) (e.currentTarget as HTMLElement).style.background = 'var(--bg-base)'; }}
              onMouseLeave={e => { if (activeView !== item.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.id === 'new-trace' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'var(--blue)', color: 'white' }}>NEW</span>
              )}
            </button>
          ))}
        </nav>

        {/* Credits */}
        {sidebarOpen && (
          <div className="m-3 p-4 rounded-xl" style={{ background: 'var(--blue-light)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>Credits remaining</p>
            <p className="text-2xl font-black" style={{ color: 'var(--navy)' }}>{loadingCredits ? '—' : credits.toLocaleString()}</p>
            <button onClick={() => setActiveView('buy-credits')} className="mt-1 text-xs font-semibold transition-colors" style={{ color: 'var(--blue)' }}>
              + Add credits →
            </button>
          </div>
        )}

        {/* User */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: 'var(--navy)' }}>
              {userInitial}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>{session.user.email}</p>
                <button onClick={() => supabase.auth.signOut()} className="text-xs transition-colors hover:text-red-500" style={{ color: 'var(--text-2)' }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center px-6 gap-4" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--text-2)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="font-bold" style={{ color: 'var(--navy)' }}>{navItems.find(n => n.id === activeView)?.label}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--blue-light)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-2)' }}>Credits:</span>
              <span className="font-bold" style={{ color: 'var(--blue)' }}>{loadingCredits ? '—' : credits.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setActiveView('new-trace')}
              className="text-white font-bold text-sm px-4 py-1.5 rounded-lg transition-all hover:opacity-90 shadow-md"
              style={{ background: 'var(--navy)' }}
            >
              + New Trace
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {activeView === 'dashboard' && <DashboardView session={session} credits={credits} onNavigate={setActiveView} onRefreshCredits={fetchCredits} />}
          {activeView === 'list-builder' && <ListBuilderView onStartTrace={startTraceFromList} />}
          {activeView === 'new-trace' && (
            <NewTraceView
              session={session}
              credits={credits}
              initialRecords={pulledList?.records || null}
              initialColumnMap={pulledList?.columnMap || null}
              initialFileName={pulledList?.fileName || null}
              onTraceComplete={() => { fetchCredits(); setPulledList(null); setActiveView('history'); }}
              onBuyCredits={() => setActiveView('buy-credits')}
            />
          )}
          {activeView === 'history' && <HistoryView session={session} />}
          {activeView === 'buy-credits' && <BuyCreditsView session={session} onCreditsPurchased={fetchCredits} />}
        </main>
      </div>
    </div>
  );
}
