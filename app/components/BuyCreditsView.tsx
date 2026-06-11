'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface Props {
  session: any;
  onCreditsPurchased: () => void;
}

const packages = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 500,
    price: 49,
    pricePerRecord: '0.098',
    badge: null,
    highlight: false,
    features: ['500 skip traces', 'Phone + email lookup', 'CSV export', 'Email support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    credits: 2000,
    price: 149,
    pricePerRecord: '0.075',
    badge: 'Most Popular',
    highlight: true,
    features: ['2,000 skip traces', 'Phone + email lookup', 'CSV export', 'Priority support', '24% savings vs Starter'],
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 5000,
    price: 299,
    pricePerRecord: '0.060',
    badge: 'Best Value',
    highlight: false,
    features: ['5,000 skip traces', 'Phone + email lookup', 'CSV export', 'Priority support', '39% savings vs Starter'],
  },
  {
    id: 'scale',
    name: 'Scale',
    credits: 25000,
    price: 999,
    pricePerRecord: '0.040',
    badge: null,
    highlight: false,
    features: ['25,000 skip traces', 'Phone + email lookup', 'CSV export', 'Dedicated support', '59% savings vs Starter'],
  },
];

export default function BuyCreditsView({ session }: Props) {
  const [currentCredits, setCurrentCredits] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('profiles').select('credits_balance').eq('id', session.user.id).single()
      .then(({ data }) => { if (data) setCurrentCredits(data.credits_balance); });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--navy)' }}>Buy Credits</h1>
        <p className="max-w-lg mx-auto" style={{ color: 'var(--text-2)' }}>
          Credits never expire. One credit = one skip trace record. Buy once, use whenever you need.
        </p>
        {currentCredits !== null && (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm border" style={{ background: 'var(--blue-light)', borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--text-2)' }}>Current balance:</span>
            <span className="font-bold" style={{ color: 'var(--blue)' }}>{currentCredits.toLocaleString()} credits</span>
          </div>
        )}
      </div>

      {/* Coming soon banner */}
      <div className="rounded-2xl p-6 text-center border-2 border-dashed" style={{ borderColor: 'var(--border-strong)', background: 'var(--blue-light)' }}>
        <p className="text-2xl mb-2">🚧</p>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--navy)' }}>Online payments coming soon</h2>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          To purchase credits right now, reach out and we'll get you set up manually.
        </p>
        <a
          href={`mailto:support@proptrace.app?subject=Credits Purchase&body=Hi, I'd like to buy credits. My account is ${session.user.email}.`}
          className="inline-block mt-4 font-semibold text-sm px-6 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
          style={{ background: 'var(--navy)' }}
        >
          Contact us to buy credits →
        </a>
      </div>

      {/* Pricing cards — reference only */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-2)' }}>Pricing</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="relative rounded-2xl p-6 flex flex-col border-2"
              style={{
                background: pkg.highlight ? 'var(--navy)' : 'var(--bg-surface)',
                borderColor: pkg.highlight ? 'var(--navy)' : 'var(--border)',
              }}
            >
              {pkg.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: 'var(--blue)' }}>
                    {pkg.badge}
                  </span>
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-lg font-bold" style={{ color: pkg.highlight ? '#ffffff' : 'var(--text-1)' }}>{pkg.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black" style={{ color: pkg.highlight ? '#ffffff' : 'var(--navy)' }}>${pkg.price}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: pkg.highlight ? '#93c5fd' : 'var(--text-2)' }}>
                  ${pkg.pricePerRecord} per record
                </p>
              </div>
              <div className="rounded-xl px-4 py-3 mb-5 text-center" style={{ background: pkg.highlight ? 'rgba(255,255,255,0.1)' : 'var(--blue-light)' }}>
                <p className="text-2xl font-black" style={{ color: pkg.highlight ? '#60a5fa' : 'var(--blue)' }}>{pkg.credits.toLocaleString()}</p>
                <p className="text-xs" style={{ color: pkg.highlight ? '#93c5fd' : 'var(--text-2)' }}>credits</p>
              </div>
              <ul className="space-y-2 flex-1">
                {pkg.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: pkg.highlight ? '#bfdbfe' : 'var(--text-2)' }}>
                    <span className="mt-0.5 shrink-0" style={{ color: pkg.highlight ? '#34d399' : '#059669' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '♾️', title: 'Credits Never Expire', desc: 'Use them at your own pace.' },
          { icon: '🎯', title: 'Up to 5 Retries', desc: 'Auto-retries to maximize your hit rate.' },
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
