'use client';

import type { Comparison } from '@/lib/types';
import { Trophy, Check, X } from 'lucide-react';

export function ComparisonResults({ comparison }: { comparison: Comparison }) {
  const ranked = [...comparison.rankings].sort((a, b) => b.fitScore - a.fitScore);

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="bg-emerald-50/70 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Best fit</p>
              <p className="text-lg font-semibold text-ink">{comparison.bestLabel || '—'}</p>
            </div>
          </div>
        </div>
        {comparison.rationale && (
          <p className="px-6 py-4 text-sm leading-relaxed text-ink-soft">{comparison.rationale}</p>
        )}
      </div>

      <div className="space-y-4">
        {ranked.map((r, i) => {
          const isBest = r.label === comparison.bestLabel;
          return (
            <div
              key={`${r.label}-${i}`}
              className={`card p-5 ${isBest ? 'ring-2 ring-emerald-200' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-ink-muted">#{i + 1}</span>
                  <span className="font-semibold text-ink">{r.label}</span>
                  {isBest && <span className="badge bg-emerald-50 text-emerald-700">Best</span>}
                </div>
                <span className="font-display text-lg font-bold text-ink">{r.fitScore}<span className="text-sm text-ink-muted">/100</span></span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ${isBest ? 'bg-emerald-500' : 'bg-brand-500'}`}
                  style={{ width: `${r.fitScore}%` }}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Strengths</p>
                  <ul className="space-y-1">
                    {r.strengths.length ? r.strengths.map((s, j) => (
                      <li key={j} className="flex gap-2 text-sm text-ink-soft">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{s}
                      </li>
                    )) : <li className="text-sm text-ink-muted">—</li>}
                  </ul>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Weaknesses</p>
                  <ul className="space-y-1">
                    {r.weaknesses.length ? r.weaknesses.map((s, j) => (
                      <li key={j} className="flex gap-2 text-sm text-ink-soft">
                        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />{s}
                      </li>
                    )) : <li className="text-sm text-ink-muted">—</li>}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
