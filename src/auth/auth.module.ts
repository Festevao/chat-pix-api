import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';7
import { UserModule } from 'src/user/user.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailModule } from 'src/email/email.module';
import { TokenModule } from 'src/token/token.module';

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
    UserModule,
    EmailModule,
    TokenModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
  ],
})
export class AuthModule {}
