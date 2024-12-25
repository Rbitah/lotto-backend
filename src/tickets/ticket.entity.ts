import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Payment } from '../payments/entities/payment.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  ticketId: string;

  @Column()
  quantity: number;

  @Column()
  totalPrice: number;

  @ManyToOne(() => User, user => user.tickets)
  user: User;

  @OneToMany(() => Payment, payment => payment.ticket)
  payments: Payment[];
} 