import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatTokenUnique1726236721843 implements MigrationInterface {
    name = 'ChatTokenUnique1726236721843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "UQ_c2ef2c91bc0a79889b689c1bd1f" UNIQUE ("token")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "UQ_c2ef2c91bc0a79889b689c1bd1f"`);
    }

}
