export interface PaymentInitialization {
  amount: number;
  email: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
}

export interface PaymentVerification {
  status: string;
  tx_ref: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
  };
}

export interface PaymentResponse {
  status: string;
  message: string;
  data?: {
    payment_url?: string;
    tx_ref?: string;
    ticketId?: string;
  };
} 