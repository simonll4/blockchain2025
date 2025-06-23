import { IsString } from 'class-validator';

export class RegisterAccountDto {
  @IsString()
  address: string;

  @IsString()
  signature: string;
}
