import { MigrationInterface, QueryRunner } from "typeorm";
import { generateRandomToken } from '../../src/utils/generateRandomToken';

export class UserAddApiToken1727131031059 implements MigrationInterface {
    name = 'UserAddApiToken1727131031059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "api_token" character varying DEFAULT 'GENERATE_TOKEN'`);

        const users = await queryRunner.query(`SELECT id FROM "user" WHERE "api_token" = 'GENERATE_TOKEN'`);

        for (const user of users) {
            const apiToken = generateRandomToken(10);
            await queryRunner.query(`UPDATE "user" SET "api_token" = $1 WHERE id = $2`, [apiToken, user.id]);
        }

        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "api_token" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "api_token" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "api_token"`);
    }
}