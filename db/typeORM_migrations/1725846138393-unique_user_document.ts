import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueUserDocument1725846138393 implements MigrationInterface {
    name = 'UniqueUserDocument1725846138393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_71fdad8489d3d818ec393e6eb14" UNIQUE ("document")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_71fdad8489d3d818ec393e6eb14"`);
    }

}
