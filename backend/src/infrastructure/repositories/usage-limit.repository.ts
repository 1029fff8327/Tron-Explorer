import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsageLimitRepositoryPort } from 'src/domain/ports/usage-limit-repository.port';
import { UsageLimitOrmEntity } from '../db/entities/usage-limit.orm-entity';

type DayRow = { count: number };
type TryIncResult = { ok: boolean; count: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

@Injectable()
export class UsageLimitRepository implements UsageLimitRepositoryPort {
  constructor(
    private readonly ds: DataSource,
    @InjectRepository(UsageLimitOrmEntity)
    private readonly repo: Repository<UsageLimitOrmEntity>,
  ) {}

  async getOrCreateDay(userId: string, dayUtc: string): Promise<DayRow> {
    const existing = await this.repo.findOne({ where: { userId, dayUtc } });
    if (existing) return { count: existing.count };

    try {
      const created = this.repo.create({ userId, dayUtc, count: 0 });
      const saved = await this.repo.save(created);
      return { count: saved.count };
    } catch {
      const again = await this.repo.findOne({ where: { userId, dayUtc } });
      return { count: again?.count ?? 0 };
    }
  }

  async incrementDay(
    userId: string,
    dayUtc: string,
    delta: number,
  ): Promise<DayRow> {
    return this.ds.transaction(async (em) => {
      const r = em.getRepository(UsageLimitOrmEntity);

      let row = await r.findOne({ where: { userId, dayUtc } });
      if (!row) {
        row = r.create({ userId, dayUtc, count: 0 });
        row = await r.save(row);
      }

      row.count += delta;
      const saved = await r.save(row);
      return { count: saved.count };
    });
  }

  async tryIncrementDay(
    userId: string,
    dayUtc: string,
    limit: number,
  ): Promise<TryIncResult> {
    return this.ds.transaction(async (em) => {
      const r = em.getRepository(UsageLimitOrmEntity);

      await r
        .createQueryBuilder()
        .insert()
        .values({ userId, dayUtc, count: 0 })
        .orIgnore()
        .execute();

      const updated = await r
        .createQueryBuilder()
        .update()
        .set({ count: () => '"count" + 1' })
        .where(
          '"userId" = :userId AND "dayUtc" = :dayUtc AND "count" < :limit',
          { userId, dayUtc, limit },
        )
        .returning(['count'])
        .execute();

      // TypeORM updated.raw = any, аккуратно приводим к unknown
      const raw = updated.raw as unknown;

      const rows: unknown[] = Array.isArray(raw) ? (raw as unknown[]) : [];
      const first: unknown = rows.length > 0 ? rows[0] : undefined;

      let newCountRaw: unknown = undefined;
      if (isRecord(first)) {
        newCountRaw = first['count'];
      }

      const newCount =
        typeof newCountRaw === 'number'
          ? newCountRaw
          : typeof newCountRaw === 'string'
            ? Number(newCountRaw)
            : NaN;

      if (!Number.isFinite(newCount)) {
        return { ok: false, count: limit };
      }

      return { ok: true, count: newCount };
    });
  }
}
