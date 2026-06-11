'use client';
import { useState } from 'react';
import { supabase } from '../supabase';

type Mode = 'signin' | 'signup' | 'forgot';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Account created! Check your email to confirm, then sign in.');
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });
        if (error) throw error;
        setSuccessMsg('Password reset email sent. Check your inbox.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Process thousands of records in minutes with parallel searches' },
    { icon: '🎯', title: 'Up to 5 Retries', desc: 'Auto-retries missed records to maximize your hit rate' },
    { icon: '📞', title: 'Primary Phone + Email', desc: 'Verified primary phone and email — never miss a contact' },
    { icon: '🔒', title: 'Secure & Private', desc: 'Bank-level encryption. Your data stays yours.' },
  ];

  const headings: Record<Mode, { title: string; sub: string }> = {
    signin:  { title: 'Welcome back',          sub: 'Sign in to your dashboard.' },
    signup:  { title: 'Create your account',   sub: 'Get started in seconds.' },
    forgot:  { title: 'Reset your password',   sub: 'Enter your email and we will send you a reset link.' },
  };

  const buttonText: Record<Mode, string> = {
    signin: 'Sign In',
    signup: 'Create Account',
    forgot: 'Send Reset Link',
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16" style={{ background: 'var(--navy)' }}>
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-base">PL</div>
            <div>
              <span className="text-white font-black text-xl tracking-tight">PropyLeads</span>
              <span className="text-blue-300 text-xs ml-2 font-medium">PRO</span>
            </div>
          </div>

          <h1 className="text-5xl font-black text-white leading-tight mb-5">
            Find every owner.<br />
            <span className="text-blue-300">Miss nothing.</span>
          </h1>
          <p className="text-lg mb-12 text-blue-200">
            Upload your property list. Get verified phones and emails in minutes — automatically retried until we find them.
          </p>

          <div className="space-y-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-white/10">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{f.title}</h3>
                  <p className="text-sm text-blue-200">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-blue-300">
          <span>✓ Credits never expire</span>
          <span>✓ Pay per record</span>
          <span>✓ No subscriptions</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'var(--bg-base)' }}>
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base" style={{ background: 'var(--navy)' }}>PL</div>
            <span className="font-black text-xl tracking-tight" style={{ color: 'var(--navy)' }}>PropyLeads</span>
          </div>

          <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--navy)' }}>
            {headings[mode].title}
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-2)' }}>
            {headings[mode].sub}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-1)' }}>Email address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                placeholder="you@example.com" required
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                      className="text-xs font-semibold transition-colors"
                      style={{ color: 'var(--blue)' }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                  placeholder="••••••••" required
                />
              </div>
            )}

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>}
            {successMsg && <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl p-3">{successMsg}</div>}

            <button
              type="submit" disabled={loading}
              className="w-full text-white font-bold py-3.5 px-6 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
              style={{ background: 'var(--navy)' }}
            >
              {loading ? 'Processing...' : buttonText[mode]}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-2)' }}>
            {mode === 'signin' && (
              <>
                Don&apos;t have an account?
                <button onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }} className="ml-2 font-semibold transition-colors" style={{ color: 'var(--blue)' }}>
                  Sign up
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?
                <button onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }} className="ml-2 font-semibold transition-colors" style={{ color: 'var(--blue)' }}>
                  Sign in
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <button onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }} className="font-semibold transition-colors" style={{ color: 'var(--blue)' }}>
                ← Back to sign in
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
