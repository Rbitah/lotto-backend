import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prize } from './prize.entity';

@Injectable()
export class PrizesService {
  constructor(
    @InjectRepository(Prize)
    private prizesRepository: Repository<Prize>
  ) {}

  async create(position: number, amount: number): Promise<Prize> {
    const prize = this.prizesRepository.create({ position, amount });
    return this.prizesRepository.save(prize);
  }

  async update(prizeId: string, position: number, amount: number): Promise<Prize> {
    const prize = await this.prizesRepository.findOne({ 
      where: { prizeId } 
    });
    if (!prize) throw new NotFoundException('Prize not found');

    prize.position = position;
    prize.amount = amount;
    return this.prizesRepository.save(prize);
  }
} 