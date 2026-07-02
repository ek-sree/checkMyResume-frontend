'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { PageLoader } from '@/components/Spinner';
import { api } from '@/lib/api';
import type { AdminPayment } from '@/lib/types';

export default function AdminPaymentsPage() {
  return (
    <AdminShell>
      <PaymentsList />
    </AdminShell>
  );
}

function PaymentsList() {
  const [payments, setPayments] = useState<AdminPayment[] | null>(null);

  useEffect(() => {
    api.adminPayments().then(({ payments }) => setPayments(payments)).catch(() => setPayments([]));
  }, []);

  if (!payments) return <PageLoader label="Loading payments…" />;
  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold text-ink">Payments</h1>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-ink-muted">Total revenue</p>
          <p className="font-display text-2xl font-bold text-ink">₹{total.toLocaleString()}</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-3 py-3 font-semibold">User</th>
              <th className="px-3 py-3 font-semibold">Plan</th>
              <th className="px-3 py-3 font-semibold">Amount</th>
              <th className="px-3 py-3 font-semibold">Method</th>
              <th className="px-5 py-3 font-semibold">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {payments.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-muted">No payments yet.</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="px-5 py-3 text-ink-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{p.user?.name ?? '—'}</p>
                    <p className="text-xs text-ink-muted">{p.user?.email ?? ''}</p>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{p.planName}</td>
                  <td className="px-3 py-3 font-semibold text-ink">₹{p.amount}</td>
                  <td className="px-3 py-3"><span className="badge bg-ink/5 text-ink-soft">{p.method.toUpperCase()}</span></td>
                  <td className="px-5 py-3 text-xs text-ink-muted">{p.invoiceNumber}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
