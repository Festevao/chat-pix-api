import { MigrationInterface, QueryRunner } from "typeorm";

export class UserChangeColumnTokenToKey1727131941239 implements MigrationInterface {
    name = 'UserChangeColumnTokenToKey1727131941239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "api_token" TO "api_key"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "api_key" TO "api_token"`);
    }

}
