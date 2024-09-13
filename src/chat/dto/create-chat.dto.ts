import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,  
} from 'class-validator';

export class CreateChatDTO {
  @Matches(/^[a-zA-Z]+$/, {
    message: 'Name must be a string without especial chars and numbers',
  })
  @IsNotEmpty()
  name: string;

  @IsNumber({
    maxDecimalPlaces: 2
  })
  @Min(5)
  minValue: number = 5;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  filterPrompt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}