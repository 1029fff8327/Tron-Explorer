import { LimitExceededError } from 'src/domain/errors/limit-exceeded.error';
import { RateLimiterPort } from 'src/domain/ports/rate-limiter.port';
import { UsageLimitRepositoryPort } from 'src/domain/ports/usage-limit-repository.port';
import { UtcClockService } from './utc-clock.service';

export class LimitsService {
  static DAILY_LIMIT = 100;
  static MINUTE_LIMIT = 2;

  constructor(
    private readonly usageRepo: UsageLimitRepositoryPort,
    private readonly rateLimiter: RateLimiterPort,
    private readonly clock: UtcClockService,
  ) {}

  private toResetInMs(rawResetMs: number): number {
    if (typeof rawResetMs !== 'number' || Number.isNaN(rawResetMs)) return 0;

    if (rawResetMs > 1_000_000_000_000) {
      return Math.max(0, rawResetMs - Date.now());
    }
    return Math.max(0, rawResetMs);
  }

  async consumeOrThrow(userId: string): Promise<{
    dayUtc: string;
    dailyRemaining: number;
    minuteRemaining: number;
    minuteResetInMs: number;
  }> {
    const dayUtc = this.clock.todayUtcDate();

    const snapshot = await this.usageRepo.getOrCreateDay(userId, dayUtc);

    const dailyRemainingBefore = Math.max(
      0,
      LimitsService.DAILY_LIMIT - snapshot.count,
    );

    if (snapshot.count >= LimitsService.DAILY_LIMIT) {
      throw new LimitExceededError('Daily limit exceeded', {
        dayUtc,
        dailyLimit: LimitsService.DAILY_LIMIT,
        dailyRemaining: 0,
        minuteLimit: LimitsService.MINUTE_LIMIT,
      });
    }

    const minute = await this.rateLimiter.consume(
      `tx:${userId}`,
      LimitsService.MINUTE_LIMIT,
      60,
    );

    const minuteResetInMs = this.toResetInMs(minute.resetMs);

    if (minute.remaining < 0) {
      throw new LimitExceededError('Too many requests per minute', {
        dayUtc,
        dailyLimit: LimitsService.DAILY_LIMIT,
        dailyRemaining: dailyRemainingBefore,
        minuteLimit: LimitsService.MINUTE_LIMIT,
        minuteRemaining: 0,
        minuteResetInMs,
      });
    }

    const inc = await this.usageRepo.tryIncrementDay(
      userId,
      dayUtc,
      LimitsService.DAILY_LIMIT,
    );

    if (!inc.ok) {
      throw new LimitExceededError('Daily limit exceeded', {
        dayUtc,
        dailyLimit: LimitsService.DAILY_LIMIT,
        dailyRemaining: 0,
        minuteLimit: LimitsService.MINUTE_LIMIT,
        minuteRemaining: Math.max(0, minute.remaining),
        minuteResetInMs,
      });
    }

    const dailyRemaining = LimitsService.DAILY_LIMIT - inc.count;

    return {
      dayUtc,
      dailyRemaining,
      minuteRemaining: minute.remaining,
      minuteResetInMs,
    };
  }
}
