'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useAuthModal } from './AuthModal';
import { Spinner } from './Spinner';
import { Check, Sparkles, Zap } from 'lucide-react';
import type { PlanDef, Plan } from '@/lib/types';
import { FALLBACK_PLANS } from '@/lib/plans';

const POPULAR: Plan = 'pro';

export function Pricing({ heading = true }: { heading?: boolean }) {
  const { user } = useAuth();
  const { open } = useAuthModal();

  const [plans, setPlans] = useState<PlanDef[]>([]);
  const [billingEnabled, setBillingEnabled] = useState(false);
  const [busy, setBusy] = useState<Plan | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    api
      .plans()
      .then((r) => {
        setPlans(r.plans);
        setBillingEnabled(r.billingEnabled);
      })
      .catch(() => setPlans(FALLBACK_PLANS)); 
  }, []);

  const choose = async (plan: PlanDef) => {
    setNote('');
    if (!user) {
      open('signup');
      return;
    }
    if (plan.id === user.plan) return;
    if (plan.id === 'free') return;

    setBusy(plan.id);
    try {
      if (!billingEnabled) {
        setNote('Razorpay checkout is not enabled yet. Add your Razorpay key ID and secret to the backend to start real payments.');
        return;
      }

      const { url } = await api.createCheckout(plan.id);
      window.location.assign(url);
    } catch (err) {
      setNote(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  const cta = (plan: PlanDef): string => {
    if (!user) return plan.price === 0 ? 'Get started' : `Choose ${plan.name}`;
    if (plan.id === user.plan) return 'Current plan';
    if (plan.price === 0) return 'Included';
    return billingEnabled ? `Upgrade to ${plan.name}` : 'Enable Razorpay';
  };

  return (
    <div>
      {heading && (
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">Simple, honest pricing</h2>
          <p className="mt-3 text-lg text-ink-soft">Start free. Upgrade when you’re ready to go all in.</p>
          {!billingEnabled && (
            <p className="mt-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Real Razorpay checkout will activate once your backend keys are configured.
            </p>
          )}
        </div>
      )}

      {note && (
        <p className="mx-auto mb-6 max-w-md rounded-lg bg-brand-50 px-3 py-2 text-center text-sm text-brand-700">{note}</p>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const popular = plan.id === POPULAR;
          const current = user?.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={`card relative flex flex-col p-6 transition-shadow duration-200 hover:shadow-lift ${
                popular ? 'ring-2 ring-brand-300' : ''
              }`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-soft">
                  Most popular
                </span>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
                {plan.id === 'premium' && <Zap className="h-5 w-5 text-brand-600" />}
              </div>
              <p className="mt-1 text-sm text-ink-muted">{plan.tagline}</p>

              <p className="mt-4 font-display text-4xl font-bold text-ink">
                {plan.price === 0 ? 'Free' : <>₹{plan.price}<span className="text-base font-medium text-ink-muted">/mo</span></>}
              </p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {h}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => choose(plan)}
                disabled={current || busy === plan.id || (!!user && plan.id === 'free')}
                className={`mt-6 w-full py-3 ${popular ? 'btn-brand' : 'btn-outline'} ${current ? 'opacity-60' : ''}`}
              >
                {busy === plan.id ? (
                  <Spinner />
                ) : (
                  <>
                    {!user && plan.id !== 'free' && <Sparkles className="h-4 w-4" />}
                    {cta(plan)}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
