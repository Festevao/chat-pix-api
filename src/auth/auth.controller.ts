import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { Public } from './guards/public.guard';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LoginDTO } from './dto/login.dto';
import { ProfileResponseDTO } from './dto/profile-response.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';

@ApiTags('Auth')
@UseGuards(AuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: LoginDTO) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  signUp(@Body() signUpDto: CreateUserDTO) {
    return this.authService.singUp(signUpDto);
  }

  @Post('refresh')
  @ApiSecurity('Auth')
  async refresh(@Body() refreshTokenDto: RefreshTokenDTO) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Get('profile')
  @ApiSecurity('Auth')
  getProfile(@Request() req) {
    return new ProfileResponseDTO(req.user);
  }
}