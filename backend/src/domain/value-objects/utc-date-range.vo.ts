import { InvalidDateRangeError } from 'src/domain/errors/invalid-date-range.error';

export class UtcDateRangeVO {
  constructor(
    public readonly from?: Date,
    public readonly to?: Date,
  ) {}

  static fromYmd(fromYmd?: string, toYmd?: string) {
    const from = fromYmd ? new Date(`${fromYmd}T00:00:00.000Z`) : undefined;
    const to = toYmd ? new Date(`${toYmd}T23:59:59.999Z`) : undefined;

    if (from && Number.isNaN(from.getTime())) {
      throw new InvalidDateRangeError('Invalid dateFrom');
    }
    if (to && Number.isNaN(to.getTime())) {
      throw new InvalidDateRangeError('Invalid dateTo');
    }
    if (from && to && from.getTime() > to.getTime()) {
      throw new InvalidDateRangeError('dateFrom > dateTo');
    }

    return new UtcDateRangeVO(from, to);
  }
}
