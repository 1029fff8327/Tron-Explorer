import { TronClientPort, TronTx } from 'src/domain/ports/tron-client.port';

import { UtcDateRangeVO } from 'src/domain/value-objects/utc-date-range.vo';
import { WalletAddressVO } from 'src/domain/value-objects/wallet-address.vo';

type TronClientResponse = {
  data: TronTx[];
  nextFingerprint?: string | null;
};

function isTronClientResponse(v: unknown): v is TronClientResponse {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;

  if (!Array.isArray(obj.data)) return false;

  if ('nextFingerprint' in obj) {
    const nf = obj.nextFingerprint;
    if (nf !== undefined && nf !== null && typeof nf !== 'string') return false;
  }

  return true;
}

export class GetWalletTransactionsUseCase {
  constructor(private readonly tron: TronClientPort) {}

  async execute(params: {
    address: string;
    dateFrom?: string;
    dateTo?: string;

    cursor?: string;

    pageSize: number;
    asset: 'trx' | 'trc20';
  }): Promise<{ items: TronTx[]; nextCursor?: string }> {
    const address = new WalletAddressVO(params.address).value;

    const range = UtcDateRangeVO.fromYmd(params.dateFrom, params.dateTo);
    const minTimestampMs = range.from?.getTime();
    const maxTimestampMs = range.to?.getTime();

    const limit = params.pageSize;

    const raw: unknown =
      params.asset === 'trx'
        ? await this.tron.getTrxTransactions({
            address,
            limit,
            fingerprint: params.cursor,
            minTimestampMs,
            maxTimestampMs,
          })
        : await this.tron.getTrc20Transactions({
            address,
            limit,
            fingerprint: params.cursor,
            minTimestampMs,
            maxTimestampMs,
          });

    if (!isTronClientResponse(raw)) {
      throw new Error('Invalid Tron client response');
    }

    return {
      items: raw.data,
      nextCursor: raw.nextFingerprint ?? undefined,
    };
  }
}
