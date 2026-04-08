import {
  IsString,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';
import { NeedType, PrimarySide } from '@prisma/client';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(NeedType)
  @IsOptional()
  needType?: NeedType;

  @IsEnum(PrimarySide)
  @IsOptional()
  primarySide?: PrimarySide;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
