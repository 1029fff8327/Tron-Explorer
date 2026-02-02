import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetTransactionsQuery } from 'src/application/dto/transactions/get-transactions.query';
import { LimitsService } from 'src/application/services/limits.service';
import { GetWalletTransactionsUseCase } from 'src/application/use-cases/transactions/get-wallet-transactions.usecase';
import { TransactionDto } from 'src/application/dto/transactions/transaction.dto';

import { InvalidAddressError } from 'src/domain/errors/invalid-address.error';
import { LimitExceededError } from 'src/domain/errors/limit-exceeded.error';
import { WalletAddressVO } from 'src/domain/value-objects/wallet-address.vo';
import { UtcDateRangeVO } from 'src/domain/value-objects/utc-date-range.vo';

type AuthedRequest = Request & {
  user: { userId: string; email: string };
};

type WalletTx = {
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

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly limits: LimitsService,
    private readonly getTxUc: GetWalletTransactionsUseCase,
  ) {}

  private mapError(e: any): never {
    if (e instanceof InvalidAddressError) {
      throw new BadRequestException(e.message);
    }

    if (e instanceof LimitExceededError) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: e.message,
          limits: e.details ?? null,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    throw e;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async get(@Req() req: AuthedRequest, @Query() q: GetTransactionsQuery) {
    const userId = req.user.userId;

    const page = q.page ?? 1;
    const pageSize = 20;

    if (page > 1 && !q.cursor) {
      throw new BadRequestException('cursor is required for page > 1');
    }

    try {
      const addressNorm = new WalletAddressVO(q.address).value;
      UtcDateRangeVO.fromYmd(q.dateFrom, q.dateTo);

      const lim = await this.limits.consumeOrThrow(userId);

      const result = await this.getTxUc.execute({
        address: addressNorm,
        dateFrom: q.dateFrom,
        dateTo: q.dateTo,
        cursor: q.cursor,
        pageSize,
        asset: q.asset ?? 'trx',
      });

      const items: TransactionDto[] = (result.items as WalletTx[]).map((t) => {
        const to = (t.to ?? '').trim();
        const from = (t.from ?? '').trim();

        let direction: 'IN' | 'OUT' = 'OUT';
        if (from === addressNorm) direction = 'OUT';
        else if (to === addressNorm) direction = 'IN';

        return {
          txId: t.txId,
          blockNumber: t.blockNumber,
          timestampMs: t.timestampMs,
          from,
          to,
          amountTrx: String(t.amountTrx),
          tokenAmount: t.tokenAmount,
          tokenSymbol: t.tokenSymbol,
          asset: t.asset,
          direction,
        };
      });

      return {
        items,
        page,
        pageSize,
        nextCursor: result.nextCursor,
        limits: {
          dailyLimit: 100,
          dailyRemaining: lim.dailyRemaining,
          minuteLimit: 2,
          minuteRemaining: lim.minuteRemaining,
          dayUtc: lim.dayUtc,
          minuteResetInMs: lim.minuteResetInMs,
        },
      };
    } catch (e) {
      this.mapError(e);
    }
  }
}
