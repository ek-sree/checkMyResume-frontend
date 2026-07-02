'use client';

import { useEffect, useState } from 'react';
import { FileText, Brain, Wrench, CheckCircle2, Check, X, Upload } from 'lucide-react';

const PHASES = ['upload', 'thinking', 'tools', 'result'] as const;
type Phase = (typeof PHASES)[number];

const TOOL_LINES = [
  'record_match_analysis → 82 / 100',
  'record_tailored_resume → 6 bullets rewritten',
  'record_cover_letter → drafted',
];

const STATUS: Record<Phase, string> = {
  upload: 'Uploading resume…',
  thinking: 'Reading the job description…',
  tools: 'Calling tools…',
  result: 'Done — 82% match',
};

export function LandingDemo() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [score, setScore] = useState(0);
  const phase = PHASES[phaseIdx]!;

  useEffect(() => {
    const t = setTimeout(() => setPhaseIdx((i) => (i + 1) % PHASES.length), phase === 'result' ? 2600 : 2000);
    return () => clearTimeout(t);
  }, [phaseIdx, phase]);

  useEffect(() => {
    if (phase !== 'result') {
      setScore(0);
      return;
    }
    let v = 0;
    const id = setInterval(() => {
      v += 3;
      if (v >= 82) {
        v = 82;
        clearInterval(id);
      }
      setScore(v);
    }, 24);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-300" />
          <span className="ml-3 text-xs font-medium text-ink-muted">careerforge.ai / analyze</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <span className={`h-1.5 w-1.5 rounded-full ${phase === 'result' ? 'bg-emerald-500' : 'bg-brand-500 animate-pulse-soft'}`} />
            {STATUS[phase]}
          </span>
        </div>

        <div className="min-h-[260px] p-6">
          {phase === 'upload' && <UploadStage />}
          {phase === 'thinking' && <ThinkingStage />}
          {phase === 'tools' && <ToolsStage />}
          {phase === 'result' && <ResultStage score={score} />}
        </div>
      </div>
    </div>
  );
}

function UploadStage() {
  return (
    <div className="flex h-full animate-fade-up flex-col items-center justify-center gap-4 py-6">
      <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
        <FileText className="h-5 w-5 text-ink-soft" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">alex-rivera-resume.pdf</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full animate-[fill_1.6s_ease-out_forwards] rounded-full bg-brand-600" style={{ width: '0%' }} />
          </div>
        </div>
        <Upload className="h-4 w-4 text-brand-600" />
      </div>
      <p className="text-sm text-ink-muted">Extracting your experience…</p>
      <style>{`@keyframes fill { to { width: 100%; } }`}</style>
    </div>
  );
}

function ThinkingStage() {
  return (
    <div className="flex h-full animate-fade-up flex-col items-center justify-center gap-3 py-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
        <Brain className="h-6 w-6 animate-pulse-soft text-brand-600" />
      </span>
      <p className="text-sm font-medium text-ink">Screening you like a recruiter…</p>
      <div className="space-y-1.5">
        {['Matching keywords', 'Assessing seniority', 'Spotting gaps'].map((t, i) => (
          <p key={t} className="animate-fade-up text-center text-xs text-ink-muted" style={{ animationDelay: `${i * 220}ms` }}>
            {t}
          </p>
        ))}
      </div>
    </div>
  );
}

function ToolsStage() {
  return (
    <ul className="space-y-3 py-2">
      {TOOL_LINES.map((line, i) => (
        <li
          key={line}
          className="flex animate-fade-up items-center gap-3 rounded-xl border border-line bg-canvas px-4 py-3"
          style={{ animationDelay: `${i * 320}ms` }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
            <Wrench className="h-4 w-4 text-amber-600" />
          </span>
          <span className="text-sm text-ink-soft">{line}</span>
          <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
        </li>
      ))}
    </ul>
  );
}

function ResultStage({ score }: { score: number }) {
  return (
    <div className="grid animate-fade-up gap-6 py-2 sm:grid-cols-[auto,1fr] sm:items-center">
      <div className="flex justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-emerald-100">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-ink">{score}</p>
            <p className="text-[10px] font-medium text-ink-muted">/ 100</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Matched</p>
          <div className="flex flex-wrap gap-1.5">
            {['React', 'TypeScript', 'Node.js', 'AWS'].map((k) => (
              <span key={k} className="badge bg-emerald-50 text-emerald-700"><Check className="h-3 w-3" />{k}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Missing</p>
          <div className="flex flex-wrap gap-1.5">
            {['GraphQL', 'Kubernetes'].map((k) => (
              <span key={k} className="badge bg-rose-50 text-rose-700"><X className="h-3 w-3" />{k}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
