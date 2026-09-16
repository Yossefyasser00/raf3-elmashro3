import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { PayoutStatus } from '@prisma/client';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async createPayoutRequest(tutorId: string, data: { amountEGP: number; method: string; accountDetails?: string }) {
    return this.prisma.payoutRequest.create({
      data: {
        tutorId,
        amountEGP: data.amountEGP,
        paymentMethod: data.method,
        accountDetails: data.accountDetails ?? '',
        status: PayoutStatus.PENDING,
      },
    });
  }

  async findByTutor(tutorId: string) {
    return this.prisma.payoutRequest.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.payoutRequest.findMany({
      include: { tutor: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: PayoutStatus) {
    const payout = await this.prisma.payoutRequest.findUnique({ where: { id } });
    if (!payout) throw new NotFoundException('Payout request not found');
    return this.prisma.payoutRequest.update({
      where: { id },
      data: { status },
    });
  }
}
