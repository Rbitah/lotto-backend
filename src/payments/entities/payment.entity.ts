import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/user.entity';
import { Ticket } from '../../tickets/ticket.entity';
//import { PaymentStatus } from '../enums/payment-status.enum';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  paymentId: string;

  @Column()
  tx_ref: string;

  @Column()
  amount: number;

  @Column()
  status: string;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @ManyToOne(() => Ticket, (ticket) => ticket.payments, { nullable: true })
  ticket: Ticket;
  
  

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'json', nullable: true })
  paymentDetails: any;
}