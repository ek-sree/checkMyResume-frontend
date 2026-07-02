'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { PageLoader } from '@/components/Spinner';
import { api } from '@/lib/api';
import type { ContactMsg } from '@/lib/types';
import { Mail, Check } from 'lucide-react';

export default function AdminContactsPage() {
  return (
    <AdminShell>
      <Contacts />
    </AdminShell>
  );
}

function Contacts() {
  const [messages, setMessages] = useState<ContactMsg[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api.adminContacts().then(({ messages }) => setMessages(messages)).catch(() => setMessages([]));
  }, []);

  const markRead = async (id: string) => {
    setBusy(id);
    try {
      await api.adminMarkContact(id);
      setMessages((prev) => prev?.map((m) => (m.id === id ? { ...m, read: true } : m)) ?? null);
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  if (!messages) return <PageLoader label="Loading messages…" />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink">Contact messages</h1>

      {messages.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <Mail className="h-7 w-7 text-ink-muted" />
          <p className="text-ink-soft">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`card p-5 ${m.read ? '' : 'ring-1 ring-brand-200'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    {m.name}
                    {!m.read && <span className="badge bg-brand-50 text-brand-700">New</span>}
                  </p>
                  <a href={`mailto:${m.email}`} className="text-sm text-brand-600 hover:text-brand-700">{m.email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-muted">{new Date(m.createdAt).toLocaleString()}</span>
                  {!m.read && (
                    <button onClick={() => markRead(m.id)} disabled={busy === m.id} className="btn-ghost px-2.5 py-1.5 text-xs">
                      <Check className="h-3.5 w-3.5" /> Mark read
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
