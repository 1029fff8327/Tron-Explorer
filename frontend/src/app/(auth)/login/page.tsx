'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { AuthForm } from '@/features/auth/ui/AuthForm';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get('next') || '/transactions';

  return <AuthForm mode="login" onSuccess={() => router.push(next)} />;
}
