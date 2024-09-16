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

export class CreateChatDTO {
  @Matches(/^[a-zA-Z_ ]+$/, {
    message: 'Nick must be a string containing only letters, spaces, or underscores',
  })
  @MaxLength(15)  
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(500)
  minValue: number = 500;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  filterPrompt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}