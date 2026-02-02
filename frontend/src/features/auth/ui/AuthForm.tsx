'use client';

import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { authApi } from '@/shared/api/auth.api';
import { tokenStorage } from '@/shared/lib/storage';
import { useState } from 'react';

type Props = {
  mode: 'login' | 'register';
  onSuccess?: () => void;
};

function getErrorMessage(e: unknown): string {
  if (!e) return 'Request failed';
  if (typeof e === 'string') return e;
  if (typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string')
    return (e as any).message;
  return 'Request failed';
}

export function AuthForm({ mode, onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const res =
        mode === 'login'
          ? await authApi.login(email, password)
          : await authApi.register(email, password);

      tokenStorage.set(res.accessToken);
      onSuccess?.();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          {mode === 'login' ? 'Login' : 'Register'}
        </h1>
        <p className="text-sm text-white/60">
          {mode === 'login'
            ? 'Use your credentials to sign in'
            : 'Create account to get access token'}
        </p>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <Button className="w-full" disabled={loading} onClick={submit}>
        {loading ? '...' : mode === 'login' ? 'Login' : 'Create account'}
      </Button>
    </div>
  );
}
