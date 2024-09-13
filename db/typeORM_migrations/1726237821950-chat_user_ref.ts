import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatUserRef1726237821950 implements MigrationInterface {
    name = 'ChatUserRef1726237821950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_15d83eb496fd7bec7368b30dbf3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_15d83eb496fd7bec7368b30dbf3"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "user_id"`);
    }

}
