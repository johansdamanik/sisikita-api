import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Side } from '@prisma/client';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(Side)
  @IsOptional()
  side?: Side;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  city?: string;
}
