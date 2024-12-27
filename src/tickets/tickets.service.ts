import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from '../users/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async purchaseTicket(user: User, quantity: number, totalPrice: number): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({ user, quantity, totalPrice });
    return this.ticketsRepository.save(ticket);
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    console.log('userId', userId);
    return this.ticketsRepository
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.user', 'user')
      .where('user.userId = :userId', { userId })
      .andWhere('ticket.paymentStatus = :paymentStatus', { paymentStatus: 'COMPLETED' })
      .getMany();
  }
  
  
  
} 