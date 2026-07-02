'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { ResumePicker } from '@/components/ResumePicker';
import { AgentTimeline } from '@/components/AgentTimeline';
import { AnalysisResults } from '@/components/AnalysisResults';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/lib/auth';
import { api, streamAnalysis, ApiError } from '@/lib/api';
import type { AgentStep, Analysis, ResumeSummary } from '@/lib/types';
import { Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';

type Phase = 'idle' | 'running' | 'done';

export default function AnalyzePage() {
  return (
    <AppShell>
      <AnalyzeRunner />
    </AppShell>
  );
}

function AnalyzeRunner() {
  const { refresh } = useAuth();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [phase, setPhase] = useState<Phase>('idle');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listResumes()
      .then(({ resumes }) => {
        setResumes(resumes);
        if (resumes[0]) setSelectedId(resumes[0].id);
      })
      .catch(() => undefined);
  }, []);

  const onAdded = (resume: ResumeSummary) => {
    setResumes((prev) => [resume, ...prev]);
    setSelectedId(resume.id);
  };

  const canRun = selectedId && jobDescription.trim().length >= 40 && phase !== 'running';

  const run = async () => {
    if (!selectedId) return;
    setError('');
    setSteps([]);
    setAnalysis(null);
    setPhase('running');

    try {
      await streamAnalysis(
        { resumeId: selectedId, jobTitle, company, jobDescription },
        (event) => {
          if (event.type === 'step' && event.step) {
            setSteps((prev) => [...prev, event.step!]);
          } else if (event.type === 'done' && event.analysis) {
            setAnalysis(event.analysis);
            setPhase('done');
            void refresh();
          } else if (event.type === 'error') {
            setError(event.message || 'The AI run failed.');
            setPhase('idle');
          }
        }
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the analysis.');
      setPhase('idle');
    }
  };

  const reset = () => {
    setPhase('idle');
    setSteps([]);
    setAnalysis(null);
    setError('');
  };

  if (phase === 'done' && analysis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={reset} className="btn-ghost -ml-2">
            <ArrowLeft className="h-4 w-4" />
            New analysis
          </button>
          <Link href={`/analyze/${analysis._id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Permalink
          </Link>
        </div>
        <AnalysisResults analysis={analysis} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Analyze a job</h1>
        <p className="mt-1 text-ink-soft">
          Pick a resume, paste the job description, and watch the agent build your application.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>{error}</p>
            {/credit|upgrade|plan|feature/i.test(error) && (
              <Link href="/billing" className="mt-1 inline-block font-semibold underline">
                See plans →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <section>
            <h2 className="mb-2 text-sm font-semibold text-ink">1 · Your resume</h2>
            <ResumePicker
              resumes={resumes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAdded={onAdded}
            />
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="text-sm font-semibold text-ink">2 · The job</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="jobTitle" className="label">Job title</label>
                <input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Senior Frontend Engineer"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="company" className="label">Company</label>
                <input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc."
                  className="input"
                />
              </div>
            </div>
            <div>
              <label htmlFor="jd" className="label">Job description</label>
              <textarea
                id="jd"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here…"
                rows={9}
                className="input resize-y"
              />
              <p className="mt-1 text-xs text-ink-muted">{jobDescription.trim().length} characters (min 40)</p>
            </div>

            <button onClick={run} disabled={!canRun} className="btn-brand w-full py-3">
              {phase === 'running' ? (
                <>
                  <Spinner /> Agent is working…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Run analysis
                </>
              )}
            </button>
          </section>
        </div>

        {/* Live timeline */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-sm font-semibold text-ink">Agent activity</h2>
              {phase === 'running' && <span className="badge bg-emerald-50 text-emerald-700">Live</span>}
            </div>
            {steps.length === 0 && phase !== 'running' ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-ink-muted">
                <Sparkles className="h-7 w-7 text-ink/20" />
                <p className="text-sm">The agent’s steps will stream here in real time.</p>
              </div>
            ) : (
              <AgentTimeline steps={steps} live={phase === 'running'} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
