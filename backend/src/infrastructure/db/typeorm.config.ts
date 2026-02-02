import { DataSource } from 'typeorm';
import { UsageLimitOrmEntity } from './entities/usage-limit.orm-entity';
import { UserOrmEntity } from './entities/user.orm-entity';

export const makeDataSource = (env: NodeJS.ProcessEnv) =>
  new DataSource({
    type: 'postgres',
    host: env.DB_HOST,
    port: Number(env.DB_PORT ?? 5432),
    username: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    entities: [UserOrmEntity, UsageLimitOrmEntity],
    synchronize: true,
  });
