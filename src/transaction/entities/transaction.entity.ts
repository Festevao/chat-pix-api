import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../core/base.entity';
import { Chat } from '../../chat/entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { TransactionStatus } from '../types/TransactionStatus';

@Entity('transaction', { schema: process.env.DB_SCHEMA || 'public' })
export class Transaction extends BaseEntity {
  @Column('character varying', { name: 'txid' })
  txid: string;

  @Column('character varying', { name: 'message' })
  message: string;

  @Column('integer', { name: 'value' })
  value: number;

  @Column('enum', { name: 'status', enum: TransactionStatus })
  status: TransactionStatus;

  @Column('uuid', { name: 'chat_id' })
  chatId: string;

  @Column('uuid', { name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => Chat, (chat) => chat.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id', referencedColumnName: 'id' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
