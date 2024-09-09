import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthGuard as AuthGuardPassport } from '@nestjs/passport';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LoginDTO } from './dto/login.dto';
import { ProfileResponseDTO } from './dto/profile-response.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { UserService } from 'src/user/user.service';
import { Public } from './guards/public.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  signIn(@Body() signInDto: LoginDTO) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.OK)
  signUp(@Body() signUpDto: CreateUserDTO) {
    return this.authService.singUp(signUpDto);
  }

  @Post('refresh')
  @ApiSecurity('Auth')
  @UseGuards(AuthGuard)
  async refresh(@Body() refreshTokenDto: RefreshTokenDTO) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Get('google')
  @Public()
  @UseGuards(AuthGuardPassport('google'))
  googleLogin() {}

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuardPassport('google'))
  async googleLoginCallback(@Request() req, @Res() res: Response) {
    const googleToken = req.user.accessToken;
    const googleRefreshToken = req.user.refreshToken;
  
    let user = await this.userService.findByEmail(req.user.email);
    if(user && !user.isGoogleLogin) {
      throw new ConflictException(`User already exists.`);
    }

    if (!user) {
      user = await this.userService.create({
        fullName: req.user.firstName + ' ' + req.user.lastName,
        email: req.user.email,
        emailVerified: true,
        password: null,
        isGoogleLogin: true,
      });
    }

    res.cookie('access_token', googleToken, { httpOnly: true });
    res.cookie('refresh_token', googleRefreshToken, { httpOnly: true });
    res.cookie('user', JSON.stringify({
      document: user.document,
      email: user.email,
      emailVerified: user.emailVerified,
      fullName: user.fullName,
      isGoogleLogin: user.isGoogleLogin,
      phone: user.phone,
      sub: user.id,
    }), { httpOnly: true });

    res.redirect(`${process.env.APP_ENDPOINT}/auth/profile`);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    console.log(req.user);
    return new ProfileResponseDTO(req.user);
  }

  @Get('logout')
  logout(@Req() req, @Res() res: Response) {
    if (req.user && !req.user.isGoogleLogin) {
      res.redirect(`${process.env.APP_ENDPOINT}`);
      return;
    }
    const refreshToken = req.cookies['refresh_token'];
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    this.authService.revokeGoogleToken(refreshToken);
    res.redirect(`${process.env.APP_ENDPOINT}`);
  }
}