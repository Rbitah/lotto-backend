import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Draw } from './draw.entity';
import { Ticket } from '../tickets/ticket.entity';
import { IsString, IsInt, Min } from 'class-validator';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';

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

  async createDraw(): Promise<Draw> {
    const tickets = await this.ticketsRepository.find();
    const winningTickets = this.selectWinners(tickets);
    const draw = this.drawsRepository.create({ date: new Date(), winningTickets });
    await this.drawsRepository.save(draw);

    // Notify users
    for (const ticket of winningTickets) {
      await this.notificationsService.sendEmail(
        ticket.user.email,
        'Congratulations! You have won!',
        `Dear ${ticket.user.email}, you have won in the latest draw!`
      );
    }

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