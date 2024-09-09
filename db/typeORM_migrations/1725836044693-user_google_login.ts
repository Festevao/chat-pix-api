import { MigrationInterface, QueryRunner } from "typeorm";

export class UserGoogleLogin1725836044693 implements MigrationInterface {
    name = 'UserGoogleLogin1725836044693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "is_google_login" character varying NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_google_login"`);
    }

}
