import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType, Side } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ example: 'Nike Air Max Sebelah Kiri Ukuran 42' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: PostType, example: PostType.CARI_PARTNER })
  @IsEnum(PostType)
  @IsNotEmpty()
  type: PostType;

  @ApiProperty({ example: 'uuid-kategori-sepatu' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ enum: Side, example: Side.LEFT })
  @IsEnum(Side)
  @IsNotEmpty()
  side: Side;

  @ApiProperty({ example: '42' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiPropertyOptional({ example: 'Kondisi masih bagus, jarang dipakai.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'Jakarta' })
  @IsString()
  @IsNotEmpty()
  city: string;
}
