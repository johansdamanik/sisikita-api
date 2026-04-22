import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Side } from '@prisma/client';

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Nike Air Max Sebelah Kanan Ukuran 42' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ enum: Side, example: Side.RIGHT })
  @IsEnum(Side)
  @IsOptional()
  side?: Side;

  @ApiPropertyOptional({ example: '42' })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({ example: 'Update deskripsi: masih bagus, bisa COD.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Bandung' })
  @IsString()
  @IsOptional()
  city?: string;
}
