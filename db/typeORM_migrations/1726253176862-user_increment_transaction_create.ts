import { MigrationInterface, QueryRunner } from "typeorm";

export class UserIncrementTransactionCreate1726253176862 implements MigrationInterface {
    name = 'UserIncrementTransactionCreate1726253176862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "message" character varying NOT NULL, "value" integer NOT NULL, "chat_id" uuid, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "profile_image" character varying`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_ff69ee44eeae9640e05e0dbfe86" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_ff69ee44eeae9640e05e0dbfe86"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profile_image"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
    }

}
