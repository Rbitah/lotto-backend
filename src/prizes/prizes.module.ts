// src/prize/prize.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrizeService } from './prizes.service';
import { PrizeController } from './prizes.controller';
import { Prize } from './prize.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prize])],
  controllers: [PrizeController],
  providers: [PrizeService],
})
export class PrizeModule {}
