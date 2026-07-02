'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from './store';

export const useAuth = useAuthStore;

export function AuthProvider({ children }: { children: ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);
  return <>{children}</>;
}
