import { AuthController } from './presentation/http/controllers/auth.controller';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { ConfigModule } from '@nestjs/config';
import { GetWalletTransactionsUseCase } from './application/use-cases/transactions/get-wallet-transactions.usecase';
import { JwtModule } from '@nestjs/jwt';
import { JwtSigner } from './infrastructure/security/jwt-signer';
import { JwtStrategy } from './presentation/http/strategies/jwt.strategy';
import { LimitsService } from './application/services/limits.service';
import { LoginUserUseCase } from './application/use-cases/auth/login-user.usecase';
import { Module } from '@nestjs/common';
import { RedisRateLimiter } from './infrastructure/cache/redis-rate-limiter';
import { RegisterUserUseCase } from './application/use-cases/auth/register-user.usecase';
import type { StringValue } from 'ms';
import { TransactionsController } from './presentation/http/controllers/transactions.controller';
import { TronGridClient } from './infrastructure/tron/tron-grid.client';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLimitOrmEntity } from './infrastructure/db/entities/usage-limit.orm-entity';
import { UsageLimitRepository } from './infrastructure/repositories/usage-limit.repository';
import { UserOrmEntity } from './infrastructure/db/entities/user.orm-entity';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { UtcClockService } from './application/services/utc-clock.service';
import { envValidationSchema } from './infrastructure/config/env.validation';

function parseJwtExpiresIn(
  v: string | undefined,
): number | StringValue | undefined {
  if (!v) return undefined;
  const trimmed = v.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return trimmed as StringValue;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserOrmEntity, UsageLimitOrmEntity]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn:
          parseJwtExpiresIn(process.env.JWT_EXPIRES_IN) ??
          ('1d' as StringValue),
      },
    }),
  ],
  controllers: [AuthController, TransactionsController],
  providers: [
    JwtStrategy,

    UserRepository,
    UsageLimitRepository,
    BcryptPasswordHasher,
    JwtSigner,
    RedisRateLimiter,
    TronGridClient,

    UtcClockService,
    LimitsService,

    {
      provide: RegisterUserUseCase,
      useFactory: (
        users: UserRepository,
        hasher: BcryptPasswordHasher,
        jwt: JwtSigner,
      ) => new RegisterUserUseCase(users, hasher, jwt),
      inject: [UserRepository, BcryptPasswordHasher, JwtSigner],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (
        users: UserRepository,
        hasher: BcryptPasswordHasher,
        jwt: JwtSigner,
      ) => new LoginUserUseCase(users, hasher, jwt),
      inject: [UserRepository, BcryptPasswordHasher, JwtSigner],
    },
    {
      provide: LimitsService,
      useFactory: (
        usage: UsageLimitRepository,
        rl: RedisRateLimiter,
        clock: UtcClockService,
      ) => new LimitsService(usage, rl, clock),
      inject: [UsageLimitRepository, RedisRateLimiter, UtcClockService],
    },
    {
      provide: GetWalletTransactionsUseCase,
      useFactory: (tron: TronGridClient) =>
        new GetWalletTransactionsUseCase(tron),
      inject: [TronGridClient],
    },
  ],
})
export class AppModule {}
