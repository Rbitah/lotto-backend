import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Prize } from '../prizes/prize.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  ticketId: string;

  @ManyToOne(() => User, user => user.tickets)
  user: User;

  @CreateDateColumn()
  purchaseDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column()
  quantity: number;

  @Column({ default: false })
  isValid: boolean;

  @Column({ default: false })
  isWinner: boolean;

  @Column({ nullable: true })
  position: number;

  @Column() // Replaced enum with string
  paymentStatus: string;

  @Column({ nullable: true })
  drawDate: Date;

  @Column({ nullable: false })
  tx_ref: string;

  @OneToMany(() => Payment, (payment) => payment.ticket)
  payments: Payment[];
  

  @OneToMany(() => Prize, prize => prize.ticket)
  prizes: Prize[];
}
