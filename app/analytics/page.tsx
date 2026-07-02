'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageLoader } from '@/components/Spinner';
import { CountUp } from '@/components/CountUp';
import { ScoreLineChart, KeywordBars } from '@/components/Charts';
import { Upsell } from '@/components/Upsell';
import { api, ApiError } from '@/lib/api';
import type { Analytics } from '@/lib/types';
import { Target, MessageSquare, FileText, GitCompare, TrendingUp, Trophy } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <AppShell>
      <AnalyticsView />
    </AppShell>
  );
}

function AnalyticsView() {
  const [data, setData] = useState<Analytics | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    api
      .analytics()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 402) setLocked(true);
      });
  }, []);

  if (locked) {
    return (
      <Upsell
        title="Analytics is a Premium feature"
        body="Upgrade to Premium to unlock your personal analytics dashboard — score trends, averages, and your most-missing skills."
      />
    );
  }
  if (!data) return <PageLoader label="Crunching your numbers…" />;

  const stats = [
    { icon: Target, label: 'Analyses', value: data.totals.analyses, tint: 'text-brand-600 bg-brand-50' },
    { icon: TrendingUp, label: 'Avg match', value: data.avgMatch ?? 0, suffix: data.avgMatch != null ? '%' : '', tint: 'text-emerald-600 bg-emerald-50' },
    { icon: Trophy, label: 'Best match', value: data.bestMatch ?? 0, suffix: data.bestMatch != null ? '%' : '', tint: 'text-amber-600 bg-amber-50' },
    { icon: MessageSquare, label: 'Interviews', value: data.totals.interviews, tint: 'text-brand-600 bg-brand-50' },
    { icon: FileText, label: 'Resumes', value: data.totals.resumes, tint: 'text-ink bg-ink/5' },
    { icon: GitCompare, label: 'Comparisons', value: data.totals.comparisons, tint: 'text-ink bg-ink/5' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">Your analytics</h1>
        <p className="mt-1 text-ink-soft">Track your progress across every job you’ve targeted.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map(({ icon: Icon, label, value, suffix, tint }, i) => (
          <div key={label} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-3 font-display text-3xl font-bold text-ink">
              <CountUp value={value} suffix={suffix ?? ''} />
            </p>
            <p className="text-sm text-ink-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Match-score trend</h2>
            {data.avgInterview != null && (
              <span className="badge bg-emerald-50 text-emerald-700">Interview avg {data.avgInterview}/10</span>
            )}
          </div>
          <ScoreLineChart data={data.scoreHistory.map((p) => ({ label: p.label, score: p.score }))} />
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="mb-1 text-lg font-semibold text-ink">Most-missing skills</h2>
          <p className="mb-4 text-sm text-ink-muted">Keywords you’re most often missing — your study list.</p>
          <KeywordBars data={data.topMissing} />
        </section>
      </div>
    </div>
  );
}
