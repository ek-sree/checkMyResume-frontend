'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageLoader, Spinner } from '@/components/Spinner';
import { ScoreRing } from '@/components/ScoreRing';
import { api, ApiError } from '@/lib/api';
import type { InterviewSession, InterviewTurn } from '@/lib/types';
import { ArrowLeft, Lock, Star, CheckCircle2 } from 'lucide-react';

export default function InterviewSessionPage() {
  return (
    <AppShell>
      <Session />
    </AppShell>
  );
}

function Session() {
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getInterview(params.id)
      .then(({ session }) => setSession(session))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load session.'));
  }, [params.id]);

  const currentIndex = useMemo(
    () => session?.turns.findIndex((t) => t.score === null) ?? -1,
    [session]
  );
  const answered = session?.turns.filter((t) => t.score !== null).length ?? 0;

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-soft">{error}</p>
        <Link href="/interview" className="mt-4 inline-block font-medium text-brand-600 hover:text-brand-700">
          Back
        </Link>
      </div>
    );
  }

  if (!session) return <PageLoader label="Loading interview…" />;

  const onScored = (updated: InterviewSession) => setSession(updated);
  const total = session.turns.length;
  const completed = session.status === 'completed' || currentIndex === -1;

  return (
    <div className="space-y-6">
      <Link href="/interview" className="btn-ghost -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Interviews
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{session.jobTitle || 'Mock interview'}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {answered} of {total} answered
          </p>
        </div>
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-line sm:w-56">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500"
            style={{ width: `${(answered / total) * 100}%` }}
          />
        </div>
      </div>

      {completed && typeof session.overallScore === 'number' && (
        <div className="card flex items-center gap-5 p-6">
          <ScoreRing score={session.overallScore * 10} size={104} label="Overall" />
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold text-ink">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Interview complete
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              You scored an average of {session.overallScore}/10 across {total} questions. Review the feedback
              below to sharpen your answers.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {session.turns.map((turn, i) => (
          <QuestionCard
            key={turn._id}
            sessionId={session._id}
            turn={turn}
            index={i}
            state={turn.score !== null ? 'answered' : i === currentIndex ? 'active' : 'locked'}
            onScored={onScored}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({
  sessionId,
  turn,
  index,
  state,
  onScored,
}: {
  sessionId: string;
  turn: InterviewTurn;
  index: number;
  state: 'answered' | 'active' | 'locked';
  onScored: (s: InterviewSession) => void;
}) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const { session } = await api.answerQuestion(sessionId, turn._id, answer);
      onScored(session);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not score the answer.');
      setLoading(false);
    }
  };

  return (
    <div className={`card p-6 ${state === 'locked' ? 'opacity-55' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="badge bg-ink/5 capitalize text-ink-soft">{turn.category}</span>
          <p className="font-medium text-ink">
            <span className="text-ink-muted">Q{index + 1}.</span> {turn.question}
          </p>
        </div>
        {state === 'answered' && typeof turn.score === 'number' && (
          <span className="badge shrink-0 bg-emerald-50 text-emerald-700">
            <Star className="h-3 w-3" /> {turn.score}/10
          </span>
        )}
        {state === 'locked' && <Lock className="h-4 w-4 shrink-0 text-ink-muted" />}
      </div>

      {state === 'active' && (
        <div className="mt-4 space-y-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer as you would say it in the interview…"
            rows={5}
            className="input resize-y"
          />
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <button onClick={submit} disabled={loading || answer.trim().length < 2} className="btn-brand">
            {loading ? <><Spinner /> Scoring…</> : 'Submit answer'}
          </button>
        </div>
      )}

      {state === 'answered' && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-canvas px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Your answer</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{turn.answer}</p>
          </div>
          <div className="rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Coach feedback</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{turn.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
