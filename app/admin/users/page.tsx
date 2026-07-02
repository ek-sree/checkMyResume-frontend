'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';
import { Spinner } from '@/components/Spinner';
import { api } from '@/lib/api';
import type { AdminUser } from '@/lib/types';
import { Search } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <AdminShell>
      <UsersList />
    </AdminShell>
  );
}

function UsersList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (query?: string) => {
    setLoading(true);
    api
      .adminUsers(query)
      .then(({ users }) => setUsers(users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-ink">Users</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(q);
          }}
          className="relative w-full max-w-xs"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email…"
            className="input pl-9"
          />
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-3 py-3 font-semibold">Plan</th>
              <th className="px-3 py-3 font-semibold">AI runs</th>
              <th className="px-3 py-3 font-semibold">Tokens</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center"><Spinner className="mx-auto h-5 w-5" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-muted">No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/users/${u.id}`} className="block">
                      <span className="flex items-center gap-2 font-medium text-ink">
                        {u.name}
                        {u.role === 'admin' && <span className="badge bg-brand-50 text-brand-700">Admin</span>}
                      </span>
                      <span className="text-xs text-ink-muted">{u.email}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 capitalize text-ink-soft">{u.plan}</td>
                  <td className="px-3 py-3 text-ink-soft">{u.aiRuns}</td>
                  <td className="px-3 py-3 text-ink-soft">{u.tokensUsed.toLocaleString()}</td>
                  <td className="px-3 py-3">
                    {u.blocked ? (
                      <span className="badge bg-rose-50 text-rose-700">Blocked</span>
                    ) : (
                      <span className="badge bg-emerald-50 text-emerald-700">Active</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
