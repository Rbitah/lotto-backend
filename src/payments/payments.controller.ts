import { Controller, Post, Body, UseGuards, Request, Param, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Request() req, @Body() body: { quantity: number; pricePerTicket: number }) {
    const userId = req.userId;
    return this.paymentsService.create(userId, body.quantity, body.pricePerTicket);
  }

  @Get('verify/:tx_ref')  // Ensure the route is correctly defined
  async verifyPayment(@Param('tx_ref') tx_ref: string) {
    return this.paymentsService.verifyPayment(tx_ref);
  }
} 