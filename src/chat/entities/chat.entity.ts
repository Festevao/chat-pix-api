import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../core/base.entity';
import { createRandomToken } from '../../core/annotations/createRandomToken'
import { User } from '../../user/entities/user.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';

@Entity('chat', { schema: process.env.DB_SCHEMA || 'public' })
export class Chat extends BaseEntity {
  @Column('character varying', { name: 'name' })
  name: string;

  @Column('integer', { name: 'min_value' })
  minValue: number;

  @Column('text', { name: 'filter_prompt', nullable: true })
  filterPrompt: string;

  @Column('character varying', { name: 'token', unique: true })
  token: string;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @Column('character varying', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.chats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.chat)
  transactions: Transaction[];

  @BeforeInsert()
  generateToken() {
    if(!this.token) {
      this.token = createRandomToken(15);
    }
  }
}
