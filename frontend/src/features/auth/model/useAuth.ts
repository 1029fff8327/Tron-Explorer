'use client';

import { authEvents, tokenStorage } from '@/shared/lib/storage';
import { useCallback, useEffect, useState } from 'react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setToken(tokenStorage.get());

    sync();

    window.addEventListener(authEvents.name, sync);

    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(authEvents.name, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setAccessToken = useCallback((t: string) => {
    tokenStorage.set(t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
  }, []);

  return {
    token,
    isAuthed: Boolean(token),
    setAccessToken,
    logout,
  };
}
