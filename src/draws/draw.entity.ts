import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';

@Entity()
export class Draw {
  @PrimaryGeneratedColumn('uuid')
  drawId: string;

  @Column()
  date: Date;

  @ManyToMany(() => Ticket)
  @JoinTable()
  winningTickets: Ticket[];
} 