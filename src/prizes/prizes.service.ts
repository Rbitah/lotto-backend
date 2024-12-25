import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prize } from './prize.entity';

@Injectable()
export class PrizesService {
  constructor(
    @InjectRepository(Prize)
    private prizesRepository: Repository<Prize>,
  ) {}

  async createPrize(name: string, amount: number): Promise<Prize> {
    const prize = this.prizesRepository.create({ name, amount });
    return this.prizesRepository.save(prize);
  }

  async updatePrize(id: number, name: string, amount: number): Promise<Prize> {
    const prize = await this.prizesRepository.findOne({ where: { id } });
    if (!prize) throw new Error('Prize not found');
    prize.name = name;
    prize.amount = amount;
    return this.prizesRepository.save(prize);
  }
} 