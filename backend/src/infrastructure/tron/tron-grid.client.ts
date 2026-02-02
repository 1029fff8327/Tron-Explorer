import { TronClientPort, TronTx } from 'src/domain/ports/tron-client.port';
import axios, { AxiosInstance } from 'axios';

import { Injectable } from '@nestjs/common';
import TronWeb from 'tronweb';

type TronGridMeta = { fingerprint?: string };
type TronGridResponse<T> = { data?: T[]; meta?: TronGridMeta };

type TronGridTrxTx = {
  txID?: string;
  txid?: string;
  transaction_id?: string;
  block_number?: number;
  block_timestamp?: number;
  raw_data?: {
    timestamp?: number;
    contract?: Array<{
      type?: string;
      parameter?: { value?: Record<string, unknown> };
    }>;
  };
};

type TronGridTrc20Tx = {
  transaction_id?: string;
  txID?: string;
  txid?: string;
  block_number?: number;
  block_timestamp?: number;
  from?: string;
  to?: string;
  value?: string;
  token_info?: { symbol?: string; decimals?: number };
};

type QueryParams = Record<string, string | number | boolean | undefined>;

function sunToTrxString(sun: string): string {
  const v = BigInt(sun || '0');
  const whole = v / 1_000_000n;
  const frac = (v % 1_000_000n).toString().padStart(6, '0');
  return `${whole}.${frac}`;
}

function intToDecimalString(value: string, decimals: number): string {
  const v = BigInt(value || '0');
  if (!decimals) return v.toString();

  const base = 10n ** BigInt(decimals);
  const whole = v / base;
  const frac = (v % base).toString().padStart(decimals, '0');

  const trimmed = frac.replace(/0+$/, '');
  return trimmed.length ? `${whole}.${trimmed}` : `${whole}`;
}

type FromHexFn = (hex: string) => string;
type TronWebLike = {
  address?: { fromHex?: FromHexFn };
  utils?: { address?: { fromHex?: FromHexFn } };
};

@Injectable()
export class TronGridClient implements TronClientPort {
  private readonly baseUrl = process.env.TRONGRID_BASE_URL!;
  private readonly apiKey = process.env.TRONGRID_API_KEY!;
  private readonly client: AxiosInstance;

  private readonly tronWebLib: typeof TronWeb;

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: { 'TRON-PRO-API-KEY': this.apiKey },
      timeout: 15_000,
    });

    this.tronWebLib = TronWeb;
  }

  private fromHexSafe(hex: string): string {
    const h = typeof hex === 'string' ? hex.trim() : '';
    if (!h) return '';

    const lib = this.tronWebLib as unknown as TronWebLike;

    try {
      const fn = lib.address?.fromHex;
      if (typeof fn === 'function') return fn(h);
    } catch {
      // ignore
    }

    try {
      const fn = lib.utils?.address?.fromHex;
      if (typeof fn === 'function') return fn(h);
    } catch {
      // ignore
    }

    return '';
  }

  async getTrxTransactions(params: {
    address: string;
    limit: number;
    fingerprint?: string;
    minTimestampMs?: number;
    maxTimestampMs?: number;
  }): Promise<{ data: TronTx[]; nextFingerprint?: string }> {
    const q: QueryParams = {
      limit: params.limit,
      order_by: 'block_timestamp,desc',
      only_confirmed: true,
    };

    if (params.fingerprint) q.fingerprint = params.fingerprint;
    if (typeof params.minTimestampMs === 'number')
      q.min_timestamp = params.minTimestampMs;
    if (typeof params.maxTimestampMs === 'number')
      q.max_timestamp = params.maxTimestampMs;

    const res = await this.client.get<TronGridResponse<TronGridTrxTx>>(
      `/v1/accounts/${params.address}/transactions`,
      { params: q },
    );

    const rows = res.data.data ?? [];

    const items: TronTx[] = rows
      .map((t) => {
        const ts = Number(t.block_timestamp ?? t.raw_data?.timestamp ?? 0);

        const contract = t.raw_data?.contract?.[0];
        if (!contract) return null;

        if (contract.type !== 'TransferContract') return null;

        const value = contract.parameter?.value;

        const ownerHexRaw = value?.owner_address;
        const ownerHex = typeof ownerHexRaw === 'string' ? ownerHexRaw : '';

        const toHexRaw = value?.to_address;
        const toHex = typeof toHexRaw === 'string' ? toHexRaw : '';

        const from = ownerHex ? this.fromHexSafe(ownerHex) : '';
        const to = toHex ? this.fromHexSafe(toHex) : '';

        const amtRaw = value?.amount;
        const amountSun =
          typeof amtRaw === 'number' || typeof amtRaw === 'string'
            ? String(amtRaw)
            : '0';

        const txId = t.txID ?? t.txid ?? t.transaction_id;
        if (!txId) return null;

        const tx: TronTx = {
          txId,
          blockNumber:
            typeof t.block_number === 'number' ? t.block_number : null,
          timestampMs: ts,
          from,
          to,
          amountTrx: sunToTrxString(amountSun),
          asset: 'TRX',
        };

        return tx;
      })
      .filter((x): x is TronTx => Boolean(x));

    const next = res.data.meta?.fingerprint;
    return { data: items, nextFingerprint: next };
  }

  async getTrc20Transactions(params: {
    address: string;
    limit: number;
    fingerprint?: string;
    minTimestampMs?: number;
    maxTimestampMs?: number;
  }): Promise<{ data: TronTx[]; nextFingerprint?: string }> {
    const q: QueryParams = {
      limit: params.limit,
      order_by: 'block_timestamp,desc',
      only_confirmed: true,
    };

    if (params.fingerprint) q.fingerprint = params.fingerprint;
    if (typeof params.minTimestampMs === 'number')
      q.min_timestamp = params.minTimestampMs;
    if (typeof params.maxTimestampMs === 'number')
      q.max_timestamp = params.maxTimestampMs;

    const res = await this.client.get<TronGridResponse<TronGridTrc20Tx>>(
      `/v1/accounts/${params.address}/transactions/trc20`,
      { params: q },
    );

    const rows = res.data.data ?? [];

    const items: TronTx[] = rows
      .map((t) => {
        const ts = Number(t.block_timestamp ?? 0);
        const txId = t.transaction_id ?? t.txID ?? t.txid;
        if (!txId) return null;

        const symbol =
          typeof t.token_info?.symbol === 'string' ? t.token_info.symbol : '';
        const decimals =
          typeof t.token_info?.decimals === 'number'
            ? t.token_info.decimals
            : 0;

        const raw = typeof t.value === 'string' ? t.value : '0';
        const tokenAmount = intToDecimalString(raw, decimals);

        const tx: TronTx = {
          txId,
          blockNumber:
            typeof t.block_number === 'number' ? t.block_number : null,
          timestampMs: ts,
          from: t.from ?? '',
          to: t.to ?? '',
          amountTrx: '0',
          asset: 'TRC20',
          tokenAmount,
          tokenSymbol: symbol,
        };

        return tx;
      })
      .filter((x): x is TronTx => Boolean(x));

    const next = res.data.meta?.fingerprint;
    return { data: items, nextFingerprint: next };
  }
}
