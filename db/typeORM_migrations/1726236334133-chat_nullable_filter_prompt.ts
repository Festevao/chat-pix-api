import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatNullableFilterPrompt1726236334133 implements MigrationInterface {
    name = 'ChatNullableFilterPrompt1726236334133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "filter_prompt" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "filter_prompt" SET NOT NULL`);
    }

}
