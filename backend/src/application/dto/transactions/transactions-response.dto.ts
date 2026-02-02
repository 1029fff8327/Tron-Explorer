import { LimitsDto } from './limits.dto';
import { TransactionDto } from './transaction.dto';

export class TransactionsResponseDto {
  items!: TransactionDto[];
  page!: number;
  pageSize!: number;
  nextCursor?: string;
  limits!: LimitsDto;
}
