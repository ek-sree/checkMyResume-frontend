'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';
import { PageLoader } from '@/components/Spinner';
import { CountUp } from '@/components/CountUp';
import { api } from '@/lib/api';
import type { AdminOverview } from '@/lib/types';
import { IndianRupee, TrendingUp, Users, Sparkles, FileText, MessageSquare, GitCompare, Mail } from 'lucide-react';

export default function AdminOverviewPage() {
  return (
    <AdminShell>
      <Overview />
    </AdminShell>
  );
}

function Overview() {
  const [data, setData] = useState<AdminOverview | null>(null);

  useEffect(() => {
    api.adminOverview().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <PageLoader label="Loading admin overview…" />;

  const stats = [
    { icon: IndianRupee, label: 'Total revenue', value: data.revenue, prefix: '₹', tint: 'text-emerald-600 bg-emerald-50' },
    { icon: TrendingUp, label: 'Est. MRR', value: data.mrr, prefix: '₹', tint: 'text-brand-600 bg-brand-50' },
    { icon: Users, label: 'Users', value: data.totals.users, tint: 'text-ink bg-ink/5' },
    { icon: Sparkles, label: 'AI tokens used', value: data.tokensUsed, tint: 'text-amber-600 bg-amber-50' },
    { icon: Sparkles, label: 'AI runs', value: data.aiRuns, tint: 'text-brand-600 bg-brand-50' },
    { icon: FileText, label: 'Resumes', value: data.totals.resumes, tint: 'text-ink bg-ink/5' },
    { icon: MessageSquare, label: 'Interviews', value: data.totals.interviews, tint: 'text-ink bg-ink/5' },
    { icon: GitCompare, label: 'Comparisons', value: data.totals.comparisons, tint: 'text-ink bg-ink/5' },
  ];

  const planEntries = Object.entries(data.planDistribution);
  const planMax = Math.max(1, ...planEntries.map(([, c]) => c));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">Overview</h1>
        <p className="mt-1 text-ink-soft">Platform health at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, prefix, tint }, i) => (
          <div key={label} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold text-ink">
              {prefix}
              <CountUp value={value} />
            </p>
            <p className="text-sm text-ink-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-ink">Plan distribution</h2>
          <ul className="space-y-3">
            {planEntries.map(([plan, count]) => (
              <li key={plan} className="flex items-center gap-3">
                <span className="w-20 text-sm capitalize text-ink-soft">{plan}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / planMax) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-medium text-ink">{count}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-canvas px-4 py-3 text-sm">
            <Link href="/admin/contacts" className="inline-flex items-center gap-2 font-medium text-brand-600 hover:text-brand-700">
              <Mail className="h-4 w-4" /> {data.contactsUnread} unread contact message{data.contactsUnread === 1 ? '' : 's'}
            </Link>
          </div>
        </section>

        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Recent signups</h2>
            <Link href="/admin/users" className="text-sm font-medium text-brand-600 hover:text-brand-700">All users</Link>
          </div>
          <ul className="divide-y divide-line">
            {data.recentUsers.map((u) => (
              <li key={u.id}>
                <Link href={`/admin/users/${u.id}`} className="flex items-center justify-between py-2.5 hover:text-brand-700">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{u.name}</p>
                    <p className="truncate text-xs text-ink-muted">{u.email}</p>
                  </div>
                  <span className={`badge ${u.blocked ? 'bg-rose-50 text-rose-700' : 'bg-ink/5 text-ink-soft'}`}>
                    {u.blocked ? 'Blocked' : u.plan}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
