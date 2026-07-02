'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Pricing } from '@/components/Pricing';
import { PageLoader } from '@/components/Spinner';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { BillingStatus } from '@/lib/types';
import { Sparkles, Info } from 'lucide-react';

export default function BillingPage() {
  return (
    <AppShell>
      <Billing />
    </AppShell>
  );
}

function Billing() {
  const { user } = useAuth();
  const [status, setStatus] = useState<BillingStatus | null>(null);

  useEffect(() => {
    api.billingStatus().then(setStatus).catch(() => setStatus(null));
  }, [user?.plan]);

  if (!status) return <PageLoader label="Loading billing…" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Plans & billing</h1>
          <p className="mt-1 text-ink-soft">Pick the plan that matches your job search.</p>
        </div>
        <div className="card flex items-center gap-3 px-4 py-3">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-ink">{status.planName} plan</p>
            <p className="text-xs text-ink-muted">
              {status.unlimitedCredits ? 'Unlimited AI runs' : `${status.credits} credits remaining`}
            </p>
          </div>
        </div>
      </div>

      {!status.billingEnabled && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Real Razorpay checkout will open for card and UPI payments as soon as the backend has your Razorpay key ID
            and secret configured.
          </p>
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-2 text-sm sm:flex-row sm:items-center">
        <span className="text-ink-muted">Secure checkout — real Razorpay payments open directly from the plan button.</span>
        <Link href="/payments" className="font-medium text-brand-600 hover:text-brand-700">
          Payment history & invoices →
        </Link>
      </div>

      <Pricing heading={false} />
    </div>
  );
}
