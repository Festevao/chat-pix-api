import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,  
} from 'class-validator';

export class UpdateChatDTO {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsOptional()
  @Matches(/^[a-zA-Z_ ]+$/, {
    message: 'Nick must be a string containing only letters, spaces, or underscores',
  })
  @MaxLength(15)
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(500)
  minValue?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  filterPrompt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}