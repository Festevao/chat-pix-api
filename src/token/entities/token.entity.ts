import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../core/base.entity';
import { User } from '../../user/entities/user.entity';

export enum TokenKind {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RECOVER_PASSWORD = 'RECOVER_PASSWORD',
}

@Entity('token', { schema: process.env.DB_SCHEMA || 'public' })
export class Token extends BaseEntity {
  @Column('character varying', { name: 'token', unique: true })
  token: string;

  @Column('enum', { name: 'kind', enum: TokenKind })
  kind: TokenKind;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
