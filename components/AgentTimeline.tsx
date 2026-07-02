import type { AgentStep } from '@/lib/types';
import { Brain, Wrench, CheckCircle2, Flag } from 'lucide-react';
import { Spinner } from './Spinner';

const TOOL_LABELS: Record<string, string> = {
  record_match_analysis: 'Scoring ATS match',
  record_tailored_resume: 'Tailoring the resume',
  record_cover_letter: 'Writing the cover letter',
  record_skill_gaps: 'Mapping skill gaps',
  generate_interview_questions: 'Generating questions',
  score_interview_answer: 'Scoring the answer',
};

function meta(step: AgentStep) {
  switch (step.type) {
    case 'thinking':
      return { Icon: Brain, tint: 'text-brand-600', ring: 'bg-brand-50', title: 'Thinking' };
    case 'tool_call':
      return {
        Icon: Wrench,
        tint: 'text-amber-600',
        ring: 'bg-amber-50',
        title: step.tool ? TOOL_LABELS[step.tool] ?? step.tool : 'Calling tool',
      };
    case 'tool_result':
      return { Icon: CheckCircle2, tint: 'text-emerald-600', ring: 'bg-emerald-50', title: 'Done' };
    case 'final':
      return { Icon: Flag, tint: 'text-ink', ring: 'bg-ink/5', title: 'Summary' };
    default:
      return { Icon: Brain, tint: 'text-ink', ring: 'bg-ink/5', title: 'Step' };
  }
}

export function AgentTimeline({ steps, live }: { steps: AgentStep[]; live?: boolean }) {
  return (
    <ol className="relative space-y-1">
      {steps.map((step, i) => {
        const { Icon, tint, ring, title } = meta(step);
        const body =
          step.type === 'tool_result'
            ? String(step.output ?? '')
            : step.text ?? '';
        return (
          <li key={i} className="relative flex gap-3 pb-4 animate-fade-up">
            <div className="flex flex-col items-center">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ring}`}>
                <Icon className={`h-4 w-4 ${tint}`} />
              </span>
              {i < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm font-semibold text-ink">{title}</p>
              {body && (
                <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                  {body.length > 320 ? `${body.slice(0, 320)}…` : body}
                </p>
              )}
            </div>
          </li>
        );
      })}

      {live && (
        <li className="flex items-center gap-3 pl-1 text-sm text-ink-muted">
          <Spinner className="h-4 w-4" />
          <span className="animate-pulse-soft">The agent is working…</span>
        </li>
      )}
    </ol>
  );
}
