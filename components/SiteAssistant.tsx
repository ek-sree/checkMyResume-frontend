'use client';

import { useEffect, useRef, useState } from 'react';
import { streamAssistant, ApiError } from '@/lib/api';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = ['What can CheckMyResume do?', 'How much does it cost?', 'How do I get started?'];

export function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming, open]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || streaming) return;
    setError('');
    setInput('');
    const next: Msg[] = [...messages, { role: 'user', content: q }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setStreaming(true);

    try {
      await streamAssistant(next.slice(-12), (ev) => {
        if (ev.type === 'delta' && ev.text) {
          setMessages((prev) => {
            const c = [...prev];
            const last = c[c.length - 1];
            if (last?.role === 'assistant') c[c.length - 1] = { ...last, content: last.content + ev.text };
            return c;
          });
        } else if (ev.type === 'done') {
          setStreaming(false);
        } else if (ev.type === 'error') {
          setError(ev.message || 'Something went wrong.');
          setStreaming(false);
        }
      });
    } catch (err) {
      setMessages((prev) => {
        const c = [...prev];
        if (c[c.length - 1]?.role === 'assistant' && c[c.length - 1]?.content === '') c.pop();
        return c;
      });
      setError(err instanceof ApiError ? err.message : 'Could not reach the assistant.');
      setStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 print:hidden">
      {open && (
        <div className="mb-3 flex h-[32rem] w-[min(94vw,23rem)] animate-scale-in flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="text-sm font-semibold">CareerForge Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-lg p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <p className="rounded-2xl bg-canvas px-3.5 py-2.5 text-sm text-ink-soft">
                    Hi! I’m the CheckMyResume assistant. Ask me anything about how it works, features, or pricing.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-brand-300 hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    m.role === 'user' ? 'bg-ink text-white' : 'bg-brand-50 text-brand-600'
                  }`}
                >
                  {m.role === 'user' ? <span className="text-xs font-semibold">You</span> : <Sparkles className="h-3.5 w-3.5" />}
                </span>
                <div
                  className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-ink text-white' : 'bg-canvas text-ink-soft'
                  }`}
                >
                  {m.content || (streaming && i === messages.length - 1 ? <span className="animate-pulse-soft">▍</span> : '')}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-line p-3">
            {error && <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
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
                placeholder="Ask about CheckMyResume…"
                className="input max-h-28 flex-1 resize-none py-2.5 text-sm"
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
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-lift transition-transform duration-200 hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
