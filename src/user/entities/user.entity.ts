import {
  AfterRemove,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../core/base.entity';
import { Token } from '../../auth/entities/token.entity';
import * as bcrypt from 'bcrypt';
import { Chat } from '../../chat/entities/chat.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';

@Entity('user', { schema: process.env.DB_SCHEMA || 'public' })
export class User extends BaseEntity {
  @Column('character varying', { name: 'full_name' })
  fullName: string;

  @Column('character varying', { name: 'profile_image', nullable: true })
  profileImage: string;

  @Column('character varying', { name: 'email', unique: true })
  email: string;

  @Column('boolean', { name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column('character varying', { name: 'password', nullable: true })
  password: string | null;

  @Column('character varying', { name: 'phone', nullable: true })
  phone: string;

  @Column('character varying', { name: 'nick' })
  nick: string;

  @Column('character varying', { name: 'document', nullable: true, unique: true })
  document: string;

  @Column('boolean', { name: 'is_google_login', default: false })
  isGoogleLogin: boolean;

  @Column('uuid', { name: 'wallet_id' })
  walletId: string;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  @JoinColumn({ name: 'wallet_id', referencedColumnName: 'id' })
  wallet: Wallet;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => Chat, (chat) => chat.user)
  chats: Chat[];

  @OneToMany(() => Transaction, (transaction) => transaction.payer)
  transactions: Transaction[];

  @BeforeInsert()
  hashPassword() {
    if (!this.isGoogleLogin) {
      this.password = bcrypt.hashSync(this.password, 12);
    }
  }

  @AfterRemove()
  async removeWallet() {
    if (this.wallet) {
      await this.wallet.remove();
    }
  }
}
