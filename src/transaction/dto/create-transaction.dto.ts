import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateTransactionDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  @IsInt()
  @Min(500)
  value: number;

  @IsUUID()
  chatId: string;
}
