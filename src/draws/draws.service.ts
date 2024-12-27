import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Draw } from './draw.entity';
import { Ticket } from '../tickets/ticket.entity';
import { IsString, IsInt, Min } from 'class-validator';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { DrawStatus } from './draw.entity';

@Injectable()
export class DrawsService {
  constructor(
    @InjectRepository(Draw)
    private drawsRepository: Repository<Draw>,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private schedulerRegistry: SchedulerRegistry,
    private notificationsService: NotificationsService,
  ) {
    this.scheduleDraws();
  }

  private calculatePrize(position: number): number {
    const prizeStructure = {
      1: 1000000,
      2: 500000,
      3: 250000
    };
    return prizeStructure[position] || 0;
  }

  async createDraw(): Promise<Draw> {
    const eligibleTickets = await this.ticketsRepository.find({
      where: { isValid: true, isWinner: false }
    });
    
    const winningTickets = this.selectWinners(eligibleTickets);
    
    const draw = await this.drawsRepository.save({
      date: new Date(),
      status: DrawStatus.COMPLETED,
      totalPrizePool: 1750000, // Sum of all prizes
      prizes: winningTickets.map((ticket, index) => ({
        position: index + 1,
        amount: this.calculatePrize(index + 1),
        ticket
      }))
    });

    // Notify winners
    await Promise.all(winningTickets.map(async (ticket, index) => {
      await this.notificationsService.sendEmail(
        ticket.user.email,
        'Congratulations! You won!',
        `You won ${index + 1}st place with prize amount: ${this.calculatePrize(index + 1)}`
      );
    }));

    return draw;
  }

  private selectWinners(tickets: Ticket[]): Ticket[] {
    if (tickets.length < 3) {
      throw new Error('Not enough tickets to select winners');
    }

    const winners = new Set<Ticket>();
    while (winners.size < 3) {
      const randomIndex = Math.floor(Math.random() * tickets.length);
      winners.add(tickets[randomIndex]);
    }

    return Array.from(winners);
  }

  private scheduleDraws() {
    const interval = setInterval(() => {
      this.createDraw().then(() => {
        console.log('Draw created successfully');
      }).catch(err => {
        console.error('Error creating draw:', err);
      });
    }, 24 * 60 * 60 * 1000); // Schedule to run every 24 hours

    this.schedulerRegistry.addInterval('draws', interval);
  }
}

export class CreateTicketDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(0)
  totalPrice: number;
} 