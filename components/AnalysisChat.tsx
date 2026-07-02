'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { streamChat, ApiError } from '@/lib/api';
import type { ChatTurn, Plan } from '@/lib/types';
import { Send, Sparkles, Lock, User } from 'lucide-react';

const SUGGESTIONS = [
  'How can I close my biggest skill gap?',
  'What salary range should I target?',
  'Which experience should I emphasize in interviews?',
];

export function AnalysisChat({
  analysisId,
  initialChat,
  plan,
}: {
  analysisId: string;
  initialChat: ChatTurn[];
  plan: Plan;
}) {
  const isUnlimited = plan === 'premium';
  const [messages, setMessages] = useState<ChatTurn[]>(initialChat);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const usedInit = initialChat.filter((m) => m.role === 'user').length;
  const [remaining, setRemaining] = useState<number | null>(
    plan === 'free' ? Math.max(0, 4 - usedInit) : null
  );
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const locked = !isUnlimited && remaining === 0;

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || streaming || locked) return;
    setError('');
    setInput('');
    const now = new Date().toISOString();
    setMessages((prev) => [...prev, { role: 'user', content: q, at: now }, { role: 'assistant', content: '', at: now }]);
    setStreaming(true);

    try {
      await streamChat(analysisId, q, (ev) => {
        if (ev.type === 'delta' && ev.text) {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === 'assistant') copy[copy.length - 1] = { ...last, content: last.content + ev.text };
            return copy;
          });
        } else if (ev.type === 'done') {
          setRemaining(ev.remaining ?? null);
          setStreaming(false);
        } else if (ev.type === 'error') {
          setError(ev.message || 'The chat response failed.');
          setStreaming(false);
        }
      });
    } catch (err) {
      // Roll back the optimistic pair if nothing streamed in.
      setMessages((prev) => {
        const copy = [...prev];
        if (copy.length >= 2 && copy[copy.length - 1]?.role === 'assistant' && copy[copy.length - 1]?.content === '') {
          copy.splice(copy.length - 2, 2);
        }
        return copy;
      });
      if (err instanceof ApiError && err.status === 402) {
        setRemaining(0);
        setError(err.message);
      } else {
        setInput(q);
        setError(err instanceof ApiError ? err.message : 'The chat response failed.');
      }
      setStreaming(false);
    }
  };

  return (
    <div className="card flex h-[34rem] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-semibold text-ink">Ask your coach</span>
        </div>
        {isUnlimited ? (
          <span className="badge bg-emerald-50 text-emerald-700">Unlimited</span>
        ) : remaining !== null ? (
          <span className="badge bg-ink/5 text-ink-soft">{remaining} question{remaining === 1 ? '' : 's'} left</span>
        ) : null}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-xs text-sm text-ink-muted">
              Ask anything about this analysis — your match, resume, interviews, or strategy.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={locked}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-brand-300 hover:text-ink disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                m.role === 'user' ? 'bg-ink text-white' : 'bg-brand-50 text-brand-600'
              }`}
            >
              {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            </span>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-ink text-white' : 'bg-canvas text-ink-soft'
              }`}
            >
              {m.content || (streaming && i === messages.length - 1 ? <span className="animate-pulse-soft">▍</span> : '')}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line p-3">
        {error && <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

        {locked ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-50/60 px-4 py-3">
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Lock className="h-4 w-4 text-brand-600" />
              You’ve used your free questions for this analysis.
            </p>
            <Link href="/billing" className="btn-brand px-3 py-2 text-xs">
              Upgrade to Pro
            </Link>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder="Ask a follow-up…"
              className="input max-h-32 flex-1 resize-none py-2.5"
            />
            <button
              onClick={() => send()}
              disabled={streaming || !input.trim()}
              className="btn-brand h-[42px] w-[42px] shrink-0 p-0"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
