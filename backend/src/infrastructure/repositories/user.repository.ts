import { Injectable } from '@nestjs/common';
import { Repository, QueryFailedError } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UserRepositoryPort } from 'src/domain/ports/user-repository.port';
import { UserEntity } from 'src/domain/entities/user.entity';
import { UserOrmEntity } from '../db/entities/user.orm-entity';
import { UserAlreadyExistsError } from 'src/domain/errors/user-already-exists.error';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalized = (email ?? '').trim().toLowerCase();

    const row = await this.repo.findOne({ where: { email: normalized } });
    return row
      ? new UserEntity(row.id, row.email, row.passwordHash, row.createdAt)
      : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row
      ? new UserEntity(row.id, row.email, row.passwordHash, row.createdAt)
      : null;
  }

  async create(email: string, passwordHash: string): Promise<UserEntity> {
    const normalized = (email ?? '').trim().toLowerCase();

    try {
      const row = this.repo.create({ email: normalized, passwordHash });
      const saved = await this.repo.save(row);

      return new UserEntity(
        saved.id,
        saved.email,
        saved.passwordHash,
        saved.createdAt,
      );
    } catch (e: unknown) {
      if (e instanceof QueryFailedError) {
        const driverErrUnknown: unknown = (e as QueryFailedError).driverError;

        let code: string | undefined;
        if (driverErrUnknown && typeof driverErrUnknown === 'object') {
          const maybeCode = (driverErrUnknown as Record<string, unknown>).code;
          if (typeof maybeCode === 'string') {
            code = maybeCode;
          }
        }

        if (code === '23505') {
          throw new UserAlreadyExistsError();
        }
      }

      throw e;
    }
  }
}
