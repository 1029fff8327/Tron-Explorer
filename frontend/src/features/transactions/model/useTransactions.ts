'use client';

import {
  GetTransactionsQuery,
  TransactionsResponseDto,
  transactionsApi,
} from '@/shared/api/transactions.api';
import { useCallback, useState } from 'react';

type HttpError = { status: number; message: string };

function isHttpError(e: unknown): e is HttpError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'status' in e &&
    'message' in e
  );
}

export function useTransactions() {
  const [data, setData] = useState<TransactionsResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<number | null>(null);

  const load = useCallback(async (q: GetTransactionsQuery) => {
    setError('');
    setStatus(null);
    setLoading(true);
    try {
      const res = await transactionsApi.get(q);
      setData(res);
      return res;
    } catch (e: unknown) {
      if (isHttpError(e)) {
        setStatus(e.status);
        setError(e.message);
      } else {
        setError((e as any)?.message || 'Failed to load transactions');
      }
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, status, load };
}
