'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { PageLoader, Spinner } from '@/components/Spinner';
import { api, ApiError } from '@/lib/api';
import type { AdminUserDetail, Plan } from '@/lib/types';
import { ArrowLeft, Ban, CheckCircle2, ShieldOff } from 'lucide-react';

const PLANS: Plan[] = ['free', 'starter', 'pro', 'premium'];

export default function AdminUserDetailPage() {
  return (
    <AdminShell>
      <Detail />
    </AdminShell>
  );
}

function Detail() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<Plan>('free');

  const load = () =>
    api
      .adminUser(params.id)
      .then((d) => {
        setData(d);
        setPlan(d.user.plan);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Could not load user.'));

  useEffect(() => {
    void load();
  }, [params.id]);

  const toggleBlock = async () => {
    if (!data) return;
    setBusy(true);
    try {
      await api.adminBlock(data.user.id, !data.user.blocked);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const applyPlan = async () => {
    if (!data) return;
    setBusy(true);
    try {
      await api.adminSetPlan(data.user.id, plan);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-soft">{error}</p>
        <Link href="/admin/users" className="mt-4 inline-block font-medium text-brand-600">Back to users</Link>
      </div>
    );
  }
  if (!data) return <PageLoader label="Loading user…" />;
  const u = data.user;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="btn-ghost -ml-2"><ArrowLeft className="h-4 w-4" /> Users</Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
              {u.name}
              {u.role === 'admin' && <span className="badge bg-brand-50 text-brand-700">Admin</span>}
              {u.blocked && <span className="badge bg-rose-50 text-rose-700">Blocked</span>}
            </h1>
            <p className="mt-1 text-ink-soft">{u.email}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {u.authProvider} · joined {new Date(u.createdAt).toLocaleDateString()} ·{' '}
              {u.emailVerified ? 'verified' : 'unverified'}
            </p>
          </div>
          {u.role !== 'admin' && (
            <button
              onClick={toggleBlock}
              disabled={busy}
              className={`btn ${u.blocked ? 'btn-outline' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
            >
              {busy ? <Spinner /> : u.blocked ? <><CheckCircle2 className="h-4 w-4" /> Unblock</> : <><Ban className="h-4 w-4" /> Block user</>}
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Plan" value={u.plan} />
          <Stat label="Credits" value={String(u.credits)} />
          <Stat label="AI runs" value={String(u.aiRuns)} />
          <Stat label="Tokens" value={u.tokensUsed.toLocaleString()} />
          <Stat label="Resumes" value={String(data.counts.resumes)} />
          <Stat label="Analyses" value={String(data.counts.analyses)} />
          <Stat label="Interviews" value={String(data.counts.interviews)} />
          <Stat label="Comparisons" value={String(data.counts.comparisons)} />
        </div>
      </div>

      {/* Admin plan override */}
      <div className="card p-6">
        <h2 className="mb-3 text-lg font-semibold text-ink">Change plan</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select value={plan} onChange={(e) => setPlan(e.target.value as Plan)} className="input max-w-[12rem]">
            {PLANS.map((p) => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>
          <button onClick={applyPlan} disabled={busy || plan === u.plan} className="btn-primary">Apply</button>
        </div>
      </div>

      {/* Resumes */}
      <div className="card p-6">
        <h2 className="mb-3 text-lg font-semibold text-ink">Resumes ({data.resumes.length})</h2>
        {data.resumes.length === 0 ? (
          <p className="text-sm text-ink-muted">No resumes.</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.resumes.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium text-ink">{r.label}</span>
                <span className="text-xs text-ink-muted">{r.sourceType} · {new Date(r.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Payments */}
      <div className="card p-6">
        <h2 className="mb-3 text-lg font-semibold text-ink">Payments ({data.payments.length})</h2>
        {data.payments.length === 0 ? (
          <p className="text-sm text-ink-muted">No payments.</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink-soft">{new Date(p.createdAt).toLocaleDateString()} · {p.planName}</span>
                <span className="font-semibold text-ink">₹{p.amount} <span className="text-xs font-normal text-ink-muted">{p.method}</span></span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas px-4 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold capitalize text-ink">{value}</p>
    </div>
  );
}
