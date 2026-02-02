import { Injectable, OnModuleInit } from '@nestjs/common';

import { RateLimiterPort } from 'src/domain/ports/rate-limiter.port';
import Redis from 'ioredis';

@Injectable()
export class RedisRateLimiter implements RateLimiterPort, OnModuleInit {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT ?? 6379),
      lazyConnect: true,
    });
  }

  async onModuleInit() {
    await this.redis.connect().catch(() => undefined);
  }

  async consume(key: string, points: number, durationSec: number) {
    const now = Date.now();
    const redisKey = `rl:${key}`;

    const res = await this.redis.multi().incr(redisKey).pttl(redisKey).exec();

    const current = Number(res?.[0]?.[1] ?? 0);
    let ttl = Number(res?.[1]?.[1] ?? -1);

    if (current === 1) {
      await this.redis.expire(redisKey, durationSec);
      ttl = durationSec * 1000;
    } else if (ttl < 0) {
      await this.redis.expire(redisKey, durationSec).catch(() => undefined);
      ttl = durationSec * 1000;
    }

    const remaining = points - current;
    const resetMs = now + ttl;

    return { remaining, resetMs };
  }
}
