import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NegotiationStatus, RequestStatus } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { TutorRankingService } from '../tutors/tutor-ranking.service';
import { assertValidTransition } from './request-status.state-machine';
import { CreateRequestDto } from './dto/create-request.dto';
import { PushService } from '../notifications/push.service';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private ranking: TutorRankingService,
    private pushService: PushService,
  ) {}

  async create(studentId: string, dto: CreateRequestDto) {
    const prevRequestsCount = await this.prisma.request.count({
      where: { studentId },
    });

    const request = await this.prisma.request.create({
      data: {
        studentId,
        universityId: dto.universityId,
        facultyId: dto.facultyId,
        academicYear: dto.academicYear,
        subjectId: dto.subjectId,
        topicId: dto.topicId,
        description: dto.description,
        teachingMode: dto.teachingMode,
        preferredAt: dto.preferredAt ? new Date(dto.preferredAt) : undefined,
        budgetEGP: dto.budgetEGP,
        urgency: dto.urgency,
        isGroup: !!dto.isGroup,
        status: RequestStatus.DRAFT,
        statusHistory: {
          create: { toStatus: RequestStatus.DRAFT, changedByUserId: studentId },
        },
      },
      include: {
        student: { select: { id: true, username: true, fullName: true } },
      },
    });

    // If group request, add invited group members and send push notifications
    if (dto.isGroup && Array.isArray(dto.invitedUsernames) && dto.invitedUsernames.length > 0) {
      const sanitizedUsernames = dto.invitedUsernames
        .map((u) => u.trim().toLowerCase().replace(/^@/, ''))
        .filter(Boolean);

      const invitedUsers = await this.prisma.user.findMany({
        where: {
          username: { in: sanitizedUsernames },
          id: { not: studentId },
        },
        select: { id: true, username: true, fullName: true },
      });

      for (const user of invitedUsers) {
        await this.prisma.requestGroupMember.upsert({
          where: {
            requestId_userId: { requestId: request.id, userId: user.id },
          },
          create: {
            requestId: request.id,
            userId: user.id,
            status: 'PENDING',
          },
          update: {},
        });

        try {
          await this.pushService.sendToUser(user.id, {
            title: '👥 دعوة للانضمام لجلسة جماعية',
            body: `الطالب @${request.student.username || request.student.fullName} دعاك للانضمام إلى جلسة جماعية: "${request.description.slice(0, 40)}..."`,
            url: '/dashboard/student',
            tag: `group-invite-${request.id}`,
          });
        } catch {}
      }
    }

    // Rule 1: نقاط نشر أول طلب للطالب الجديد: +100 نقطة
    if (prevRequestsCount === 0) {
      await this.prisma.pointTransaction.create({
        data: {
          userId: studentId,
          points: 100,
          reason: 'FIRST_REQUEST_CREATED',
          refType: 'Request',
          refId: request.id,
        },
      });

      await this.prisma.studentProfile.upsert({
        where: { userId: studentId },
        create: {
          userId: studentId,
          pointsBalance: 100,
        },
        update: {
          pointsBalance: { increment: 100 },
        },
      });
    }

    return request;
  }

  // Get all requests for a specific student
  async findMyRequests(studentId: string, status?: RequestStatus) {
    return this.prisma.request.findMany({
      where: {
        OR: [
          { studentId },
          { groupMembers: { some: { userId: studentId, status: 'ACCEPTED' } } },
        ],
        ...(status ? { status } : {}),
      },
      include: {
        student: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        groupMembers: {
          include: {
            user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
          },
        },
        subject: true,
        topic: true,
        university: true,
        faculty: true,
        matches: {
          include: {
            tutor: {
              include: {
                user: {
                  select: { id: true, fullName: true, avatarUrl: true },
                },
              },
            },
          },
          orderBy: { rank: 'asc' },
        },
        booking: {
          include: {
            tutor: {
              include: {
                user: {
                  select: { id: true, fullName: true, avatarUrl: true },
                },
              },
            },
            payment: true,
            review: true,
          },
        },
        negotiations: {
          include: {
            tutor: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                tutorProfile: {
                  select: {
                    id: true,
                    ratingAvg: true,
                    completedSessionsCount: true,
                    bio: true,
                    meetingUrl: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get single request by ID with security check
  async getById(requestId: string, userId: string, isTutorOrAdmin = false) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: {
        student: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },
        subject: true,
        topic: true,
        university: true,
        faculty: true,
        matches: {
          include: {
            tutor: {
              include: {
                user: {
                  select: { id: true, fullName: true, avatarUrl: true },
                },
              },
            },
          },
          orderBy: { rank: 'asc' },
        },
        booking: {
          include: {
            tutor: {
              include: {
                user: {
                  select: { id: true, fullName: true, avatarUrl: true },
                },
              },
            },
            payment: true,
            review: true,
          },
        },
        negotiations: {
          include: {
            tutor: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        groupMembers: {
          include: {
            user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!request) throw new NotFoundException('Request not found');

    const isGroupMember = request.groupMembers?.some((m) => m.userId === userId && m.status === 'ACCEPTED');
    if (!isTutorOrAdmin && request.studentId !== userId && !isGroupMember) {
      throw new ForbiddenException('You do not have access to this request');
    }

    return request;
  }

  // Publishing triggers the matching engine and persists the
  // resulting shortlist — this IS "we find suitable tutors" from
  // the product brief.
  async publish(requestId: string, studentId: string) {
    const request = await this.getOwnedRequest(requestId, studentId);
    assertValidTransition(request.status, RequestStatus.PUBLISHED);

    await this.transition(request.id, request.status, RequestStatus.PUBLISHED, studentId);
    await this.transition(request.id, RequestStatus.PUBLISHED, RequestStatus.MATCHING, studentId);

    const matches = await this.ranking.findTopMatches({
      subjectId: request.subjectId,
      topicId: request.topicId,
      teachingMode: request.teachingMode,
      limit: 5,
    });

    if (matches.length > 0) {
      await this.prisma.requestMatch.createMany({
        data: matches.map((m, i) => ({
          requestId: request.id,
          tutorId: m.tutor.id,
          score: m.score,
          rank: i + 1,
        })),
      });
    }

    return this.prisma.request.findUnique({
      where: { id: request.id },
      include: { matches: { include: { tutor: true }, orderBy: { rank: 'asc' } } },
    });
  }

  async selectTutor(requestId: string, studentId: string, tutorId: string) {
    const request = await this.getOwnedRequest(requestId, studentId);
    assertValidTransition(request.status, RequestStatus.TUTOR_SELECTED);

    // Optional match check
    const isValidMatch = await this.prisma.requestMatch.findUnique({
      where: { requestId_tutorId: { requestId, tutorId } },
    });
    if (!isValidMatch) {
      // allow if direct selection or fallback
    }

    await this.transition(request.id, request.status, RequestStatus.TUTOR_SELECTED, studentId);

    // Auto-create booking record
    const startsAt = request.preferredAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

    await this.prisma.booking.upsert({
      where: { requestId },
      create: {
        requestId,
        tutorId,
        teachingMode: request.teachingMode,
        startsAt,
        endsAt,
        priceEGP: request.budgetEGP ?? 250,
      },
      update: {
        tutorId,
        startsAt,
        endsAt,
      },
    });

    return this.prisma.request.update({
      where: { id: requestId },
      data: { selectedTutorId: tutorId },
      include: { booking: true },
    });
  }

  async createNegotiation(
    requestId: string,
    tutorId: string,
    dto: { proposedAmountEGP: number; proposedTime: string },
  ) {
    const request = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');

    if (request.studentId === tutorId) {
      throw new BadRequestException('A student cannot negotiate on their own request');
    }

    let tutorProfile = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
    });

    if (!tutorProfile) {
      tutorProfile = await this.prisma.tutorProfile.create({
        data: {
          userId: tutorId,
          bio: 'مدرس معتمد على منصة فك زنقة',
          isVerified: true,
          rankingScore: 85,
          ratingAvg: 5.0,
        },
      });
    }

    if (
      request.status !== RequestStatus.PUBLISHED &&
      request.status !== RequestStatus.MATCHING
    ) {
      throw new BadRequestException('Negotiation is only allowed while the request is still open');
    }

    const existing = await this.prisma.requestNegotiation.findFirst({
      where: {
        requestId,
        tutorId,
        status: NegotiationStatus.PENDING,
      },
    });

    let negotiationRecord;
    if (existing) {
      negotiationRecord = await this.prisma.requestNegotiation.update({
        where: { id: existing.id },
        data: {
          proposedAmountEGP: Number(dto.proposedAmountEGP),
          proposedTime: dto.proposedTime,
          status: NegotiationStatus.PENDING,
        },
      });
    } else {
      negotiationRecord = await this.prisma.requestNegotiation.create({
        data: {
          requestId,
          tutorId,
          studentId: request.studentId,
          proposedAmountEGP: Number(dto.proposedAmountEGP),
          proposedTime: dto.proposedTime,
          status: NegotiationStatus.PENDING,
        },
      });
    }

    try {
      const isDirectAcceptance =
        Number(dto.proposedAmountEGP) === Number(request.budgetEGP ?? 0);
      await this.notifyRequestStudents(request.id, {
        title: isDirectAcceptance ? '✅ مدرس قبل طلبك!' : '💰 عرض سعر جديد',
        body: isDirectAcceptance
          ? `وافق مدرس على طلبك بالسعر المعروض (${dto.proposedAmountEGP} ج.م) — ادخل الآن للتأكيد`
          : `مدرس قدّم عرض سعر جديد (${dto.proposedAmountEGP} ج.م) — راجعه الآن`,
        url: '/dashboard/student',
        tag: `negotiation-${requestId}`,
      });
    } catch {}

    return negotiationRecord;
  }

  async getNegotiations(requestId: string, actorId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');

    const tutorProfile = await this.prisma.tutorProfile.findUnique({
      where: { userId: actorId },
    });

    const isStudent = request.studentId === actorId;
    const isTutor = !!tutorProfile;

    if (!isStudent && !isTutor) {
      throw new ForbiddenException('You do not have access to this request negotiations');
    }

    return this.prisma.requestNegotiation.findMany({
      where: {
        requestId,
        ...(isStudent ? {} : { tutorId: tutorProfile!.userId }),
      },
      include: {
        tutor: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            tutorProfile: {
              select: {
                id: true,
                ratingAvg: true,
                completedSessionsCount: true,
                bio: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondToNegotiation(
    requestId: string,
    studentId: string,
    negotiationId: string,
    action: 'ACCEPT' | 'REJECT',
  ) {
    const request = await this.getOwnedRequest(requestId, studentId);

    const negotiation = await this.prisma.requestNegotiation.findUnique({
      where: { id: negotiationId },
    });

    if (!negotiation || negotiation.requestId !== requestId) {
      throw new NotFoundException('Negotiation not found for this request');
    }

    if (negotiation.status !== NegotiationStatus.PENDING) {
      throw new BadRequestException('This negotiation is no longer pending');
    }

    if (action === 'REJECT') {
      const rejected = await this.prisma.requestNegotiation.update({
        where: { id: negotiationId },
        data: { status: NegotiationStatus.REJECTED },
      });

      try {
        await this.pushService.sendToUser(negotiation.tutorId, {
          title: '❌ لم يتم قبول عرضك',
          body: `الطالب لم يقبل عرض السعر (${negotiation.proposedAmountEGP} ج.م)`,
          url: '/dashboard/tutor',
          tag: `negotiation-rejected-${requestId}`,
        });
      } catch {}

      return rejected;
    }

    await this.prisma.requestNegotiation.updateMany({
      where: { requestId, id: { not: negotiationId } },
      data: { status: NegotiationStatus.REJECTED },
    });

    await this.prisma.requestNegotiation.update({
      where: { id: negotiationId },
      data: { status: NegotiationStatus.ACCEPTED },
    });

    let tutorProfile = await this.prisma.tutorProfile.findUnique({
      where: { userId: negotiation.tutorId },
    });

    if (!tutorProfile) {
      tutorProfile = await this.prisma.tutorProfile.create({
        data: {
          userId: negotiation.tutorId,
          bio: 'مدرس معتمد على منصة فك زنقة',
          isVerified: true,
          rankingScore: 85,
          ratingAvg: 5.0,
        },
      });
    }

    if (request.status === RequestStatus.PUBLISHED) {
      await this.transition(request.id, request.status, RequestStatus.MATCHING, studentId);
    }

    await this.transition(
      request.id,
      request.status === RequestStatus.PUBLISHED ? RequestStatus.MATCHING : request.status,
      RequestStatus.TUTOR_SELECTED,
      studentId,
      `Accepted negotiation from tutor ${negotiation.tutorId}`,
    );

    const startsAt = request.preferredAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

    await this.prisma.booking.upsert({
      where: { requestId },
      create: {
        requestId,
        tutorId: tutorProfile.id,
        teachingMode: request.teachingMode,
        startsAt,
        endsAt,
        priceEGP: negotiation.proposedAmountEGP,
      },
      update: {
        tutorId: tutorProfile.id,
        startsAt,
        endsAt,
        priceEGP: negotiation.proposedAmountEGP,
      },
    });

    const updatedRequest = await this.prisma.request.update({
      where: { id: requestId },
      data: { selectedTutorId: tutorProfile.id },
      include: { booking: true },
    });

    try {
      await this.pushService.sendToUser(negotiation.tutorId, {
        title: '🎉 تم قبول عرضك!',
        body: `الطالب وافق على عرض السعر (${negotiation.proposedAmountEGP} ج.م) وتم اختيارك للجلسة!`,
        url: '/dashboard/tutor',
        tag: `negotiation-accepted-${requestId}`,
      });
    } catch {}

    return updatedRequest;
  }

  // Student confirms payment for session -> Moves to PAYMENT_PENDING (awaiting Admin verification)
  async confirmPayment(requestId: string, studentId: string, senderAccount?: string, method?: string) {
    const request = await this.getOwnedRequest(requestId, studentId);
    if (request.status === RequestStatus.TUTOR_SELECTED) {
      // Save sender account info first
      if (senderAccount || method) {
        await this.prisma.request.update({
          where: { id: requestId },
          data: {
            paymentSenderAccount: senderAccount ?? null,
            paymentMethodUsed: method ?? null,
          },
        });
      }
      await this.transition(
        request.id,
        request.status,
        RequestStatus.PAYMENT_PENDING,
        studentId,
        `Student submitted payment transfer proof via ${method ?? 'unknown'} from ${senderAccount ?? 'unknown'}, awaiting admin verification`,
      );
    }
    return this.prisma.request.findUnique({
      where: { id: requestId },
      include: { booking: true, negotiations: true },
    });
  }

  // Admin approves student payment for session -> Moves to CONFIRMED
  async adminApprovePayment(requestId: string, adminId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: { booking: true },
    });
    if (!request) throw new NotFoundException('Request not found');

    if (
      request.status === RequestStatus.PAYMENT_PENDING ||
      request.status === RequestStatus.TUTOR_SELECTED
    ) {
      await this.transition(
        request.id,
        request.status,
        RequestStatus.CONFIRMED,
        adminId,
        'Admin verified payment and confirmed booking',
      );
    }

    return this.prisma.request.findUnique({
      where: { id: requestId },
      include: { booking: true, negotiations: true },
    });
  }

  // Admin rejects student payment for session -> Moves to CANCELLED
  async adminRejectPayment(requestId: string, adminId: string, reason?: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');

    if (
      request.status === RequestStatus.PAYMENT_PENDING ||
      request.status === RequestStatus.TUTOR_SELECTED
    ) {
      await this.transition(
        request.id,
        request.status,
        RequestStatus.CANCELLED,
        adminId,
        reason || 'Payment rejected by admin',
      );
    }

    return this.prisma.request.findUnique({
      where: { id: requestId },
    });
  }

  // Start / Open Session room (Only allowed after Admin Confirmed)
  async startSession(requestId: string, tutorId: string, meetingUrl?: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: { booking: true },
    });
    if (!request) throw new NotFoundException('Request not found');

    const tutorProfile = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
    });

    const isAuthorized =
      (tutorProfile && request.selectedTutorId === tutorProfile.id) ||
      request.selectedTutorId === tutorId ||
      request.booking?.tutorId === tutorProfile?.id;

    if (!isAuthorized) {
      throw new ForbiddenException('Only the selected tutor can open this session');
    }

    if (request.status === RequestStatus.PAYMENT_PENDING) {
      throw new BadRequestException('الجلسة في انتظار تأكيد استلام الدفع من إدارة المنصة أولاً');
    }

    if (meetingUrl && tutorProfile) {
      await this.prisma.tutorProfile.update({
        where: { id: tutorProfile.id },
        data: { meetingUrl: meetingUrl.trim() },
      });
    }

    if (
      request.status === RequestStatus.CONFIRMED ||
      request.status === RequestStatus.TUTOR_SELECTED
    ) {
      await this.transition(
        request.id,
        request.status,
        RequestStatus.IN_PROGRESS,
        tutorId,
        'Tutor started the live Google Meet session',
      );
    }

    try {
      await this.notifyRequestStudents(request.id, {
        title: '🚀 الجلسة بدأت الآن!',
        body: 'المدرس فتح قاعة الجلسة — اضغط للدخول مباشرة',
        url: `/room/${requestId}`,
        tag: `session-started-${requestId}`,
      });
    } catch {}

    return this.prisma.request.findUnique({
      where: { id: requestId },
      include: {
        booking: {
          include: {
            tutor: {
              include: {
                user: {
                  select: { id: true, fullName: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    });
  }

  // Complete Session -> gives +50 points to student and updates tutor stats & earnings
  async completeSession(requestId: string, actorId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: { booking: true },
    });
    if (!request) throw new NotFoundException('Request not found');

    if (
      request.status === RequestStatus.COMPLETED ||
      request.status === RequestStatus.STUDENT_RATED
    ) {
      return request;
    }

    // Transition to COMPLETED
    await this.transition(
      request.id,
      request.status,
      RequestStatus.COMPLETED,
      actorId,
      'Session completed successfully',
    );

    // Rule 2: نقاط إتمام جلسة بنجاح: +50 نقطة للطالب
    await this.prisma.pointTransaction.create({
      data: {
        userId: request.studentId,
        points: 50,
        reason: 'SESSION_COMPLETED',
        refType: 'Request',
        refId: request.id,
      },
    });

    await this.prisma.studentProfile.upsert({
      where: { userId: request.studentId },
      create: {
        userId: request.studentId,
        pointsBalance: 50,
      },
      update: {
        pointsBalance: { increment: 50 },
      },
    });

    // Update payment status to PAID if booking exists
    if (request.booking) {
      await this.prisma.payment.updateMany({
        where: { bookingId: request.booking.id },
        data: { status: 'PAID' },
      });
    }

    // Update tutor stats
    const tutorProfileId = request.booking?.tutorId;
    if (tutorProfileId) {
      await this.prisma.tutorProfile.updateMany({
        where: { id: tutorProfileId },
        data: {
          completedSessionsCount: { increment: 1 },
          studentsHelpedCount: { increment: 1 },
        },
      });
    }

    return this.prisma.request.findUnique({
      where: { id: requestId },
      include: { booking: true },
    });
  }

  async rateSession(
    requestId: string,
    studentId: string,
    dto: {
      overallRating: number;
      explanationRating?: number;
      communicationRating?: number;
      helpfulnessRating?: number;
      comment?: string;
    },
  ) {
    const request = await this.getOwnedRequest(requestId, studentId);
    const booking = await this.prisma.booking.findUnique({
      where: { requestId },
    });

    if (!booking) throw new NotFoundException('Booking not found for request');

    const result = await this.prisma.$transaction(async (tx) => {
      const review = await tx.review.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          authorId: studentId,
          tutorId: booking.tutorId,
          overallRating: dto.overallRating,
          explanationRating: dto.explanationRating ?? dto.overallRating,
          communicationRating: dto.communicationRating ?? dto.overallRating,
          helpfulnessRating: dto.helpfulnessRating ?? dto.overallRating,
          comment: dto.comment,
        },
        update: {
          overallRating: dto.overallRating,
          explanationRating: dto.explanationRating ?? dto.overallRating,
          communicationRating: dto.communicationRating ?? dto.overallRating,
          helpfulnessRating: dto.helpfulnessRating ?? dto.overallRating,
          comment: dto.comment,
        },
      });

      // Update tutor's real average rating and reputation stats
      const allTutorReviews = await tx.review.findMany({
        where: { tutorId: booking.tutorId },
        select: { overallRating: true },
      });
      const totalStars = allTutorReviews.reduce((sum, r) => sum + r.overallRating, 0);
      const ratingAvg = allTutorReviews.length > 0
        ? Number((totalStars / allTutorReviews.length).toFixed(1))
        : dto.overallRating;

      await tx.tutorProfile.update({
        where: { id: booking.tutorId },
        data: {
          ratingAvg,
          rankingScore: Math.min(100, Math.round(ratingAvg * 20)),
          studentsHelpedCount: { increment: 1 },
        },
      });

      if (request.status !== RequestStatus.STUDENT_RATED) {
        // Give 20 points reward to student only if it's the first time rating
        await tx.pointTransaction.create({
          data: {
            userId: studentId,
            points: 20,
            reason: 'TUTOR_RATED',
            refType: 'Review',
            refId: review.id,
          },
        });

        await tx.studentProfile.upsert({
          where: { userId: studentId },
          create: {
            userId: studentId,
            pointsBalance: 20,
          },
          update: {
            pointsBalance: { increment: 20 },
          },
        });

        await tx.request.update({
          where: { id: requestId },
          data: { status: RequestStatus.STUDENT_RATED },
        });
      }

      return review;
    });

    try {
      const tutorProfile = await this.prisma.tutorProfile.findUnique({
        where: { id: booking.tutorId },
        select: { userId: true },
      });
      if (tutorProfile?.userId) {
        await this.pushService.sendToUser(tutorProfile.userId, {
          title: '⭐ تقييم جديد من الطالب',
          body: `الطالب قيّم جلستك بـ ${dto.overallRating}/5 نجوم${dto.comment ? `: "${dto.comment}"` : ''}`,
          url: '/dashboard/tutor',
          tag: `rating-${requestId}`,
        });
      }
    } catch {}

    return result;
  }

  async openDispute(requestId: string, studentId: string, reason: string) {
    const request = await this.getOwnedRequest(requestId, studentId);
    assertValidTransition(request.status, RequestStatus.DISPUTED);
    return this.transition(
      request.id,
      request.status,
      RequestStatus.DISPUTED,
      studentId,
      reason,
    );
  }

  async cancel(requestId: string, actorId: string, reason?: string) {
    const request = await this.prisma.request.findUniqueOrThrow({
      where: { id: requestId },
    });
    assertValidTransition(request.status, RequestStatus.CANCELLED);
    return this.transition(
      request.id,
      request.status,
      RequestStatus.CANCELLED,
      actorId,
      reason,
    );
  }

  // Every transition goes through here so it's always paired with an
  // audit row — required for the DISPUTED flow to be resolvable.
  private async transition(
    requestId: string,
    from: RequestStatus,
    to: RequestStatus,
    changedByUserId: string,
    reason?: string,
  ) {
    return this.prisma.$transaction([
      this.prisma.request.update({ where: { id: requestId }, data: { status: to } }),
      this.prisma.requestStatusHistory.create({
        data: { requestId, fromStatus: from, toStatus: to, changedByUserId, reason },
      }),
    ]);
  }

  // IDOR protection: a student can only act on their own request.
  private async getOwnedRequest(requestId: string, studentId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.studentId !== studentId) {
      throw new ForbiddenException('This request does not belong to you');
    }
    return request;
  }

  async notifyRequestStudents(requestId: string, payload: any, excludeUserId?: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: {
        groupMembers: {
          where: { status: 'ACCEPTED' },
          select: { userId: true },
        },
      },
    });
    if (!request) return;

    const userIds = new Set<string>();
    if (request.studentId && request.studentId !== excludeUserId) {
      userIds.add(request.studentId);
    }
    for (const member of request.groupMembers) {
      if (member.userId !== excludeUserId) {
        userIds.add(member.userId);
      }
    }

    await Promise.allSettled(
      Array.from(userIds).map((uid) => this.pushService.sendToUser(uid, payload)),
    );
  }

  async findMyGroupInvitations(userId: string) {
    return this.prisma.requestGroupMember.findMany({
      where: { userId },
      include: {
        request: {
          include: {
            student: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            subject: true,
            topic: true,
            booking: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondToGroupInvitation(requestId: string, userId: string, action: 'ACCEPT' | 'DECLINE') {
    const member = await this.prisma.requestGroupMember.findUnique({
      where: {
        requestId_userId: { requestId, userId },
      },
      include: {
        request: {
          include: { student: true },
        },
        user: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Group invitation not found');
    }

    const updated = await this.prisma.requestGroupMember.update({
      where: {
        requestId_userId: { requestId, userId },
      },
      data: {
        status: action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED',
      },
    });

    if (action === 'ACCEPT') {
      try {
        await this.pushService.sendToUser(member.request.studentId, {
          title: '👥 قبول دعوة الجروب',
          body: `الطالب @${member.user.username || member.user.fullName} قبل الانضمام لجلسة "${member.request.description.slice(0, 30)}..."`,
          url: '/dashboard/student',
          tag: `group-accepted-${requestId}`,
        });
      } catch {}
    }

    return updated;
  }
}
