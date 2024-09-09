import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserGoogleVarType1725842142304 implements MigrationInterface {
    name = 'FixUserGoogleVarType1725842142304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_google_login"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "is_google_login" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_google_login"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "is_google_login" character varying NOT NULL DEFAULT false`);
    }

}
