import { http } from './http';

export type TransactionDto = {
  txId: string;
  blockNumber: number | null;
  timestampMs: number;
  from: string;
  to: string;
  amountTrx: string;
  tokenAmount?: string;
  tokenSymbol?: string;
  direction: 'IN' | 'OUT';
  asset: 'TRX' | 'TRC20';
};

export type LimitsDto = {
  dailyLimit: number;
  dailyRemaining: number;
  minuteLimit: number;
  minuteRemaining: number;
  dayUtc: string;

  // ✅ новое поле
  minuteResetInMs: number;
};

export type TransactionsResponseDto = {
  items: TransactionDto[];
  page: number;
  pageSize: number;
  nextCursor?: string;
  limits: LimitsDto;
};

export type GetTransactionsQuery = {
  address: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  page?: number;
  cursor?: string;
  asset?: 'trx' | 'trc20';
};

export const transactionsApi = {
  get(q: GetTransactionsQuery) {
    const params = new URLSearchParams();
    params.set('address', q.address);
    if (q.dateFrom) params.set('dateFrom', q.dateFrom);
    if (q.dateTo) params.set('dateTo', q.dateTo);
    if (q.page) params.set('page', String(q.page));
    if (q.cursor) params.set('cursor', q.cursor);
    if (q.asset) params.set('asset', q.asset);

    return http.get<TransactionsResponseDto>(`/transactions?${params.toString()}`);
  },
};
