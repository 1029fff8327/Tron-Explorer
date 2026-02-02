'use client';

import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';

import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LimitsPanel } from '@/features/transactions/ui/LimitsPanel';
import { Select } from '@/shared/ui/Select';
import { TransactionsTable } from '@/entities/transaction/ui/TransactionsTable';
import { tokenStorage } from '@/shared/lib/storage';
import { usePathname, useRouter } from 'next/navigation';
import { useTransactions } from '@/features/transactions/model/useTransactions';

type Asset = 'trx' | 'trc20';

function isAsset(v: string): v is Asset {
  return v === 'trx' || v === 'trc20';
}

type ActiveQuery = {
  address: string;
  dateFrom?: string;
  dateTo?: string;
  asset: Asset;
};

export default function TransactionsPage() {
  const router = useRouter();
  const { data, loading, error, status, load } = useTransactions();
  const pathname = usePathname();

  const [address, setAddress] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [asset, setAsset] = useState<Asset>('trx');

  const [page, setPage] = useState(1);
  const [activeQuery, setActiveQuery] = useState<ActiveQuery | null>(null);

  const [cursorByPage, setCursorByPage] = useState<
    Record<number, string | undefined>
  >({ 1: undefined });

  useEffect(() => {
    if (status === 401) {
      tokenStorage.clear();
      const next = encodeURIComponent(pathname || '/transactions');
      router.push(`/login?next=${next}`);
    }
  }, [status, router, pathname]);

  const canPrev = page > 1 && !loading;

  const canNext = useMemo(() => {
    if (loading) return false;
    const nextCursor = cursorByPage[page + 1];
    return Boolean(nextCursor);
  }, [cursorByPage, page, loading]);

  async function fetchPage(p: number) {
    if (!activeQuery) return;

    const cursor = p === 1 ? undefined : cursorByPage[p];
    if (p > 1 && !cursor) return;

    setPage(p);

    const res = await load({
      address: activeQuery.address,
      dateFrom: activeQuery.dateFrom,
      dateTo: activeQuery.dateTo,
      asset: activeQuery.asset,
      page: p,
      cursor,
    });

    if (res) {
      setCursorByPage((prev) => {
        const next = { ...prev };

        // page 1 всегда без cursor
        next[1] = undefined;

        // сохраняем cursor для следующей страницы
        if (res.nextCursor) next[p + 1] = res.nextCursor;
        else delete next[p + 1];

        return next;
      });
    }
  }

  async function startSearch() {
    const a = address.trim();
    if (!a) return;

    const q: ActiveQuery = {
      address: a,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      asset,
    };

    // ✅ фикс бага: не вызываем fetchPage(1) пока activeQuery не обновился
    // делаем первый запрос напрямую и уже потом сохраняем query/cursors
    setPage(1);

    const res = await load({
      address: q.address,
      dateFrom: q.dateFrom,
      dateTo: q.dateTo,
      asset: q.asset,
      page: 1,
      cursor: undefined,
    });

    setActiveQuery(q);

    setCursorByPage(() => {
      const next: Record<number, string | undefined> = { 1: undefined };
      if (res?.nextCursor) next[2] = res.nextCursor;
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="text-sm text-white/60">
          Enter wallet address (T...) and fetch TRX / TRC20 history
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm text-white/60">Search</div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Wallet address (T...)"
                value={address}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAddress(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') startSearch();
                }}
              />
            </div>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDateFrom(e.target.value)
              }
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDateTo(e.target.value)
              }
            />

            <Select
              value={asset}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                const v = e.target.value;
                if (isAsset(v)) setAsset(v);
              }}
            >
              <option value="trx">TRX</option>
              <option value="trc20">TRC20</option>
            </Select>

            <Button
              className="md:col-span-1"
              disabled={loading || !address.trim()}
              onClick={startSearch}
            >
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {data?.limits && <LimitsPanel limits={data.limits} />}

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {data?.items && data.items.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">Result</div>
              <div className="text-sm text-white/60">Page {page}</div>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionsTable items={data.items} />

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={!canPrev}
                onClick={() => fetchPage(page - 1)}
              >
                Prev
              </Button>

              <Button
                variant="secondary"
                disabled={!canNext}
                onClick={() => fetchPage(page + 1)}
              >
                Next
              </Button>
            </div>

            <div className="mt-3 text-xs text-white/50">
              Cursor pagination: each page = 1 request to TronGrid
            </div>
          </CardContent>
        </Card>
      )}

      {data?.items && data.items.length === 0 && (
        <div className="text-sm text-white/60">
          No transactions found for this query.
        </div>
      )}
    </div>
  );
}
