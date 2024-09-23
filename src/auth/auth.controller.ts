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
  ConflictException,
  Put,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthGuard as AuthGuardPassport } from '@nestjs/passport';
import { CreateUserDTO } from '../user/dto/create-user.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LoginDTO } from './dto/login.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { UserService } from '../user/user.service';
import { Public } from './guards/public.guard';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { UserResponseDTO } from 'src/user/dto/user-reponse.dto';

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
    return this.authService.signUp(signUpDto);
  }

  @Post('refresh')
  @Public()
  @UseGuards(AuthGuard)
  async refresh(@Body() refreshTokenDto: RefreshTokenDTO) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Put('change-password')
  @ApiSecurity('Auth')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDTO,
  ) {
    await this.authService.changePassword(req.user.email, changePasswordDto.oldPassword, changePasswordDto.newPassword);
  }

  @Get('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Res() res: Response,
    @Query('token') token: string,
    @Query('redirectUrl') redirectUrl?: string,
  ) {
    try {
      const tokenInstance = await this.authService.verifyEmail(token);
  
      if (redirectUrl) {
        return res.redirect(redirectUrl);
      }

      return res.render('email-success-verify', {
        name: tokenInstance?.user?.fullName ?? 'Usuário',
        email: tokenInstance?.user?.email ?? '',
      });
    } catch(e) {
      console.error(e);

      return res.render('email-error-verify');
    }
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    await this.authService.sendEmailForgotPassword(forgotPasswordDto.email);
  }

  @Get('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Res() res: Response,
    @Query('token') token: string,
    @Query('redirectUrl') redirectUrl?: string,
  ) {
    try {
      const tokenInstance = await this.authService.getToken(token);
  
      return res.render('reset-password-form', {
        name: tokenInstance?.user?.fullName ?? 'Usuário',
        email: tokenInstance?.user?.email ?? '',
        token,
        redirectUrl,
      });
    } catch(e) {
      console.error(e);

      return res.render('reset-password-error');
    }
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async resetPasswordPost(
    @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDTO,
  ) {
    await this.authService.resetPassword(token, resetPasswordDto.password);
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
        profileImage: req.user.picture,
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
    const user = await this.userService.findById(req.user.sub);
    if(!user) {
      throw new NotFoundException('User not found');
    }
    return new UserResponseDTO(user);
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