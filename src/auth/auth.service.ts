import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';
import { UserResponseDTO } from 'src/user/dto/user-reponse.dto';
import { LoginResponseDTO } from './dto/login-response.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

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

    return new UserResponseDTO(result);
  }

  async changePassword(userEmail: string, oldPassword: string, newPassword: string) {
    const user = await this.userService.findByEmail(userEmail);

    if (!user || user.isGoogleLogin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.password = newPassword;
    await user.save();
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
