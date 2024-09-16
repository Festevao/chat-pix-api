import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactTransactionPropertyNames1726515513340 implements MigrationInterface {
    name = 'RefactTransactionPropertyNames1726515513340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_b4a3d92d5dde30f3ab5c34c5862"`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "user_id" TO "payer_id"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_df0ef3a4f4ca16431aa5d343c38" FOREIGN KEY ("payer_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_df0ef3a4f4ca16431aa5d343c38"`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "payer_id" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_b4a3d92d5dde30f3ab5c34c5862" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
