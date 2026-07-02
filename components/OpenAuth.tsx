'use client';

import { useAuthModal } from './AuthModal';

export function OpenAuth({
  mode = 'login',
  className,
  children,
}: {
  mode?: 'login' | 'signup';
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useAuthModal();
  return (
    <button type="button" className={className} onClick={() => open(mode)}>
      {children}
    </button>
  );
}
