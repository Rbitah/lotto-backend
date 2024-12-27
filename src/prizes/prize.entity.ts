import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Draw } from '../draws/draw.entity';
import { Ticket } from '../tickets/ticket.entity';

@Entity('prizes')
export class Prize {
  @PrimaryGeneratedColumn('uuid')
  prizeId: string;

  @Column()
  position: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Draw, draw => draw.prizes)
  draw: Draw;

  @ManyToOne(() => Ticket, ticket => ticket.prizes)
  ticket: Ticket;
} 