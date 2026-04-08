import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostType, Side } from '@prisma/client';

export class PostFilterDto {
  @IsString()
  @IsOptional()
  category?: string; // category slug

  @IsEnum(Side)
  @IsOptional()
  side?: Side;

  @IsString()
  @IsOptional()
  size?: string;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsString()
  @IsOptional()
  city?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 12;

  @IsString()
  @IsOptional()
  sort?: 'newest' | 'oldest' = 'newest';
}
