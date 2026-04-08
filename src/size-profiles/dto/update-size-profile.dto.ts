import { IsString, IsOptional } from 'class-validator';

export class UpdateSizeProfileDto {
  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  sizeDetail?: string;
}
