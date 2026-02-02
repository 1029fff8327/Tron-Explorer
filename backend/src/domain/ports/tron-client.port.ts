export type TronTx = {
  txId: string;
  blockNumber: number | null;
  timestampMs: number;
  from: string;
  to: string;
  amountTrx: string;

  asset: 'TRX' | 'TRC20';

  tokenAmount?: string;
  tokenSymbol?: string;
};

export interface TronClientPort {
  getTrxTransactions(params: {
    address: string;
    limit: number;
    fingerprint?: string;
    minTimestampMs?: number;
    maxTimestampMs?: number;
  }): Promise<{ data: TronTx[]; nextFingerprint?: string }>;

  getTrc20Transactions(params: {
    address: string;
    limit: number;
    fingerprint?: string;
    minTimestampMs?: number;
    maxTimestampMs?: number;
  }): Promise<{ data: TronTx[]; nextFingerprint?: string }>;
}
