import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PaymentsService } from '../payments/payments.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from 'src/auth/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('user-tickets')
  async getUserTickets(@User('userId') userId: string) {
    console.log('userId', userId);
    return this.ticketsService.getUserTickets(userId);
  }
}