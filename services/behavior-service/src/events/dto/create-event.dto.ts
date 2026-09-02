import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { BehaviorEventType } from '../types/behavior-event.type.js';

export class CreateEventDto {
  @IsEnum(BehaviorEventType)
  event!: BehaviorEventType;

  @IsOptional()
  @IsString()
  customerId?: string | null;

  @IsOptional()
  @IsString()
  anonymousId?: string | null;

  @IsNotEmpty()
  @IsString()
  sessionId!: string;

  @IsOptional()
  @IsString()
  productId?: string | null;

  @IsOptional()
  @IsString()
  variantId?: string | null;

  @IsOptional()
  @Type(() => Object)
  @IsObject()
  properties?: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
