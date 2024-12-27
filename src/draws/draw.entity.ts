import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Prize } from '../prizes/prize.entity';

export enum DrawStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('draws')
export class Draw {
  @PrimaryGeneratedColumn('uuid')
  drawId: string;

  @CreateDateColumn()
  date: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrizePool: number;

  @Column({
    type: 'enum',
    enum: DrawStatus,
    default: DrawStatus.PENDING
  })
  status: DrawStatus;

  @OneToMany(() => Prize, prize => prize.draw)
  prizes: Prize[];
} 