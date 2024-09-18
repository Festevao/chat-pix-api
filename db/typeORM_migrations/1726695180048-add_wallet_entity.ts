import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletEntity1726695180048 implements MigrationInterface {
    name = 'AddWalletEntity1726695180048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wallet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "balance" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "wallet_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_b453ec3d9d579f6b9699be98beb" UNIQUE ("wallet_id")`);
        await queryRunner.query(`ALTER TYPE "public"."transaction_status_enum" RENAME TO "transaction_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_status_enum" AS ENUM('EM_PROCESSAMENTO', 'DEVOLVIDO', 'NAO_REALIZADO', 'ATIVA', 'CONCLUIDA', 'REMOVIDA_PELO_USUARIO_RECEBEDOR', 'REMOVIDA_PELO_PSP', 'REEMBOLSO')`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "status" TYPE "public"."transaction_status_enum" USING "status"::"text"::"public"."transaction_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_b453ec3d9d579f6b9699be98beb" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_b453ec3d9d579f6b9699be98beb"`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_status_enum_old" AS ENUM('EM_PROCESSAMENTO', 'DEVOLVIDO', 'NAO_REALIZADO', 'ATIVA', 'CONCLUIDA', 'REMOVIDA_PELO_USUARIO_RECEBEDOR', 'REMOVIDA_PELO_PSP')`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "status" TYPE "public"."transaction_status_enum_old" USING "status"::"text"::"public"."transaction_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."transaction_status_enum_old" RENAME TO "transaction_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_b453ec3d9d579f6b9699be98beb"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "wallet_id"`);
        await queryRunner.query(`DROP TABLE "wallet"`);
    }

}
