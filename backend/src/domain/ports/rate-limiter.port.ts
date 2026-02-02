export interface RateLimiterPort {
  consume(
    key: string,
    points: number,
    durationSec: number,
  ): Promise<{ remaining: number; resetMs: number }>;
}
