import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import * as webPush from 'web-push';

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || 'BERcf2QI65PXNLNuY1J0ZhfJl7pXw-YHvKk0U9k9puN1irEH9YXtUJyjqTJk7WFxJmVX1xwoXnoUFpqkEW8HTkM';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '5IA8ooSnWdYnQEtfn2XmsDV5x20guFzclQfIv56fFDg';

webPush.setVapidDetails(
  'mailto:fokzanqa@gmail.com',
  VAPID_PUBLIC,
  VAPID_PRIVATE,
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private remindedBookings = new Set<string>();

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // Check for upcoming sessions every 2 minutes
    setInterval(() => {
      this.checkAndSendSessionReminders().catch((err) => {
        this.logger.error('Error in session reminder check:', err?.message);
      });
    }, 2 * 60 * 1000);
  }

  /** Subscribe a user's browser to push notifications */
  async subscribe(userId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { userId, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
  }

  /** Unsubscribe */
  async unsubscribe(endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  /** Send push notification to a specific user (all their devices) */
  async sendToUser(userId: string, payload: PushPayload) {
    const subs = await this.prisma.pushSubscription.findMany({ where: { userId } });
    const results = await Promise.allSettled(
      subs.map((sub) => this.sendPush(sub, payload)),
    );
    // Clean up expired subscriptions
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'rejected') {
        await this.prisma.pushSubscription.delete({ where: { id: subs[i].id } }).catch(() => {});
      }
    }
  }

  /** Send push to all users with a specific role */
  async sendToRole(role: string, payload: PushPayload) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { role: role as any },
      select: { userId: true },
    });
    await Promise.allSettled(
      userRoles.map((u) => this.sendToUser(u.userId, payload)),
    );
  }

  private async sendPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: PushPayload) {
    const pushSub = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };
    try {
      await webPush.sendNotification(pushSub, JSON.stringify(payload));
    } catch (err: any) {
      this.logger.warn(`Push failed for ${sub.endpoint.slice(0, 40)}… — ${err?.statusCode || err?.message}`);
      throw err;
    }
  }

  /** Get VAPID public key for frontend */
  getVapidPublicKey() {
    return VAPID_PUBLIC;
  }

  /** Check and send reminders for sessions starting in the next 30 minutes */
  async checkAndSendSessionReminders() {
    const now = new Date();
    const lookahead = new Date(now.getTime() + 30 * 60 * 1000);

    const upcomingBookings = await this.prisma.booking.findMany({
      where: {
        startsAt: {
          gte: now,
          lte: lookahead,
        },
      },
      include: {
        request: {
          select: {
            id: true,
            description: true,
            studentId: true,
            status: true,
          },
        },
        tutor: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    for (const b of upcomingBookings) {
      if (this.remindedBookings.has(b.id)) continue;
      this.remindedBookings.add(b.id);

      const minsUntil = Math.max(1, Math.round((new Date(b.startsAt).getTime() - now.getTime()) / 60000));
      const title = '⏰ تذكير بميعاد الجلسة';
      const body = `جلستك ستبدأ خلال ${minsUntil} دقيقة! جهّز نفسك للقاعة`;

      // Notify Student
      if (b.request?.studentId) {
        await this.sendToUser(b.request.studentId, {
          title,
          body,
          url: `/room/${b.requestId}`,
          tag: `reminder-${b.id}`,
        }).catch(() => {});
      }

      // Notify Tutor
      if (b.tutor?.userId) {
        await this.sendToUser(b.tutor.userId, {
          title,
          body,
          url: `/room/${b.requestId}`,
          tag: `reminder-${b.id}`,
        }).catch(() => {});
      }
    }
  }
}
