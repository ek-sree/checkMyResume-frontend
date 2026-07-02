'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAuthModal } from './AuthModal';
import { Logo } from './Logo';
import type { User } from '@/lib/types';
import {
  LayoutDashboard,
  Target,
  GitCompare,
  MessageSquare,
  BarChart3,
  CreditCard,
  LogOut,
  Sparkles,
  ChevronDown,
  UserCog,
  Receipt,
  ShieldCheck,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyze', label: 'Analyze', icon: Target },
  { href: '/compare', label: 'Compare', icon: GitCompare },
  { href: '/interview', label: 'Interview', icon: MessageSquare },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/billing', label: 'Billing', icon: CreditCard },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { open } = useAuthModal();
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = () => {
    void logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo href={user ? '/dashboard' : '/'} />
          {user && (
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      active ? 'bg-ink/5 text-ink' : 'text-ink-muted hover:bg-ink/5 hover:text-ink'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span
                className="badge border border-line bg-surface text-ink-soft"
                title={user.plan === 'free' ? 'Free credits remaining' : `${user.plan} plan`}
              >
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                {user.plan === 'free'
                  ? `${user.credits} credits`
                  : user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
              </span>
              <AccountMenu user={user} onLogout={onLogout} />
            </>
          ) : (
            <>
              <Link href="/contact" className="btn-ghost hidden sm:inline-flex">
                Contact
              </Link>
              <button onClick={() => open('login')} className="btn-ghost">
                Log in
              </button>
              <button onClick={() => open('signup')} className="btn-primary">
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function AccountMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-line bg-surface p-0.5 pr-2 transition-colors hover:border-ink/30"
        aria-label="Account menu"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface shadow-lift">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
          <div className="p-1.5">
            {user.role === 'admin' && (
              <MenuLink href="/admin" icon={ShieldCheck} label="Admin panel" onClick={() => setOpen(false)} />
            )}
            <MenuLink href="/account" icon={UserCog} label="Account" onClick={() => setOpen(false)} />
            <MenuLink href="/payments" icon={Receipt} label="Payments & invoices" onClick={() => setOpen(false)} />
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof UserCog;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
