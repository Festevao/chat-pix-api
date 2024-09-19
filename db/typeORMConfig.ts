import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from "path";

dotenvConfig({ path: '.env' });

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  port: Number(process.env.DB_PORT ?? 5432),
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  schema: process.env.DB_SCHEMA,
  entities: [path.join(__dirname, "../src") + '**/*/entities/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
  migrationsRun: process.env.NODE_ENV !== 'production',
  migrations: [__dirname + "/typeORM_migrations/*{.ts,.js}"],
  retryAttempts: 10,
  logging:
    process.env.NODE_ENV !== 'production'
      ? ['query', 'error']
      : [],
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: true,
          ca: Buffer.from(
            process.env.RDS_CA as string,
            'base64',
          ).toString('utf8'),
        }
      : false,
}

export default registerAs('typeORMConfig', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions);
