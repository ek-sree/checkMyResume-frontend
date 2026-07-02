'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Spinner } from '@/components/Spinner';
import { api, ApiError } from '@/lib/api';
import { ArrowLeft, Mail, MessageSquare, CheckCircle2, Send, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.contact({ name, email, message });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-line/80">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link href="/" className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </header>

      <div className="container-page relative overflow-hidden py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 -z-10 h-[360px] w-[600px] rounded-full bg-brand-300/20 blur-[120px]"
        />
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-up">
            <span className="badge mb-5 border border-line bg-surface text-ink-soft">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              We’d love to hear from you
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
              Get in touch
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
              Questions, feedback, or partnership ideas? Drop a message and it lands straight in our inbox — we’ll get
              back to you soon.
            </p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-ink-soft">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink/5">
                  <Mail className="h-4 w-4 text-ink-soft" />
                </span>
                Typical reply within a day
              </div>
              <div className="flex items-center gap-3 text-sm text-ink-soft">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink/5">
                  <MessageSquare className="h-4 w-4 text-ink-soft" />
                </span>
                Or ask the assistant in the bottom-right
              </div>
            </div>
          </div>

          <div className="card animate-fade-up p-7" style={{ animationDelay: '120ms' }}>
            {sent ? (
              <div className="flex flex-col items-center py-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </span>
                <h2 className="mt-4 text-xl font-bold text-ink">Message sent!</h2>
                <p className="mt-2 text-sm text-ink-soft">Thanks for reaching out — we’ll reply to {email}.</p>
                <Link href="/" className="btn-outline mt-6">
                  Back to home
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="c-name" className="label">Name</label>
                  <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required className="input" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="c-email" className="label">Email</label>
                  <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" placeholder="you@example.com" />
                </div>
                <div>
                  <label htmlFor="c-message" className="label">Message</label>
                  <textarea id="c-message" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={5} rows={5} className="input resize-y" placeholder="How can we help?" />
                </div>

                {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

                <button type="submit" disabled={loading} className="btn-brand w-full py-3">
                  {loading ? <Spinner /> : <><Send className="h-4 w-4" /> Send message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
