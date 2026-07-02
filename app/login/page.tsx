'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/Spinner';

export default function LoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/?auth=login');
  }, [router]);
  return <PageLoader label="Opening sign in…" />;
}
