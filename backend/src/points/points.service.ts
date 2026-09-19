import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  async getMyPoints(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { pointsBalance: true },
    });

    const transactions = await this.prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    const redeemedCoupons = transactions
      .filter((t) => t.refType === 'Coupon' && t.refId)
      .map((t) => ({
        code: t.refId!,
        reason: t.reason,
        createdAt: t.createdAt,
        points: Math.abs(t.points),
        type: t.refId!.startsWith('WS-FREE')
          ? 'FREE_WORKSHOP'
          : 'DISCOUNT_COUPON',
        title: t.refId!.startsWith('WS-FREE')
          ? 'تذكرة ورشة عمل مجانية'
          : 'كوبون خصم 50 ج.م على الجلسة أو الورشة',
      }));

    return {
      pointsBalance: profile?.pointsBalance ?? 0,
      transactions,
      redeemedCoupons,
    };
  }

  async redeemReward(
    userId: string,
    dto: { rewardType: string; title?: string },
  ) {
    const cost = 500; // كل 500 نقطة بكوبون خصم 50 ج.م أو ورشة عمل مجانية

    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { pointsBalance: true },
    });

    const currentBalance = profile?.pointsBalance ?? 0;
    if (currentBalance < cost) {
      throw new BadRequestException(
        `رصيد نقاطك (${currentBalance} نقطة) غير كافٍ. تحتاج إلى ${cost} نقطة لاستبدال هذه المكافأة.`,
      );
    }

    // Generate Coupon or Ticket
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    let couponCode = `FZ50-${randomSuffix}`;
    let rewardSummary = 'كوبون خصم 50 ج.م على الجلسة أو الورشة';

    if (dto.rewardType === 'FREE_WORKSHOP' || dto.title?.includes('ورشة')) {
      couponCode = `WS-FREE-${randomSuffix}`;
      rewardSummary = 'تذكرة حضور ورشة عمل مجانية';
    }

    // Deduct 500 points and log transaction
    await this.prisma.$transaction([
      this.prisma.studentProfile.update({
        where: { userId },
        data: { pointsBalance: { decrement: cost } },
      }),
      this.prisma.pointTransaction.create({
        data: {
          userId,
          points: -cost,
          reason: `REDEEMED_${dto.rewardType || 'COUPON_50_EGP'}`,
          refType: 'Coupon',
          refId: couponCode,
        },
      }),
    ]);

    const updatedProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { pointsBalance: true },
    });

    return {
      success: true,
      message: `🎉 مبروك! تم استبدال ${cost} نقطة بـ (${rewardSummary}) بنجاح!`,
      couponCode,
      rewardSummary,
      pointsDeducted: cost,
      newPointsBalance: updatedProfile?.pointsBalance ?? 0,
    };
  }
}