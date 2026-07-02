'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ResumePicker } from '@/components/ResumePicker';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import type { InterviewSummary, ResumeSummary } from '@/lib/types';
import { MessageSquare, Sparkles, AlertCircle } from 'lucide-react';

export default function InterviewPage() {
  return (
    <AppShell>
      <InterviewStart />
    </AppShell>
  );
}

function InterviewStart() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [count, setCount] = useState(5);
  const [past, setPast] = useState<InterviewSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listResumes()
      .then(({ resumes }) => {
        setResumes(resumes);
        if (resumes[0]) setSelectedId(resumes[0].id);
      })
      .catch(() => undefined);
    api.listInterviews().then(({ sessions }) => setPast(sessions)).catch(() => undefined);
  }, []);

  const start = async () => {
    setError('');
    setLoading(true);
    try {
      const { session } = await api.startInterview({
        jobTitle: jobTitle || undefined,
        jobDescription: jobDescription || undefined,
        resumeId: selectedId || undefined,
        count,
      });
      void refresh();
      router.push(`/interview/${session._id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the interview.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">Mock interview</h1>
        <p className="mt-1 text-ink-soft">
          The agent generates role-specific questions and scores your answers with feedback.
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

      <div className="card space-y-5 p-6">
        <div>
          <label htmlFor="ititle" className="label">Target role</label>
          <input
            id="ititle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Product Manager"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="ijd" className="label">Job description <span className="text-ink-muted">(optional)</span></label>
          <textarea
            id="ijd"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description to tailor the questions…"
            rows={5}
            className="input resize-y"
          />
        </div>

        <div>
          <p className="label">Resume <span className="text-ink-muted">(optional — improves tailoring)</span></p>
          <ResumePicker
            resumes={resumes}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
            onAdded={(r) => {
              setResumes((p) => [r, ...p]);
              setSelectedId(r.id);
            }}
          />
        </div>

        <div>
          <label htmlFor="count" className="label">Number of questions</label>
          <select
            id="count"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="input max-w-[10rem]"
          >
            {[3, 5, 7, 10].map((n) => (
              <option key={n} value={n}>{n} questions</option>
            ))}
          </select>
        </div>

        <button onClick={start} disabled={loading} className="btn-brand w-full py-3 sm:w-auto">
          {loading ? <><Spinner /> Generating…</> : <><Sparkles className="h-4 w-4" /> Start interview</>}
        </button>
      </div>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-ink">Past sessions</h2>
          <div className="card divide-y divide-line">
            {past.map((s) => (
              <Link
                key={s.id}
                href={`/interview/${s.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-ink/[0.02]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/5">
                    <MessageSquare className="h-4 w-4 text-ink-soft" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{s.jobTitle || 'General interview'}</p>
                    <p className="text-xs text-ink-muted">{s.questionCount} questions · {s.status}</p>
                  </div>
                </div>
                {typeof s.overallScore === 'number' && (
                  <span className="badge bg-emerald-50 text-emerald-700">{s.overallScore}/10</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
