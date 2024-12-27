import { PaymentStatus } from '../../payments/enums/payment-status.enum';

export interface DashboardStats {
  totalTickets: number;
  activeTickets: number;
  totalDraws: number;
  totalRevenue: number;
  recentWinners: WinnerStats[];
  monthlyRevenue: MonthlyRevenue[];
  paymentStats: PaymentStatistics;
}

export interface WinnerStats {
  drawDate: Date;
  ticketId: string;
  userEmail: string;
  position: number;
  prize: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  ticketsSold: number;
}

export interface PaymentStatistics {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  byStatus: Record<PaymentStatus, number>;
}

export interface DrawResult {
  drawId: string;
  date: Date;
  winners: WinnerStats[];
  totalPrizePool: number;
} 