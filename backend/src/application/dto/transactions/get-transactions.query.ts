import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class GetTransactionsQuery {
  @IsString()
  address!: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dateFrom?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsIn(['trx', 'trc20'])
  asset?: 'trx' | 'trc20' = 'trx';
}
