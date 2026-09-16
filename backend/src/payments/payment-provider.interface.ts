// Every Egyptian payment provider (Paymob, Fawry, Kashier, manual bank
// transfer, ...) implements this interface. PaymentService depends only
// on this contract, never on a concrete provider — swapping or adding
// a provider means writing one new class, not touching business logic.
export interface ChargeResult {
  transactionRef: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  raw?: unknown;
}

export interface PaymentProvider {
  readonly name: string;

  createCharge(params: {
    amountEGP: number;
    bookingId: string;
    payerUserId: string;
    metadata?: Record<string, unknown>;
  }): Promise<ChargeResult>;

  verifyWebhook(payload: unknown, signature: string): boolean;

  handleWebhookEvent(payload: unknown): Promise<{ transactionRef: string; status: ChargeResult['status'] }>;

  refund(transactionRef: string, amountEGP?: number): Promise<{ status: 'REFUNDED' | 'FAILED' }>;
}
