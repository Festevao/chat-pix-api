import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../core/base.entity';
import { Chat } from '../../chat/entities/chat.entity';

@Entity('transaction', { schema: process.env.DB_SCHEMA || 'public' })
export class Transaction extends BaseEntity {
  @Column('character varying', { name: 'message' })
  message: string;

  @Column('integer', { name: 'value' })
  value: number;

  @ManyToOne(() => Chat, (chat) => chat.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id', referencedColumnName: 'id' })
  chat: Chat;
}
