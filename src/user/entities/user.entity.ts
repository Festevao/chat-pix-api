import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
} from 'typeorm';
import { BaseEntity } from '../../core/base.entity';
import * as bcrypt from 'bcrypt';

@Entity('user', { schema: process.env.DB_SCHEMA || 'public' })
export class User extends BaseEntity {
  @Column('character varying', { name: 'full_name' })
  fullName: string;

  @Column('character varying', { name: 'email', unique: true })
  email: string;

  @Column('boolean', { name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column('character varying', { name: 'password', nullable: true })
  password: string | null;

  @Column('character varying', { name: 'phone', nullable: true })
  phone: string;

  @Column('character varying', { name: 'document', nullable: true, unique: true })
  document: string;

  @Column('boolean', { name: 'is_google_login', default: false })
  isGoogleLogin: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (!this.isGoogleLogin) {
      this.password = bcrypt.hashSync(this.password, 12);
    }
  }
}
