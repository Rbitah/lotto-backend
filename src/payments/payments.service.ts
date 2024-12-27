import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Ticket } from '../tickets/ticket.entity';
import { User } from '../users/user.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';

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

  async initiatePayment(userId: string, quantity: number, pricePerTicket: number) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) throw new NotFoundException('User not found');
console.log('user', user);  
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
      status: 'PENDING', // Replaced enum with string literal
      tx_ref,
      user,
      amount: totalPrice,
      createdAt: new Date(),
    });
console.log('pendingPayment', pendingPayment);
    await this.paymentRepository.save(pendingPayment);

    for (let i = 0; i < quantity; i++) {
      const ticket = this.ticketRepository.create({
        user: pendingPayment.user,
        purchaseDate: new Date(),
        paymentStatus: 'PENDING', // Replaced enum with string literal
        quantity: 1,
        totalPrice: pendingPayment.amount / quantity,
        isValid: false,
        isWinner: false,
        tx_ref: pendingPayment.tx_ref,
        payments: [pendingPayment],
      });
      await this.ticketRepository.save(ticket);
    } 

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
      throw new HttpException(
        error.response?.data?.message || 'An error occurred while processing payment.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyPayment(tx_ref: string) {
    const payment = await this.paymentRepository.findOne({
      where: { tx_ref },
      relations: ['user'], // Load user relation if needed
    });
  
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
  
    console.log('Initiating verification for tx_ref:', tx_ref);
  
    try {
      const verificationResponse = await this.httpService.axiosRef.get(
        `${this.configService.get('PAYMENT_API_URL')}/verify-payment/${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('PAYCHANGU_API_KEY')}`,
          },
        }
      );
  
      console.log('Verification response:', verificationResponse.data);
  
      const data = verificationResponse.data;
  
      if (data.status === 'success') {
        console.log('Payment verified successfully for tx_ref:', tx_ref);
  
        // Update payment status
        payment.status = 'COMPLETED';
        await this.paymentRepository.save(payment);
  
        // Fetch all tickets with the same tx_ref
        const tickets = await this.ticketRepository.find({ where: { tx_ref } });
  
        if (tickets && tickets.length > 0) {
          for (const ticket of tickets) {
            ticket.paymentStatus = 'COMPLETED'; // Update ticket payment status
            ticket.isValid = true; // Activate the ticket
            await this.ticketRepository.save(ticket);
          }
        } else {
          console.warn('No tickets found for tx_ref:', tx_ref);
        }
  
        return {
          status: 'success',
          message: 'Payment verified and tickets activated',
          ticketIds: tickets.map((ticket) => ticket.ticketId), // Return all ticket IDs
        };
      } else {
        console.warn('Payment verification failed for tx_ref:', tx_ref);
  
        payment.status = 'FAILED'; // Update payment status
        await this.paymentRepository.save(payment);
  
        throw new HttpException('Payment verification failed', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('Error during payment verification:', error.response?.data || error.message);
  
      throw new HttpException(
        error.response?.data?.message || 'Payment verification failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }  
}
