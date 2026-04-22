import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NeedType, PrimarySide } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Bandung' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Jl. Sudirman No. 10' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ enum: NeedType, example: NeedType.AMPUTEE })
  @IsEnum(NeedType)
  @IsOptional()
  needType?: NeedType;

  @ApiPropertyOptional({ enum: PrimarySide, example: PrimarySide.LEFT })
  @IsEnum(PrimarySide)
  @IsOptional()
  primarySide?: PrimarySide;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
