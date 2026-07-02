'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { ScoreRing } from '@/components/ScoreRing';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { AnalysisSummary, InterviewSummary, ResumeSummary } from '@/lib/types';
import { Target, MessageSquare, FileText, ArrowRight, Sparkles, GitCompare, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listAnalyses(), api.listInterviews(), api.listResumes()])
      .then(([a, i, r]) => {
        setAnalyses(a.analyses);
        setInterviews(i.sessions);
        setResumes(r.resumes);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Hi, {user?.name.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-ink-soft">Let’s forge your next application.</p>
        </div>
        <div className="card flex items-center gap-3 px-4 py-3">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-ink">
              {user?.plan === 'pro' ? 'Pro plan' : `${user?.credits} free credits`}
            </p>
            <p className="text-xs text-ink-muted">
              {user?.plan === 'pro' ? 'Unlimited AI runs' : 'Each AI run uses one credit'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard href="/analyze" icon={Target} title="Analyze a job" body="Score your match, tailor your resume, get a cover letter." />
        <ActionCard href="/compare" icon={GitCompare} title="Compare resumes" body="Find which of your resumes best fits a job." />
        <ActionCard href="/interview" icon={MessageSquare} title="Mock interview" body="Role-specific questions, scored with feedback." />
        <ActionCard href="/analytics" icon={BarChart3} title="Analytics" body="Track your match scores and progress over time." />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Recent analyses</h2>
              <Link href="/analyze" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                New
              </Link>
            </div>
            {analyses.length === 0 ? (
              <Empty label="No analyses yet. Run your first one." />
            ) : (
              <ul className="divide-y divide-line">
                {analyses.slice(0, 5).map((a) => (
                  <li key={a._id}>
                    <Link
                      href={`/analyze/${a._id}`}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-brand-700"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {a.jobTitle || 'Untitled role'}
                          {a.company ? ` · ${a.company}` : ''}
                        </p>
                        <p className="text-xs text-ink-muted">{new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                      {typeof a.matchScore === 'number' && (
                        <span className="badge bg-brand-50 text-brand-700">{a.matchScore}/100</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Recent interviews</h2>
              <Link href="/interview" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                New
              </Link>
            </div>
            {interviews.length === 0 ? (
              <Empty label="No mock interviews yet. Start practicing." />
            ) : (
              <ul className="divide-y divide-line">
                {interviews.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/interview/${s.id}`}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-brand-700"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{s.jobTitle || 'General interview'}</p>
                        <p className="text-xs text-ink-muted">
                          {s.questionCount} questions · {s.status}
                        </p>
                      </div>
                      {typeof s.overallScore === 'number' && (
                        <span className="badge bg-emerald-50 text-emerald-700">{s.overallScore}/10</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line bg-surface/60 px-5 py-4 text-sm text-ink-soft">
        <FileText className="h-5 w-5 text-ink-muted" />
        <span>
          You have <span className="font-semibold text-ink">{resumes.length}</span> resume
          {resumes.length === 1 ? '' : 's'} saved.
        </span>
        <Link href="/analyze" className="ml-auto inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700">
          Manage <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: typeof Target;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="card group p-6 transition-shadow duration-200 hover:shadow-lift">
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
          <Icon className="h-5 w-5" />
        </span>
        <ArrowRight className="h-5 w-5 text-ink-muted transition-transform duration-200 group-hover:translate-x-1" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
    </Link>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="py-6 text-center text-sm text-ink-muted">{label}</p>;
}
