'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/Spinner';

export default function RegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/?auth=signup');
  }, [router]);
  return <PageLoader label="Opening sign up…" />;
}
