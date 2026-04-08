import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSizeProfileDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsOptional()
  sizeDetail?: string;
}
