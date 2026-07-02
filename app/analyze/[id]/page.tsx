'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { AnalysisResults } from '@/components/AnalysisResults';
import { PageLoader } from '@/components/Spinner';
import { api, ApiError } from '@/lib/api';
import type { Analysis } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

export default function AnalysisDetailPage() {
  return (
    <AppShell>
      <AnalysisDetail />
    </AppShell>
  );
}

function AnalysisDetail() {
  const params = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getAnalysis(params.id)
      .then(({ analysis }) => setAnalysis(analysis))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load analysis.'));
  }, [params.id]);

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-soft">{error}</p>
        <Link href="/dashboard" className="mt-4 inline-block font-medium text-brand-600 hover:text-brand-700">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!analysis) return <PageLoader label="Loading analysis…" />;

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="btn-ghost -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>
      <AnalysisResults analysis={analysis} />
    </div>
  );
}
