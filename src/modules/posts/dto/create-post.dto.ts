import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { PostType, Side } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(PostType)
  @IsNotEmpty()
  type: PostType;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsEnum(Side)
  @IsNotEmpty()
  side: Side;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}
