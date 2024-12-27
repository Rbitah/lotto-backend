import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { Prize } from '../../prizes/prize.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseSeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Prize)
    private prizeRepository: Repository<Prize>,
    private configService: ConfigService,
  ) {}

  async seed() {
    await this.seedUsers();
    await this.seedPrizes();
  }

  private async seedUsers() {
    const adminExists = await this.userRepository.findOne({
      where: { email: 'admin@christmaslotto.com' }
    });

    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await this.userRepository.save({
        email: 'admin@christmaslotto.com',
        password: adminPassword,
        role: 'admin',
      });
    }
  }

  private async seedPrizes() {
    const prizesExist = await this.prizeRepository.find();
    
    if (prizesExist.length === 0) {
      await this.prizeRepository.save([
        {
          position: 1,
          amount: this.configService.get('FIRST_PRIZE_AMOUNT'),
        },
        {
          position: 2,
          amount: this.configService.get('SECOND_PRIZE_AMOUNT'),
        },
        {
          position: 3,
          amount: this.configService.get('THIRD_PRIZE_AMOUNT'),
        },
      ]);
    }
  }
} 