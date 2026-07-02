'use client';

import { useEffect } from 'react';
import { useAuthModal } from './AuthModal';

export function AuthQueryWatcher() {
  const { open } = useAuthModal();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'login' || auth === 'signup') {
      open(auth);
      params.delete('auth');
      const qs = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
    }
  }, [open]);

  return null;
}
