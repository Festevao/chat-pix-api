import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCopiaEColaToTransaction1726520555971 implements MigrationInterface {
    name = 'AddCopiaEColaToTransaction1726520555971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "pix_copia_e_cola" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "pix_copia_e_cola"`);
    }

}
