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

  async getUserTickets(user: User): Promise<Ticket[]> {
    return this.ticketsRepository.find({ where: { user } });
  }
} 