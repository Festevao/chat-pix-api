import { MigrationInterface, QueryRunner } from "typeorm";

export class TrySomethingAteFkWallet1726697577041 implements MigrationInterface {
    name = 'TrySomethingAteFkWallet1726697577041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "UQ_72548a47ac4a996cd254b082522" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_72548a47ac4a996cd254b082522" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_72548a47ac4a996cd254b082522"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "UQ_72548a47ac4a996cd254b082522"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP COLUMN "user_id"`);
    }

}
