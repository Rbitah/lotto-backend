import { IsNumber, Min, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePrizeStructureDto {
  @IsObject()
  @Type(() => Number)
  prizes: {
    [key: string]: number;
  };

  @IsNumber()
  @Min(1)
  maxPosition: number;
} 