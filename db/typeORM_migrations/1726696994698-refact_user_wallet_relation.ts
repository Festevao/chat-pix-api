import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactUserWalletRelation1726696994698 implements MigrationInterface {
    name = 'RefactUserWalletRelation1726696994698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_b453ec3d9d579f6b9699be98beb"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_b453ec3d9d579f6b9699be98beb" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_b453ec3d9d579f6b9699be98beb"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_b453ec3d9d579f6b9699be98beb" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
