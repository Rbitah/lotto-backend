export interface TicketStatus {
  isValid: boolean;
  isWinner: boolean;
  paymentStatus: string;
  position?: number;
}

export interface TicketCreationParams {
  userId: string;
  quantity: number;
  pricePerTicket: number;
}

export interface TicketResponse {
  ticketId: string;
  purchaseDate: Date;
  status: TicketStatus;
  totalPrice: number;
  userEmail: string;
} 