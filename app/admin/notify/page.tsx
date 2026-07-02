'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { Spinner } from '@/components/Spinner';
import { api, ApiError } from '@/lib/api';
import type { AdminUser } from '@/lib/types';
import { Send, Users, CheckCircle2, Check } from 'lucide-react';

export default function AdminNotifyPage() {
  return (
    <AdminShell>
      <Notify />
    </AdminShell>
  );
}

function Notify() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'all' | 'selected'>('all');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (audience === 'selected' && users.length === 0) {
      setLoadingUsers(true);
      api
        .adminUsers()
        .then(({ users }) => setUsers(users))
        .catch(() => setUsers([]))
        .finally(() => setLoadingUsers(false));
    }
  }, [audience, users.length]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const send = async () => {
    setError('');
    setResult('');
    if (audience === 'selected' && selected.size === 0) {
      setError('Select at least one user.');
      return;
    }
    setSending(true);
    try {
      const { queued } = await api.adminNotify({
        subject,
        message,
        audience,
        userIds: audience === 'selected' ? [...selected] : undefined,
      });
      setResult(`Queued ${queued} email${queued === 1 ? '' : 's'} — they’ll send in the background.`);
      setSubject('');
      setMessage('');
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not send the notification.');
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim() && message.trim() && !sending;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Send notification</h1>
        <p className="mt-1 text-ink-soft">Email an announcement to your users — queued and throttled in the background.</p>
      </div>

      {result && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {result}
        </div>
      )}
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="card space-y-5 p-6">
        <div>
          <label htmlFor="subject" className="label">Subject</label>
          <input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="input" placeholder="New feature: resume comparison is live!" maxLength={160} />
        </div>
        <div>
          <label htmlFor="message" className="label">Message</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={7} className="input resize-y" placeholder="Write your announcement…" maxLength={5000} />
        </div>

        <div>
          <p className="label">Audience</p>
          <div className="flex gap-2">
            {(['all', 'selected'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAudience(a)}
                className={`btn ${audience === a ? 'btn-primary' : 'btn-outline'}`}
              >
                {a === 'all' ? <><Users className="h-4 w-4" /> All users</> : 'Selected users'}
              </button>
            ))}
          </div>
        </div>

        {audience === 'selected' && (
          <div>
            <p className="mb-2 text-sm text-ink-soft">{selected.size} selected</p>
            {loadingUsers ? (
              <Spinner />
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
                {users.map((u) => {
                  const on = selected.has(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggle(u.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${on ? 'bg-brand-50' : 'hover:bg-ink/5'}`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-line'}`}>
                        {on && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{u.name}</span>
                        <span className="block truncate text-xs text-ink-muted">{u.email}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button onClick={send} disabled={!canSend} className="btn-brand w-full py-3">
          {sending ? <Spinner /> : <><Send className="h-4 w-4" /> Send notification</>}
        </button>
      </div>
    </div>
  );
}
