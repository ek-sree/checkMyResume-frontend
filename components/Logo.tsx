import Link from 'next/link';

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white shadow-soft transition-transform duration-200 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M13 2 4.5 13.2a.6.6 0 0 0 .48.96H11l-1 7.84 8.5-11.2a.6.6 0 0 0-.48-.96H12l1-7.84Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-ink">
        CheckMyResume
      </span>
    </Link>
  );
}
