'use client';

import { Button } from '@/shared/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/features/auth/model/useAuth';
import { useRouter } from 'next/navigation';

export function HomeActions() {
  const router = useRouter();
  const { isAuthed, logout } = useAuth();

  if (!isAuthed) {
    return (
      <div className="flex flex-wrap gap-3">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="secondary">Register</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/transactions">
        <Button>Transactions</Button>
      </Link>

      <Button
        variant="secondary"
        onClick={() => {
          logout();
          router.push('/login');
        }}
      >
        Logout
      </Button>
    </div>
  );
}
