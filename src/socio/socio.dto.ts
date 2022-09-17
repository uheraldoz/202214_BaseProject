import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class SocioDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  // @IsEmail() This can be used instead of the validation checking if the email value has an @
  @IsNotEmpty()
  readonly email: string;

  @IsDateString()
  @IsNotEmpty()
  readonly fecha_nacimiento: string;
}
