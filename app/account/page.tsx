'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import type { BillingStatus } from '@/lib/types';
import { CheckCircle2, Lock, Mail, CreditCard, Receipt, ShieldCheck } from 'lucide-react';

export default function AccountPage() {
  return (
    <AppShell>
      <Account />
    </AppShell>
  );
}

function Account() {
  const { user } = useAuth();
  if (!user) return null;
  const isGoogle = user.authProvider === 'google';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Account</h1>
        <p className="mt-1 text-ink-soft">Manage your profile, security, and plan.</p>
      </div>

      <ProfileCard />
      {isGoogle ? <GoogleNote /> : <EmailCard />}
      {!isGoogle && <PasswordCard />}
      <PlanCard />
    </div>
  );
}

function err(e: unknown) {
  return e instanceof ApiError ? e.message : 'Something went wrong.';
}

function Card({ title, icon: Icon, children }: { title: string; icon: typeof Lock; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
        <Icon className="h-5 w-5 text-ink-soft" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function ProfileCard() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const save = async () => {
    setMsg('');
    setError('');
    setLoading(true);
    try {
      const { user } = await api.updateProfile(name);
      setUser(user);
      setMsg('Profile updated.');
    } catch (e) {
      setError(err(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Profile" icon={ShieldCheck}>
      <label htmlFor="acc-name" className="label">Name</label>
      <div className="flex gap-2">
        <input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
        <button onClick={save} disabled={loading || !name.trim() || name === user?.name} className="btn-primary shrink-0">
          {loading ? <Spinner /> : 'Save'}
        </button>
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
        <Mail className="h-4 w-4 text-ink-muted" />
        {user?.email}
        {user?.emailVerified && <span className="badge bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Verified</span>}
      </p>
      {msg && <p className="mt-3 text-sm text-emerald-600">{msg}</p>}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </Card>
  );
}

function GoogleNote() {
  return (
    <Card title="Sign-in" icon={ShieldCheck}>
      <p className="text-sm text-ink-soft">
        You signed in with Google, so your email and password are managed by your Google account.
      </p>
    </Card>
  );
}

function EmailCard() {
  const { setUser } = useAuth();
  const [step, setStep] = useState<'idle' | 'request' | 'otp'>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const request = async () => {
    setError('');
    setMsg('');
    setLoading(true);
    try {
      await api.requestEmailChange(newEmail, password);
      setStep('otp');
      setMsg(`We sent a 4-digit code to ${newEmail}.`);
      setPassword('');
    } catch (e) {
      setError(err(e));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError('');
    setLoading(true);
    try {
      const { user } = await api.verifyEmailChange(code);
      setUser(user);
      setStep('idle');
      setNewEmail('');
      setCode('');
      setMsg('Email updated.');
    } catch (e) {
      setError(err(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Change email" icon={Mail}>
      {step === 'idle' && (
        <button onClick={() => setStep('request')} className="btn-outline">Change email address</button>
      )}
      {step === 'request' && (
        <div className="space-y-3">
          <div>
            <label htmlFor="ne" className="label">New email</label>
            <input id="ne" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="input" placeholder="new@example.com" />
          </div>
          <div>
            <label htmlFor="np" className="label">Confirm with your password</label>
            <input id="np" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
          </div>
          <div className="flex gap-2">
            <button onClick={request} disabled={loading || !newEmail || !password} className="btn-brand">
              {loading ? <Spinner /> : 'Send code'}
            </button>
            <button onClick={() => setStep('idle')} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}
      {step === 'otp' && (
        <div className="space-y-3">
          <div>
            <label htmlFor="ec" className="label">Enter the code sent to {newEmail}</label>
            <input
              id="ec"
              inputMode="numeric"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="input max-w-[10rem] text-center text-xl font-bold tracking-[0.4em]"
              placeholder="0000"
            />
          </div>
          <button onClick={verify} disabled={loading || code.length !== 4} className="btn-brand">
            {loading ? <Spinner /> : 'Verify & update email'}
          </button>
        </div>
      )}
      {msg && <p className="mt-3 text-sm text-emerald-600">{msg}</p>}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </Card>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const save = async () => {
    setMsg('');
    setError('');
    setLoading(true);
    try {
      await api.changePassword(current, next);
      setCurrent('');
      setNext('');
      setMsg('Password changed. Other devices have been signed out.');
    } catch (e) {
      setError(err(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Change password" icon={Lock}>
      <div className="space-y-3">
        <div>
          <label htmlFor="cp" className="label">Current password</label>
          <input id="cp" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="input" autoComplete="current-password" />
        </div>
        <div>
          <label htmlFor="npw" className="label">New password</label>
          <input id="npw" type="password" value={next} onChange={(e) => setNext(e.target.value)} className="input" autoComplete="new-password" placeholder="At least 8 characters" />
        </div>
        <button onClick={save} disabled={loading || !current || next.length < 8} className="btn-brand">
          {loading ? <Spinner /> : 'Update password'}
        </button>
      </div>
      {msg && <p className="mt-3 text-sm text-emerald-600">{msg}</p>}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </Card>
  );
}

function PlanCard() {
  const { refresh } = useAuth();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => api.billingStatus().then(setStatus).catch(() => undefined);
  useEffect(() => {
    void load();
  }, []);

  const cancel = async () => {
    setMsg('');
    setLoading(true);
    try {
      const res = await api.cancelSubscription();
      setMsg('Auto-renewal turned off.');
      await load();
      await refresh();
      void res;
    } catch {
      setMsg('Could not cancel right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Current plan" icon={CreditCard}>
      {!status ? (
        <Spinner />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-ink">{status.planName}</p>
              <p className="text-sm text-ink-muted">
                {status.unlimitedCredits ? 'Unlimited AI runs' : `${status.credits} credits remaining`}
                {status.subscriptionStatus ? ` · ${status.subscriptionStatus}` : ''}
              </p>
            </div>
            {status.plan !== 'free' && <span className="badge bg-brand-50 text-brand-700">Active</span>}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/billing" className="btn-outline"><CreditCard className="h-4 w-4" /> Manage plans</Link>
            <Link href="/payments" className="btn-outline"><Receipt className="h-4 w-4" /> Payments & invoices</Link>
            {status.plan !== 'free' && status.subscriptionStatus !== 'canceled (demo)' && status.subscriptionStatus !== 'canceling' && (
              <button onClick={cancel} disabled={loading} className="btn-ghost text-rose-600 hover:bg-rose-50">
                {loading ? <Spinner /> : 'Cancel auto-renewal'}
              </button>
            )}
          </div>
          {msg && <p className="mt-3 text-sm text-ink-soft">{msg}</p>}
        </>
      )}
    </Card>
  );
}
