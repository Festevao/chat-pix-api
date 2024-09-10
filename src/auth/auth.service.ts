import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from '../user/dto/create-user.dto';
import { UserResponseDTO } from '../user/dto/user-reponse.dto';
import { LoginResponseDTO } from './dto/login-response.dto';
import axios from 'axios';
import { EmailService } from 'src/email/email.service';
import { TokenService } from 'src/token/token.service';
import { TokenKind } from 'src/token/entities/token.entity';
import * as NodeCache from 'node-cache';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private tokenService: TokenService,
  ) {}

  private cache = new NodeCache();

  async signIn(username: string, pass: string) {
    const user = await this.userService.findByEmail(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(pass, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      document: user.document,
      emailVerified: user.emailVerified,
      isGoogleLogin: user.isGoogleLogin,
    };
    
    const expires_in = process.env.NODE_ENV === 'production' ? 300 : 86400;
    
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    return new LoginResponseDTO({
      access_token,
      expires_in,
      refresh_token,
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userService.findById(decoded.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const payload = {
        sub: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        document: user.document,
        emailVerified: user.emailVerified,
      };

      const access_token = await this.jwtService.signAsync(payload);

      const expires_in = process.env.NODE_ENV === 'production' ? 300 : 86400;

      return new LoginResponseDTO({
        access_token,
        refresh_token: refreshToken,
        expires_in,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async singUp(args: CreateUserDTO) {
    const result = await this.userService.create({
      ...args,
      emailVerified: false,
    });

    const token = await this.tokenService.create({
      user: result,
      token: Math.random().toString(16).substring(2),
      kind: TokenKind.VERIFY_EMAIL,
    });

    await this.emailService.sendTemplateEmail(
      result.email,
      '[ChatPIX] Confirmação de email',
      'verify-email',
      {
        link: `${process.env.APP_ENDPOINT}/auth/verify-email`,
        token: token.token,
        name: result.fullName,
      }
    );

    return new UserResponseDTO(result);
  }

  async verifyEmail(token: string) {
    const tokenInstance = await this.tokenService.findByToken(token);

    if (!tokenInstance || tokenInstance.kind !== TokenKind.VERIFY_EMAIL) {
      throw new NotFoundException('User not found');
    }

    if (tokenInstance.user.isGoogleLogin) {
      throw new UnprocessableEntityException('The user use google login');
    }

    tokenInstance.user.emailVerified = true;
    await tokenInstance.user.save();
    await tokenInstance.remove();

    return tokenInstance;
  }

  async resetPassword(token: string, password: string) {
    const tokenInstance = await this.tokenService.findByToken(token);

    if (!tokenInstance || tokenInstance.kind !== TokenKind.VERIFY_EMAIL) {
      throw new NotFoundException('User not found');
    }

    if (tokenInstance.user.isGoogleLogin) {
      throw new UnprocessableEntityException('The user use google login');
    }

    tokenInstance.user.password = bcrypt.hashSync(password, 12);
    await tokenInstance.user.save();
    await tokenInstance.remove();
  }

  async getToken(token: string) {
    const tokenInstance = await this.tokenService.findByToken(token);

    if (!tokenInstance || tokenInstance.kind !== TokenKind.VERIFY_EMAIL) {
      throw new NotFoundException('User not found');
    }

    if (tokenInstance.user.isGoogleLogin) {
      throw new UnprocessableEntityException('The user use google login');
    }

    return tokenInstance;
  }

  async changePassword(userEmail: string, oldPassword: string, newPassword: string) {
    const user = await this.userService.findByEmail(userEmail);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isGoogleLogin) {
      throw new UnprocessableEntityException('The user use google login');
    }

    const passwordMatches = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.password = bcrypt.hashSync(newPassword, 12);
    await user.save();
  }

  async sendEmailForgotPassword(userEmail: string) {
    const cachedToken = this.cache.get<string>(`${userEmail}-send-forgot-email-chache`);
    if (cachedToken) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    this.cache.set<string>(`${userEmail}-send-forgot-email-chache`, 'sendded', 300);

    const user = await this.userService.findByEmail(userEmail);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isGoogleLogin) {
      throw new UnprocessableEntityException('The user use google login')
    }

    const token = await this.tokenService.create({
      user,
      token: Math.random().toString(16).substring(2),
      kind: TokenKind.VERIFY_EMAIL,
    });

    await this.emailService.sendTemplateEmail(
      user.email,
      '[ChatPIX] Redefinir senha',
      'recover-password',
      {
        link: `${process.env.APP_ENDPOINT}/auth/reset-password`,
        token: token.token,
        name: user.fullName,
      }
    );
  }

  async getNewAccessToken(refreshToken: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://accounts.google.com/o/oauth2/token',
        {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
      );

      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to refresh the access token.');
    }
  }

  async getProfile(token: string) {
    try {
      return axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
      );
    } catch (error) {
      console.error('Failed to revoke the token:', error);
    }
  }

  async isTokenExpired(token: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
      );

      const expiresIn = response.data.expires_in;

      if (!expiresIn || expiresIn <= 0) {
        return true;
      }
    } catch (error) {
      return true;
    }
  }

  async revokeGoogleToken(token: string) {
    try {
      await axios.get(
        `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
      );
    } catch (error) {
      console.error('Failed to revoke the token:', error);
    }
  }
}
