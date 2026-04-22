import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSizeProfileDto {
  @ApiProperty({
    example: 'uuid-kategori-sepatu',
    description: 'ID kategori dari endpoint /api/categories',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    example: '42',
    description:
      'Ukuran (angka untuk sepatu/sandal, S/M/L/XL untuk sarung tangan)',
  })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiPropertyOptional({ example: 'Nike Air Max' })
  @IsString()
  @IsOptional()
  sizeDetail?: string;
}
