'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ComparisonResults } from '@/components/ComparisonResults';
import { PageLoader } from '@/components/Spinner';
import { api, ApiError } from '@/lib/api';
import type { Comparison } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

export default function ComparisonDetailPage() {
  return (
    <AppShell>
      <Detail />
    </AppShell>
  );
}

function Detail() {
  const params = useParams<{ id: string }>();
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getComparison(params.id)
      .then(({ comparison }) => setComparison(comparison))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load comparison.'));
  }, [params.id]);

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-soft">{error}</p>
        <Link href="/compare" className="mt-4 inline-block font-medium text-brand-600 hover:text-brand-700">Back</Link>
      </div>
    );
  }
  if (!comparison) return <PageLoader label="Loading comparison…" />;

  return (
    <div className="space-y-6">
      <Link href="/compare" className="btn-ghost -ml-2">
        <ArrowLeft className="h-4 w-4" /> Compare
      </Link>
      <h1 className="text-2xl font-bold text-ink">{comparison.jobTitle || 'Resume comparison'}</h1>
      <ComparisonResults comparison={comparison} />
    </div>
  );
}
