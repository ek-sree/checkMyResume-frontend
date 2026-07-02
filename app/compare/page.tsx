'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { AgentTimeline } from '@/components/AgentTimeline';
import { ComparisonResults } from '@/components/ComparisonResults';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/lib/auth';
import { api, streamComparison, ApiError } from '@/lib/api';
import type { AgentStep, Comparison, ComparisonSummary, ResumeSummary } from '@/lib/types';
import { GitCompare, FileText, Check, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

type Phase = 'idle' | 'running' | 'done';

export default function ComparePage() {
  return (
    <AppShell>
      <Compare />
    </AppShell>
  );
}

function Compare() {
  const { refresh } = useAuth();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [past, setPast] = useState<ComparisonSummary[]>([]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [result, setResult] = useState<Comparison | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listResumes()
      .then(({ resumes }) => {
        setResumes(resumes);
        setSelected(resumes.slice(0, Math.min(3, resumes.length)).map((r) => r.id));
      })
      .catch(() => undefined);
    api.listComparisons().then(({ comparisons }) => setPast(comparisons)).catch(() => undefined);
  }, []);

  const toggle = (id: string) => {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 5) return cur; // cap
      return [...cur, id];
    });
  };

  const canRun = selected.length >= 2 && jobDescription.trim().length >= 40 && phase !== 'running';

  const run = async () => {
    setError('');
    setSteps([]);
    setResult(null);
    setPhase('running');
    try {
      await streamComparison({ resumeIds: selected, jobTitle, jobDescription }, (ev) => {
        if (ev.type === 'step' && ev.step) setSteps((p) => [...p, ev.step!]);
        else if (ev.type === 'done' && ev.comparison) {
          setResult(ev.comparison);
          setPhase('done');
          void refresh();
        } else if (ev.type === 'error') {
          setError(ev.message || 'The comparison failed.');
          setPhase('idle');
        }
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the comparison.');
      setPhase('idle');
    }
  };

  if (phase === 'done' && result) {
    return (
      <div className="space-y-6">
        <button onClick={() => setPhase('idle')} className="btn-ghost -ml-2">
          <ArrowLeft className="h-4 w-4" /> New comparison
        </button>
        <ComparisonResults comparison={result} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Compare resumes</h1>
        <p className="mt-1 text-ink-soft">
          Select 2–5 resumes and a job — the agent ranks them and picks your best-fit resume.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>{error}</p>
            {/credit|upgrade|plan|feature/i.test(error) && (
              <Link href="/billing" className="mt-1 inline-block font-semibold underline">See plans →</Link>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">1 · Resumes ({selected.length}/5)</h2>
              <Link href="/analyze" className="text-xs font-medium text-brand-600 hover:text-brand-700">Add a resume</Link>
            </div>
            {resumes.length < 2 ? (
              <div className="card p-6 text-center text-sm text-ink-muted">
                Add at least 2 resumes (up to 5) on the{' '}
                <Link href="/analyze" className="font-medium text-brand-600">Analyze</Link> page to compare them.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {resumes.map((r) => {
                  const active = selected.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggle(r.id)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                        active ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-100' : 'border-line bg-surface hover:border-ink/20'
                      }`}
                    >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${active ? 'border-brand-600 bg-brand-600 text-white' : 'border-line'}`}>
                        {active && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                          <FileText className="h-3.5 w-3.5 text-ink-muted" />
                          <span className="truncate">{r.label}</span>
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-ink-muted">{r.excerpt}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="text-sm font-semibold text-ink">2 · The job</h2>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job title (optional)" className="input" />
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description…"
              rows={8}
              className="input resize-y"
            />
            <button onClick={run} disabled={!canRun} className="btn-brand w-full py-3">
              {phase === 'running' ? <><Spinner /> Comparing…</> : <><GitCompare className="h-4 w-4" /> Compare & pick best</>}
            </button>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-sm font-semibold text-ink">Agent activity</h2>
              {phase === 'running' && <span className="badge bg-emerald-50 text-emerald-700">Live</span>}
            </div>
            {steps.length === 0 && phase !== 'running' ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-ink-muted">
                <Sparkles className="h-7 w-7 text-ink/20" />
                <p className="text-sm">The agent will rank your resumes here, live.</p>
              </div>
            ) : (
              <AgentTimeline steps={steps} live={phase === 'running'} />
            )}
          </div>
        </div>
      </div>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-ink">Past comparisons</h2>
          <div className="card divide-y divide-line">
            {past.map((c) => (
              <Link key={c.id} href={`/compare/${c.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-ink/[0.02]">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{c.jobTitle || 'Untitled role'}</p>
                  <p className="text-xs text-ink-muted">{c.resumeCount} resumes · {c.status}</p>
                </div>
                {c.bestLabel && <span className="badge bg-emerald-50 text-emerald-700">Best: {c.bestLabel}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
