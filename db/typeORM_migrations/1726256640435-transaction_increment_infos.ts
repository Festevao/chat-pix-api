import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionIncrementInfos1726256640435 implements MigrationInterface {
    name = 'TransactionIncrementInfos1726256640435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "txid" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_status_enum" AS ENUM('EM_PROCESSAMENTO', 'DEVOLVIDO', 'NAO_REALIZADO', 'ATIVA', 'CONCLUIDA', 'REMOVIDA_PELO_USUARIO_RECEBEDOR', 'REMOVIDA_PELO_PSP')`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "status" "public"."transaction_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_ff69ee44eeae9640e05e0dbfe86"`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "chat_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_ff69ee44eeae9640e05e0dbfe86" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_b4a3d92d5dde30f3ab5c34c5862" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_b4a3d92d5dde30f3ab5c34c5862"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_ff69ee44eeae9640e05e0dbfe86"`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "chat_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_ff69ee44eeae9640e05e0dbfe86" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "txid"`);
    }

}
