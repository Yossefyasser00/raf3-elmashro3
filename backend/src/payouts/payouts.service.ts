import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { PayoutStatus } from '@prisma/client';
import { PushService } from '../notifications/push.service';

@Injectable()
export class PayoutsService {
  constructor(
    private prisma: PrismaService,
    private pushService: PushService,
  ) {}

  async createPayoutRequest(tutorId: string, data: { amountEGP: number; method: string; accountDetails?: string }) {
    const payout = await this.prisma.payoutRequest.create({
      data: {
        tutorId,
        amountEGP: data.amountEGP,
        paymentMethod: data.method,
        accountDetails: data.accountDetails ?? '',
        status: PayoutStatus.PENDING,
      },
    });

    try {
      await this.pushService.sendToRole('ADMIN', {
        title: '💸 طلب سحب أرباح جديد',
        body: `مدرس قدّم طلب سحب بمبلغ ${data.amountEGP} ج.م`,
        url: '/dashboard/admin',
        tag: 'payout-request',
      });
    } catch {}

    return payout;
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

    const updated = await this.prisma.payoutRequest.update({
      where: { id },
      data: { status },
    });

    try {
      const isApproved = status === PayoutStatus.APPROVED || status === PayoutStatus.PAID;
      const isRejected = status === PayoutStatus.REJECTED;
      if (isApproved || isRejected) {
        await this.pushService.sendToUser(payout.tutorId, {
          title: isApproved ? '✅ تم تحويل أرباحك' : '❌ تم رفض طلب السحب',
          body: isApproved
            ? `تمت الموافقة على طلب سحب ${payout.amountEGP} ج.م وتم التحويل بنجاح`
            : `تم رفض طلب سحب ${payout.amountEGP} ج.م — تواصل مع الإدارة للمزيد`,
          url: '/dashboard/tutor',
          tag: `payout-${id}`,
        });
      }
    } catch {}

    return updated;
  }
}
