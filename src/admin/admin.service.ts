import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';
import { Draw, DrawStatus } from '../draws/draw.entity';
import { Prize } from '../prizes/prize.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { PaymentStatus } from '../payments/enums/payment-status.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Draw)
    private drawRepository: Repository<Draw>,
    @InjectRepository(Prize)
    private prizeRepository: Repository<Prize>,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {}

  async getDashboardStats() {
    const [
      totalTickets,
      totalDraws,
      totalRevenue,
      activeTickets,
      recentWinners,
      monthlyRevenue
    ] = await Promise.all([
      this.ticketRepository.count(),
      this.drawRepository.count(),
      this.calculateTotalRevenue(),
      this.ticketRepository.count({ where: { isWinner: false, isValid: true } }),
      this.getRecentWinners(),
      this.getMonthlyRevenue()
    ]);

    return {
      totalTickets,
      totalDraws,
      totalRevenue, // Now returning totalRevenue as a number
      activeTickets,
      recentWinners,
      monthlyRevenue
    };
  }

  async getRecentTickets() {
    return this.ticketRepository.find({
      take: 10,
      order: { purchaseDate: 'DESC' },
      relations: ['user'],
    });
  }

  async getRecentWinners() {
    const recentDraws = await this.drawRepository.find({
      take: 5,
      order: { date: 'DESC' },
      relations: ['prizes', 'prizes.ticket', 'prizes.ticket.user'],
    });

    return recentDraws.flatMap(draw => 
      draw.prizes
        .filter(prize => prize.ticket)
        .map(prize => ({
          drawDate: draw.date,
          ticketId: prize.ticket.ticketId,
          userEmail: prize.ticket.user.email,
          position: prize.position,
          prize: prize.amount
        }))
    );
  }

  async getMonthlyRevenue() {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(now, i);
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    });

    const revenue = await Promise.all(
      months.map(async ({ start, end }) => {
        const tickets = await this.ticketRepository.find({
          where: {
            purchaseDate: Between(start, end),
          },
        });

        const monthlyRevenue = tickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);

        return {
          month: start.toLocaleString('default', { month: 'long' }),
          revenue: monthlyRevenue,
        };
      })
    );

    return revenue.reverse();
  }

  async triggerDraw() {
    const eligibleTickets = await this.ticketRepository.find({
      where: { 
        isWinner: false, 
        isValid: true,
        paymentStatus: PaymentStatus.COMPLETED 
      },
      relations: ['user'],
    });

    const minTickets = this.configService.get<number>('MIN_TICKETS_FOR_DRAW', 3);
    if (eligibleTickets.length < minTickets) {
      throw new BadRequestException(`Not enough eligible tickets for a draw. Minimum required: ${minTickets}`);
    }

    // Fisher-Yates shuffle
    for (let i = eligibleTickets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligibleTickets[i], eligibleTickets[j]] = [eligibleTickets[j], eligibleTickets[i]];
    }

    const winners = eligibleTickets.slice(0, 3);
    
    const draw = await this.drawRepository.save({
      totalPrizePool: this.calculateTotalPrizePool(),
      status: DrawStatus.COMPLETED
    });

    const winnerDetails = await Promise.all(winners.map(async (ticket, index) => {
      const position = index + 1;
      const amount = this.calculatePrize(position);

      const prize = await this.prizeRepository.save({
        position,
        amount,
        draw,
        ticket
      });

      ticket.isWinner = true;
      await this.ticketRepository.save(ticket);

      await this.notificationsService.sendEmail(
        ticket.user.email,
        'Congratulations! You won the lottery!',
        `
        Dear ${ticket.user.email},
        
        Congratulations! Your ticket (${ticket.ticketId}) has won ${position}${this.getOrdinalSuffix(position)} place 
        in our latest draw, with a prize of MWK ${amount.toLocaleString()}!
        
        Please contact our support team to claim your prize.
        
        Best regards,
        The Lottery Team
        `
      );

      return {
        ticketId: ticket.ticketId,
        userEmail: ticket.user.email,
        position,
        prize: amount,
      };
    }));

    return {
      drawId: draw.drawId,
      winners: winnerDetails,
    };
  }

  private calculateTotalPrizePool(): number {
    return (
      Number(this.configService.get('FIRST_PRIZE_AMOUNT')) +
      Number(this.configService.get('SECOND_PRIZE_AMOUNT')) +
      Number(this.configService.get('THIRD_PRIZE_AMOUNT'))
    );
  }

  private calculatePrize(position: number): number {
    const prizeStructure = {
      1: Number(this.configService.get('FIRST_PRIZE_AMOUNT')),
      2: Number(this.configService.get('SECOND_PRIZE_AMOUNT')),
      3: Number(this.configService.get('THIRD_PRIZE_AMOUNT'))
    };
    return prizeStructure[position] || 0;
  }

  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
  }

  private async calculateTotalRevenue(): Promise<number> {
    const tickets = await this.ticketRepository.find();
    
    // We calculate the total revenue by summing the individual ticket total prices
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);

    return totalRevenue;
  }

  async updatePrizeStructure(prizeStructure: any) {
    const prizes = Object.entries(prizeStructure).map(([position, amount]) =>
      this.prizeRepository.create({ position: parseInt(position), amount: Number(amount) })
    );
    return this.prizeRepository.save(prizes);
  }

  async invalidateTicket(ticketId: string) {
    const ticket = await this.ticketRepository.findOne({ 
      where: { ticketId },
      relations: ['user'] 
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.isWinner) {
      throw new BadRequestException('Cannot invalidate a winning ticket');
    }

    ticket.isValid = false;

    await this.notificationsService.sendEmail(
      ticket.user.email,
      'Ticket Invalidated',
      `Your ticket (${ticketId}) has been invalidated. Please contact support for more information.`
    );

    return this.ticketRepository.save(ticket);
  }

  async getAllWinners() {
    const winners = await this.drawRepository.find({
      where: { status: DrawStatus.COMPLETED },
      relations: ['prizes', 'prizes.ticket', 'prizes.ticket.user'],
      order: { date: 'DESC' },
    });

    return winners.flatMap(draw => 
      draw.prizes
        .filter(prize => prize.ticket)
        .map(prize => ({
          drawDate: draw.date,
          ticketId: prize.ticket.ticketId,
          userEmail: prize.ticket.user.email,
          position: prize.position,
          prize: prize.amount
        }))
    );
  }
}
