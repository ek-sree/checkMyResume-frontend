'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from './Navbar';
import { PageLoader } from './Spinner';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/?auth=login');
  }, [loading, user, router]);

  if (loading) return <PageLoader />;
  if (!user) return <PageLoader label="Redirecting…" />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container-page animate-fade-up py-8 sm:py-10">{children}</main>
    </div>
  );
}
