import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUrl,
  Matches,
} from 'class-validator';
import { IsCpfOrCnpj } from '../validators/validate-document.validator';

export class CreateUserDTO {
  @IsString()
  @Matches(/\b\w+\b\s+\b\w+\b/, { message: 'The text must contain at least two words' })
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @IsPhoneNumber('BR')
  phone: string;

  @IsCpfOrCnpj()
  document: string;

  @IsOptional()
  @IsUrl({
    protocols: process.env.NODE_ENV === 'production'
      ? ['https']
      : ['http', 'https'],
  })
  redirectUrl?: string;
}