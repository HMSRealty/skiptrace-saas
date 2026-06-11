'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface Props {
  session: any;
  onCreditsPurchased: () => void;
}

const MIN_CREDITS = 100;

// Per-credit price tiers (USD)
function pricePerCredit(qty: number): number {
  if (qty < 10000) return 0.06;
  if (qty < 30000) return 0.045;
  return 0.025;
}

function totalPrice(qty: number): number {
  return qty * pricePerCredit(qty);
}

const tiers = [
  { range: '1 — 9,999', rate: '$0.060', sub: 'per credit' },
  { range: '10,000 — 29,999', rate: '$0.045', sub: 'per credit · save 25%' },
  { range: '30,000 +', rate: '$0.025', sub: 'per credit · save 58%' },
];

const presets = [500, 2000, 10000, 30000];

export default function BuyCreditsView({ session }: Props) {
  const [currentCredits, setCurrentCredits] = useState<number | null>(null);
  const [custom, setCustom] = useState<string>('1000');

  useEffect(() => {
    supabase.from('profiles').select('credits_balance').eq('id', session.user.id).single()
      .then(({ data }) => { if (data) setCurrentCredits(data.credits_balance); });
  }, []);

  const customNum = Math.max(0, parseInt(custom || '0', 10) || 0);
  const customValid = customNum >= MIN_CREDITS;
  const customTotal = customValid ? totalPrice(customNum) : 0;

  const mailtoFor = (qty: number, price: number) =>
    `mailto:Support@Propyleads.com?subject=Buy ${qty.toLocaleString()} Credits&body=Hi, I'd like to purchase ${qty.toLocaleString()} credits ($${price.toFixed(2)}). My account is ${session.user.email}.`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--navy)' }}>Buy Credits</h1>
        <p className="max-w-lg mx-auto" style={{ color: 'var(--text-2)' }}>
          Credits never expire. One credit = one skip-trace record. Volume discounts apply automatically.
        </p>
        {currentCredits !== null && (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm border" style={{ background: 'var(--blue-light)', borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--text-2)' }}>Current balance:</span>
            <span className="font-bold" style={{ color: 'var(--blue)' }}>{currentCredits.toLocaleString()} credits</span>
          </div>
        )}
      </div>

      {/* Pricing tiers */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-2)' }}>Volume pricing</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiers.map(t => (
            <div key={t.range} className="rounded-2xl p-6 border-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-2)' }}>{t.range}</p>
              <p className="text-4xl font-black" style={{ color: 'var(--navy)' }}>{t.rate}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{t.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom credit amount */}
      <div className="rounded-2xl p-6 border-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--navy)' }}>Choose your amount</h2>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>Minimum {MIN_CREDITS} credits.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => setCustom(String(p))}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                style={{
                  background: customNum === p ? 'var(--navy)' : 'var(--bg-base)',
                  color: customNum === p ? '#fff' : 'var(--text-2)',
                  borderColor: 'var(--border)',
                }}
              >
                {p.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-2)' }}>Number of credits</label>
            <input
              type="number"
              min={MIN_CREDITS}
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-bold"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--navy)' }}
              placeholder={`${MIN_CREDITS}`}
            />
            {!customValid && customNum > 0 && (
              <p className="text-xs mt-1.5 text-red-600">Minimum {MIN_CREDITS} credits.</p>
            )}
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--blue-light)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Total price</p>
            <p className="text-4xl font-black" style={{ color: 'var(--navy)' }}>
              ${customTotal.toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>
              {customValid ? `${customNum.toLocaleString()} credits @ $${pricePerCredit(customNum).toFixed(3)}/credit` : ' '}
            </p>
          </div>
        </div>

        <a
          href={customValid ? mailtoFor(customNum, customTotal) : '#'}
          onClick={e => { if (!customValid) e.preventDefault(); }}
          className="mt-5 w-full inline-flex items-center justify-center font-bold text-sm px-6 py-3.5 rounded-xl text-white transition-all hover:opacity-90"
          style={{ background: customValid ? 'var(--navy)' : 'var(--text-2)', opacity: customValid ? 1 : 0.5, cursor: customValid ? 'pointer' : 'not-allowed' }}
        >
          {customValid
            ? `Buy ${customNum.toLocaleString()} credits — $${customTotal.toFixed(2)}`
            : `Enter at least ${MIN_CREDITS} credits to continue`}
        </a>
      </div>

      {/* Coming-soon note */}
      <div className="rounded-2xl p-5 text-center border-2 border-dashed" style={{ borderColor: 'var(--border-strong)', background: 'var(--blue-light)' }}>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          🚧 Online payments are coming soon. Click the button above to email us — we&apos;ll set up your credits within minutes.
        </p>
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '♾️', title: 'Credits Never Expire', desc: 'Use them at your own pace.' },
          { icon: '🎯', title: 'Up to 5 Retries', desc: 'Auto-retries to maximize hit rate.' },
          { icon: '⚡', title: 'Instant Results', desc: 'Phones and emails in minutes.' },
        ].map(item => (
          <div key={item.title} className="flex items-start gap-3 rounded-xl p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-1)' }}>{item.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
