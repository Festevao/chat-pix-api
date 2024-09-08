import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';
import { UserResponseDTO } from 'src/user/dto/user-reponse.dto';
import { LoginResponseDTO } from './dto/login-response.dto';

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
}
