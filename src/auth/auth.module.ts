import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';7
import { UserModule } from 'src/user/user.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailModule } from 'src/email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { TokenService } from './token.service';

@Module({
  imports:[
    JwtModule.registerAsync({
      useFactory: () => {
      const expiresIn = process.env.NODE_ENV === 'production' ? '300s' : '1d';
      
      return {
        global: true,
        secret: process.env?.JWT_KEY ?? '',
        signOptions: { expiresIn },
      };
    }
    }),
    TypeOrmModule.forFeature([Token]),
    UserModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    TokenService,
  ],
})
export class AuthModule {}
