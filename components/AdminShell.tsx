'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Logo } from './Logo';
import { PageLoader } from './Spinner';
import { LayoutGrid, Users, Receipt, Mail, Send, ArrowLeft, ShieldCheck } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutGrid },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: Receipt },
  { href: '/admin/contacts', label: 'Contacts', icon: Mail },
  { href: '/admin/notify', label: 'Notify', icon: Send },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/?auth=login');
    else if (user.role !== 'admin') router.replace('/dashboard');
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'admin') return <PageLoader />;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-ink text-white">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/admin" />
            <span className="badge bg-white/10 text-white">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> App
          </Link>
        </div>
        {/* Mobile nav */}
        <nav className="container-page flex gap-1 overflow-x-auto pb-2 md:hidden">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/80">
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container-page animate-fade-up py-8">{children}</main>
    </div>
  );
}
