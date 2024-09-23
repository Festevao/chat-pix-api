import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BaseService } from '../core/base.service';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { WalletService } from 'src/wallet/wallet.service';
import { Wallet } from 'src/wallet/entities/wallet.entity';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    protected readonly repository: Repository<User>,
    private walletService: WalletService,
  ) {
    super(repository, User);
  }

  async findAdmin() {
    return await this.repository.findOne({
      where: {
        fullName: 'ADMIN',
        profileImage: 'ADMIN',
        email: 'admin@admin.com',
        emailVerified: true,
        nick: 'ADMIN',
        document: 'ADMIN_DOC',
        isGoogleLogin: false,
      },
      relations: {
        wallet: true,
      }
    });
  }

  async createAdmin() {
    const wallet = await this.walletService.create({});
    const admin = this.repository.create({
      fullName: 'ADMIN',
      profileImage: 'ADMIN',
      email: 'admin@admin.com',
      emailVerified: true,
      password: process.env.ADMIN_DEFAULT_PASSWORD,
      nick: 'ADMIN',
      document: 'ADMIN_DOC',
      isGoogleLogin: false,
      wallet,
    });
    wallet.user = admin;

    await wallet.save();
    return this.repository.save(admin);
  }

  async findByEmail(email: string) {
    return await this.repository.findOne({ where: { email } });
  }

  async create(data: DeepPartial<User>) {
    try {
      let wallet: Wallet;
      if (data.walletId) {
        try {
          wallet = await this.walletService.findById(data.walletId);
        } catch(e) {
          throw new NotFoundException('Can\'t fond wallet');
        }
      }
      else {
        wallet = await this.walletService.create({});
      }

      const entity = this.repository.create({
        ...data,
        wallet,
      });
      
      const saveResult = await this.repository.save(entity);

      wallet.user = saveResult;
      await wallet.save();

      return saveResult;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(`User already exists.`);
      }
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
