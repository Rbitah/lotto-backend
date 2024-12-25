import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Ticket } from '../tickets/ticket.entity';
import { User } from '../users/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private generateUniqueTransactionReference(): string {
    return uuidv4();
  }

  async create(userId: string, quantity: number, pricePerTicket: number) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) throw new NotFoundException('User not found');

    const totalPrice = quantity * pricePerTicket;
    const tx_ref = this.generateUniqueTransactionReference();
    const options = {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${this.configService.get('PAYCHANGU_API_KEY')}`,
      },
    };

    const pendingPayment = this.paymentRepository.create({
      status: 'pending',
      tx_ref,
      user,
      amount: totalPrice,
      date: new Date(),
    });
    await this.paymentRepository.save(pendingPayment);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.paychangu.com/payment',
          {
            tx_ref,
            callback_url: this.configService.get('CALLBACK_URL'),
            return_url: this.configService.get('RETURN_URL'),
            currency: 'MWK',
            email: user.email,
            name: `Ticket Purchase`,
            description: `Purchase of ${quantity} tickets`,
            amount: totalPrice,
          },
          options,
        ),
      );

      const data = response.data;
      if (data.status === 'success') {
        // Create and save each ticket with a unique ID
        for (let i = 0; i < quantity; i++) {
          const ticket = this.ticketRepository.create({
            user,
            quantity: 1,
            totalPrice: pricePerTicket,
          });
          await this.ticketRepository.save(ticket);
        }

        return {
          statusCode: 200,
          message: 'Payment and ticket creation successful.',
          data: data.data,
        };
      } else {
        throw new HttpException(
          data.message || 'Payment initiation failed.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('Error processing payment:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.message || 'An error occurred while processing payment.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyPayment(tx_ref: string): Promise<any> {
    try {
      const pendingPayment = await this.paymentRepository.findOne({ where: { tx_ref } });

      if (!pendingPayment)
        throw new NotFoundException('Pending payment not found for verification.');

      if (pendingPayment.status === 'success') {
        return {
          statusCode: 200,
          message: 'Payment has already been verified.',
        };
      }

      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.paychangu.com/verify-payment/${tx_ref}`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${this.configService.get('PAYCHANGU_API_KEY')}`,
            },
          },
        ),
      );

      const data = response.data;

      if (data.status === 'success') {
        pendingPayment.status = 'success';
        pendingPayment.amount = data.data.amount;
        pendingPayment.date = new Date(data.data.authorization.completed_at);

        await this.paymentRepository.save(pendingPayment);

        return {
          statusCode: 200,
          message: 'Payment verified and saved successfully.',
          data: data.data,
        };
      } else {
        throw new HttpException(
          data.message || 'Payment verification failed.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('Error verifying payment:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.message || 'An error occurred while verifying payment.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 