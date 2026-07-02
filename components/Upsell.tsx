'use client';

import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';

export function Upsell({ title, body }: { title: string; body: string }) {
  return (
    <div className="card mx-auto mt-6 max-w-md p-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
        <Lock className="h-6 w-6 text-brand-600" />
      </span>
      <h2 className="mt-4 text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-soft">{body}</p>
      <Link href="/billing" className="btn-brand mt-6 px-6 py-3">
        <Sparkles className="h-4 w-4" />
        See plans
      </Link>
    </div>
  );
}
