import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  async purchase(@Request() req, @Body() body: { quantity: number; totalPrice: number }) {
    return this.ticketsService.purchaseTicket(req.user, body.quantity, body.totalPrice);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-tickets')
  async getUserTickets(@Request() req) {
    return this.ticketsService.getUserTickets(req.user);
  }
} 