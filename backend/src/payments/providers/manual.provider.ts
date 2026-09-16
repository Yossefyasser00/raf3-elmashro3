import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentProvider, ChargeResult } from '../payment-provider.interface';

// Ships in the MVP so the full booking → pay → confirm flow is testable
// end-to-end before a real Egyptian PSP contract is signed. Swap this
// out (or add alongside it) by registering another PaymentProvider —
// PaymentService and the rest of the app do not change.
@Injectable()
export class ManualPaymentProvider implements PaymentProvider {
  readonly name = 'manual';

  async createCharge(params: { amountEGP: number; bookingId: string }): Promise<ChargeResult> {
    return {
      transactionRef: `manual_${crypto.randomUUID()}`,
      status: 'PENDING',
    };
  }

  verifyWebhook(): boolean {
    return true; // no external webhook for manual provider
  }

  async handleWebhookEvent(payload: any) {
    return { transactionRef: payload.transactionRef, status: 'PAID' as const };
  }

  async refund() {
    return { status: 'REFUNDED' as const };
  }
}
