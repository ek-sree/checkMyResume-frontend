'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageLoader, Spinner } from '@/components/Spinner';
import { useAuth } from '@/lib/auth';
import { api, downloadInvoice } from '@/lib/api';
import type { Payment } from '@/lib/types';
import { Download, CheckCircle2, Receipt, CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <AppShell>
      <Payments />
    </AppShell>
  );
}

function Payments() {
  const { refresh } = useAuth();
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('success') === '1';
    const paymentId = params.get('razorpay_payment_id');

    setSuccess(isSuccess);

    const load = async () => {
      if (isSuccess && paymentId) {
        try {
          await api.confirmPayment(paymentId);
        } catch {
        }
        window.history.replaceState(null, '', window.location.pathname);
      }

      await refresh(); 
      try {
        const { payments } = await api.payments();
        setPayments(payments);
      } catch {
        setPayments([]);
      }
    };

    void load();
  }, [refresh]);

  const dl = async (id: string, invoiceNumber: string) => {
    setBusy(id);
    try {
      const blob = await downloadInvoice(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  const methodBadge = (m: Payment['method']) => {
    const map: Record<Payment['method'], string> = {
      card: 'bg-brand-50 text-brand-700',
      upi: 'bg-emerald-50 text-emerald-700',
      demo: 'bg-amber-50 text-amber-700',
    };
    return <span className={`badge ${map[m]}`}>{m.toUpperCase()}</span>;
  };

  if (!payments) return <PageLoader label="Loading payments…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Payments & invoices</h1>
          <p className="mt-1 text-ink-soft">Your subscription history — download any invoice as a PDF.</p>
        </div>
        <Link href="/billing" className="btn-outline">
          <CreditCard className="h-4 w-4" /> Plans
        </Link>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 animate-fade-up">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Payment successful — your plan is active and your invoice has been emailed to you.
        </div>
      )}

      {payments.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/5">
            <Receipt className="h-6 w-6 text-ink-muted" />
          </span>
          <p className="text-ink-soft">No payments yet.</p>
          <Link href="/billing" className="btn-brand mt-1">Choose a plan</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[1fr,1fr,1fr,1fr,auto] gap-4 border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted sm:grid">
            <span>Date</span>
            <span>Plan</span>
            <span>Amount</span>
            <span>Method</span>
            <span>Invoice</span>
          </div>
          <ul className="divide-y divide-line">
            {payments.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-2 items-center gap-3 px-5 py-4 sm:grid-cols-[1fr,1fr,1fr,1fr,auto]"
              >
                <span className="text-sm text-ink-soft">{new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="text-sm font-medium text-ink">{p.planName}</span>
                <span className="text-sm font-semibold text-ink">₹{p.amount}</span>
                <span>{methodBadge(p.method)}</span>
                <button
                  onClick={() => dl(p.id, p.invoiceNumber)}
                  disabled={busy === p.id}
                  className="btn-outline justify-self-start px-3 py-2 text-xs sm:justify-self-end"
                >
                  {busy === p.id ? <Spinner className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                  Invoice
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
