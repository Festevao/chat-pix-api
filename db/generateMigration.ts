import { exec } from 'child_process';
import * as path from 'path';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const migrationName = process.argv.slice(2).join('_').trim();

if (!migrationName) {
  console.error('Missing migration name, try again like: pnpm run migration:generate <MIGRATION_NAME>');
  process.exit(1);
}

const migrationPath = path.join(__dirname, "/typeORM_migrations/" + migrationName);

exec(`ts-node --project ./tsconfig.json ./node_modules/typeorm/cli -d "${path.join(__dirname, "typeORMConfig.ts")}" migration:generate "${migrationPath}"`, (error, _, stderr) => {
  if (error) {
    console.error(error);
    return;
  }
  if (stderr) {
    console.error(stderr);
    return;
  }
});
