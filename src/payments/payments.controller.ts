import { Controller, Post, Body, UseGuards, Request, Param, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { User } from '../auth/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')

export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  async initiatePayment(
    @Body() body: { quantity: number; pricePerTicket: number },
    @User('userId') userId: string
  ) {
    console.log('userId', userId);
    console.log('body', body);
    return this.paymentsService.initiatePayment(userId, body.quantity, body.pricePerTicket);
  }

  @Get('verify/:tx_ref')  // Ensure the route is correctly defined
  async verifyPayment(@Param('tx_ref') tx_ref: string) {
    return this.paymentsService.verifyPayment(tx_ref);
  }
}