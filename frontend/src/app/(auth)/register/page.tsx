'use client';

import { AuthForm } from '@/features/auth/ui/AuthForm';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  return (
    <AuthForm mode="register" onSuccess={() => router.push('/transactions')} />
  );
}
