import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';
import { Ticket } from '../../tickets/ticket.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  tx_ref: string;

  @Column()
  amount: number;

  @Column()
  date: Date;

  @ManyToOne(() => User, user => user.payments)
  user: User;

  @ManyToOne(() => Ticket, ticket => ticket.payments)
  ticket: Ticket;
} 