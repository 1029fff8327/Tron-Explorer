'use client';

import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';
import { useAuth } from '@/features/auth/model/useAuth';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed, logout } = useAuth();

  const nav = isAuthed
    ? [
        { href: '/', label: 'Home' },
        { href: '/transactions', label: 'Transactions' },
      ]
    : [
        { href: '/', label: 'Home' },
        { href: '/login', label: 'Login' },
        { href: '/register', label: 'Register' },
      ];

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Tron Explorer
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-3 text-sm">
            {nav.map((x) => {
              const active = pathname === x.href;
              return (
                <Link
                  key={x.href}
                  href={x.href}
                  className={[
                    'rounded-md px-3 py-1.5 transition',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                >
                  {x.label}
                </Link>
              );
            })}
          </nav>

          {isAuthed && (
            <button
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
              onClick={() => {
                logout();
                router.push('/login');
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
