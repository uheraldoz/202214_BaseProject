import { IsDateString, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ClubDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsUrl()
  @IsNotEmpty()
  readonly imagen: string;

  @IsString()
  @IsNotEmpty()
  readonly descripcion: string;

  @IsDateString()
  @IsNotEmpty()
  readonly fecha_fundacion: string;
}
