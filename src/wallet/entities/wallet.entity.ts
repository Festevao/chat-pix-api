import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../core/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('wallet', { schema: process.env.DB_SCHEMA || 'public' })
export class Wallet extends BaseEntity {
  @Column('integer', { name: 'balance', default: 0 })
  balance: string;

  @Column('uuid', { name: 'user_id', nullable: true })
  userId: string | null;

  @OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
