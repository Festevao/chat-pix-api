import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNickToUser1726524232934 implements MigrationInterface {
    name = 'AddNickToUser1726524232934'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "nick" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "nick"`);
    }

}
