import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { WorkshopStatus, WorkshopType } from '@prisma/client';
import { YoutubeService } from './youtube.service';

@Injectable()
export class WorkshopsService {
  constructor(
    private prisma: PrismaService,
    private youtubeService: YoutubeService,
  ) {}


  async getFeaturedWorkshops() {
    return this.prisma.workshop.findMany({
      where: {
        OR: [
          { isFeaturedOnHome: true },
          { status: WorkshopStatus.APPROVED },
          { status: WorkshopStatus.PUBLISHED },
        ],
      },
      include: {
        tutor: {
          select: { fullName: true, avatarUrl: true },
        },
      },
      take: 6,
      orderBy: { startsAt: 'asc' },
    });
  }

  async getAllPublicWorkshops() {
    return this.prisma.workshop.findMany({
      include: {
        tutor: {
          select: { fullName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tutorId: string, data: any) {
    return this.prisma.workshop.create({
      data: {
        tutorId,
        title: data.title,
        description: data.description,
        type: data.priceEGP ? WorkshopType.PAID : WorkshopType.FREE,
        priceEGP: data.priceEGP,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        capacity: data.capacity,
        status: WorkshopStatus.PENDING,
      },
    });
  }

  async findAll(status?: WorkshopStatus) {
    return this.prisma.workshop.findMany({
      where: status ? { status } : undefined,
      include: { tutor: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTutor(tutorId: string) {
    return this.prisma.workshop.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWorkshop(id: string, data: any, actorId: string, isAdmin = false) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id },
      select: { tutorId: true },
    });

    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }

    if (!isAdmin && workshop.tutorId !== actorId) {
      throw new ForbiddenException('You are not allowed to edit this workshop');
    }

    const type = data.type ?? (data.priceEGP !== undefined && Number(data.priceEGP) > 0 ? WorkshopType.PAID : WorkshopType.FREE);

    return this.prisma.workshop.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type,
        priceEGP: data.priceEGP === undefined ? undefined : Number(data.priceEGP),
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
        capacity: data.capacity === undefined ? undefined : Number(data.capacity),
      },
    });
  }

  async updateStatus(id: string, status: WorkshopStatus) {
    const workshop = await this.prisma.workshop.findUnique({ where: { id } });
    if (!workshop) throw new NotFoundException('Workshop not found');

    return this.prisma.workshop.update({
      where: { id },
      data: { status },
    });
  }

  async grantFreeAccess(workshopId: string, studentId: string, adminId: string) {
    const workshop = await this.prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) throw new NotFoundException('Workshop not found');
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.workshopFreeAccess.create({
      data: {
        workshopId,
        studentId,
        grantedById: adminId,
      },
    });
  }

  /**
   * Upload a workshop video (and optional thumbnail) to YouTube as a private video.
   * Saves the returned youtubeVideoId and thumbnailUrl into the workshop record.
   */
  async uploadWorkshopVideo(
    workshopId: string,
    videoBuffer: Buffer,
    videoMimeType: string,
    thumbnailBuffer?: Buffer,
    thumbnailMimeType?: string,
  ) {
    const workshop = await this.prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) throw new NotFoundException('Workshop not found');

    // Upload the video to YouTube (private)
    const videoId = await this.youtubeService.uploadVideo(
      videoBuffer,
      workshop.title,
      workshop.description ?? '',
      videoMimeType,
    );

    // Set thumbnail if provided
    let thumbnailUrl: string | undefined;
    if (thumbnailBuffer) {
      thumbnailUrl = await this.youtubeService.setThumbnail(
        videoId,
        thumbnailBuffer,
        thumbnailMimeType ?? 'image/jpeg',
      );
    } else {
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    // Persist to DB
    return this.prisma.workshop.update({
      where: { id: workshopId },
      data: {
        youtubeVideoId: videoId,
        thumbnailUrl,
      },
    });
  }

  // My paid workshop enrollments (for student invoices)
  async getMyEnrollments(userId: string) {
    return this.prisma.workshopEnrollment.findMany({
      where: { userId },
      include: {
        workshop: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            priceEGP: true,
            startsAt: true,
            tutor: { select: { fullName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Enrollments for a tutor's workshops (for tutor invoice)
  async getEnrollmentsForTutor(tutorId: string) {
    return this.prisma.workshopEnrollment.findMany({
      where: { workshop: { tutorId } },
      include: {
        user: { select: { fullName: true, email: true } },
        workshop: {
          select: { id: true, title: true, priceEGP: true, startsAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Enroll in a workshop (free workshops or paid-with-points/coupons are APPROVED immediately, paid workshops are PENDING admin approval)
  async enrollWorkshop(workshopId: string, userId: string, paidWithPoints = false, couponCode?: string) {
    const workshop = await this.prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) throw new NotFoundException('Workshop not found');

    let isApproved = workshop.type === WorkshopType.FREE;

    if (paidWithPoints) {
      const profile = await this.prisma.studentProfile.findUnique({ where: { userId } });
      const points = profile?.pointsBalance ?? 0;
      if (points < 500) {
        throw new BadRequestException(`رصيد نقاطك (${points} نقطة) غير كافٍ للاشتراك. تحتاج إلى 500 نقطة.`);
      }

      // Deduct 500 points
      await this.prisma.$transaction([
        this.prisma.studentProfile.update({
          where: { userId },
          data: { pointsBalance: { decrement: 500 } },
        }),
        this.prisma.pointTransaction.create({
          data: {
            userId,
            points: -500,
            reason: 'WORKSHOP_ENROLL_WITH_POINTS',
            refType: 'Workshop',
            refId: workshopId,
          },
        }),
      ]);

      isApproved = true;
    } else if (couponCode && couponCode.trim()) {
      const code = couponCode.trim().toUpperCase();
      // Allow WS-FREE or coupon transactions
      const validTx = await this.prisma.pointTransaction.findFirst({
        where: {
          userId,
          refId: code,
        },
      });

      if (!validTx && !code.startsWith('WS-FREE')) {
        throw new BadRequestException('كود الكوبون غير صالح أو غير مخصص لتذاكر ورش العمل.');
      }

      isApproved = true;
    }

    const status = isApproved ? 'APPROVED' : 'PENDING';

    return this.prisma.workshopEnrollment.upsert({
      where: {
        workshopId_userId: { workshopId, userId },
      },
      create: {
        workshopId,
        userId,
        paidWithPoints: paidWithPoints || !!couponCode,
        status,
      },
      update: {
        paidWithPoints: paidWithPoints || !!couponCode,
        status,
      },
      include: {
        workshop: {
          include: {
            tutor: { select: { fullName: true, email: true } },
          },
        },
      },
    });
  }

  // Admin approves workshop enrollment payment
  async adminApproveEnrollment(enrollmentId: string) {
    const enrollment = await this.prisma.workshopEnrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.workshopEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'APPROVED' },
      include: {
        workshop: { include: { tutor: { select: { fullName: true, email: true } } } },
        user: { select: { fullName: true, email: true } },
      },
    });
  }

  // Admin rejects workshop enrollment payment
  async adminRejectEnrollment(enrollmentId: string) {
    const enrollment = await this.prisma.workshopEnrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.workshopEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'REJECTED' },
      include: {
        workshop: { include: { tutor: { select: { fullName: true, email: true } } } },
        user: { select: { fullName: true, email: true } },
      },
    });
  }

  // List all enrollments for Admin
  async getAllEnrollmentsForAdmin() {
    return this.prisma.workshopEnrollment.findMany({
      include: {
        workshop: {
          include: {
            tutor: { select: { fullName: true, email: true } },
          },
        },
        user: {
          select: { fullName: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
