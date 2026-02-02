export class TransactionDto {
  txId!: string;
  blockNumber!: number | null;
  timestampMs!: number;
  from!: string;
  to!: string;
  amountTrx!: string;

  tokenAmount?: string;
  tokenSymbol?: string;

  direction!: 'IN' | 'OUT';
  asset!: 'TRX' | 'TRC20';
}
