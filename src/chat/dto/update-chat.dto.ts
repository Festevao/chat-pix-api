import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,  
} from 'class-validator';

export class UpdateChatDTO {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsOptional()
  @Matches(/^[a-zA-Z]+$/, {
    message: 'Name must be a string without especial chars and numbers',
  })
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2
  })
  @Min(5)
  minValue?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  filterPrompt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}