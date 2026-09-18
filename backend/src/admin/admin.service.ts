import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PayoutStatus,
  Prisma,
  RequestStatus,
  RoleName,
  TeachingMode,
  TutorApplicationStatus,
  WorkshopStatus,
  WorkshopType,
} from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { SettingsService } from './settings.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
  ) {}

  // ------------------------------------------------------------
  // 1. PLATFORM OVERVIEW / STATS
  // ------------------------------------------------------------
  async getOverviewStats() {
    const [
      totalUsers,
      totalStudents,
      totalTutors,
      pendingApplications,
      totalRequests,
      activeRequests,
      disputedRequests,
      completedRequests,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.userRole.count({ where: { role: RoleName.STUDENT } }),
      this.prisma.userRole.count({ where: { role: RoleName.TUTOR } }),
      this.prisma.tutorApplication.count({
        where: {
          status: {
            in: [
              TutorApplicationStatus.PENDING,
              TutorApplicationStatus.UNDER_REVIEW,
            ],
          },
        },
      }),
      this.prisma.request.count(),
      this.prisma.request.count({
        where: {
          status: {
            in: [
              RequestStatus.PUBLISHED,
              RequestStatus.MATCHING,
              RequestStatus.TUTOR_SELECTED,
              RequestStatus.CONFIRMED,
              RequestStatus.IN_PROGRESS,
            ],
          },
        },
      }),
      this.prisma.request.count({
        where: { status: RequestStatus.DISPUTED },
      }),
      this.prisma.request.count({
        where: { status: RequestStatus.COMPLETED },
      }),
    ]);

    const commissionPercent = await this.settings.getNumber('COMMISSION_PERCENT');

    return {
      totalUsers,
      totalStudents,
      totalTutors,
      pendingApplications,
      totalRequests,
      activeRequests,
      disputedRequests,
      completedRequests,
      commissionPercent,
    };
  }

  // ------------------------------------------------------------
  // 2. TEACHER APPLICATIONS (ACCEPT / REJECT / REQUEST CHANGES)
  // ------------------------------------------------------------
  async getTutorApplications(status?: TutorApplicationStatus) {
    // 1. Auto-discover all users with TUTOR role or tutorProfile who don't have an application record yet
    const tutorsWithoutApp = await this.prisma.user.findMany({
      where: {
        roles: { some: { role: RoleName.TUTOR } },
        tutorApplications: { none: {} },
      },
      include: { tutorProfile: true },
    });

    for (const u of tutorsWithoutApp) {
      await this.prisma.tutorApplication.create({
        data: {
          userId: u.id,
          universityName: 'جامعة المنصورة',
          facultyName: 'كلية الهندسة / العلوم',
          experienceSummary: u.tutorProfile?.bio ?? 'طلب انضمام مسجل كمدرس',
          preferredMode: u.tutorProfile?.teachingMode ?? TeachingMode.BOTH,
          status: u.tutorProfile?.isVerified ? TutorApplicationStatus.ACCEPTED : TutorApplicationStatus.PENDING,
        },
      });
    }

    return this.prisma.tutorApplication.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
            tutorProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleFeaturedTutor(tutorId: string, isFeatured: boolean) {
    return this.prisma.tutorProfile.update({
      where: { id: tutorId },
      data: { isFeaturedOnHome: isFeatured },
    });
  }

  async createTutorProfileForUser(
    userId: string,
    dto: {
      fullName?: string;
      bio?: string;
      priceMinEGP?: number | null;
      priceMaxEGP?: number | null;
      teachingMode?: any;
      isFeaturedOnHome?: boolean;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.userRole.upsert({
      where: {
        userId_role: {
          userId,
          role: RoleName.TUTOR,
        },
      },
      create: {
        userId,
        role: RoleName.TUTOR,
      },
      update: {},
    });

    if (dto.fullName) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fullName: dto.fullName },
      });
    }

    const profile = await this.prisma.tutorProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: dto.bio ?? 'مدرس معتمد في فك زنقة',
        teachingMode: dto.teachingMode ?? 'BOTH',
        priceMinEGP: dto.priceMinEGP ?? 150,
        priceMaxEGP: dto.priceMaxEGP ?? 400,
        isVerified: true,
        verifiedAt: new Date(),
        isFeaturedOnHome: dto.isFeaturedOnHome ?? false,
      },
      update: {
        bio: dto.bio ?? undefined,
        teachingMode: dto.teachingMode ?? undefined,
        priceMinEGP: dto.priceMinEGP ?? undefined,
        priceMaxEGP: dto.priceMaxEGP ?? undefined,
        isVerified: true,
        verifiedAt: new Date(),
        isFeaturedOnHome: dto.isFeaturedOnHome ?? undefined,
      },
      include: {
        user: {
          select: { fullName: true, avatarUrl: true },
        },
        faculty: true,
        university: true,
      },
    });

    return profile;
  }

  async updateTutorProfile(
    tutorProfileId: string,
    dto: {
      fullName?: string;
      bio?: string;
      priceMinEGP?: number | null;
      priceMaxEGP?: number | null;
      teachingMode?: any;
      isFeaturedOnHome?: boolean;
    },
  ) {
    const profile = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorProfileId },
      include: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    const updateData: Prisma.TutorProfileUpdateInput = {
      bio: dto.bio,
      teachingMode: dto.teachingMode,
      priceMinEGP: dto.priceMinEGP ?? null,
      priceMaxEGP: dto.priceMaxEGP ?? null,
      isFeaturedOnHome: dto.isFeaturedOnHome,
    };

    if (dto.fullName) {
      await this.prisma.user.update({
        where: { id: profile.userId },
        data: { fullName: dto.fullName },
      });
    }

    return this.prisma.tutorProfile.update({
      where: { id: tutorProfileId },
      data: updateData,
      include: {
        user: {
          select: { fullName: true, avatarUrl: true },
        },
        faculty: true,
        university: true,
      },
    });
  }

  async deleteTutorProfile(tutorProfileId: string) {
    const profile = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorProfileId },
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return this.prisma.tutorProfile.delete({
      where: { id: tutorProfileId },
      include: {
        user: {
          select: { fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async toggleFeaturedWorkshop(workshopId: string, isFeatured: boolean) {
    return this.prisma.workshop.update({
      where: { id: workshopId },
      data: { isFeaturedOnHome: isFeatured },
    });
  }

  async reviewTutorApplication(
    applicationId: string,
    adminId: string,
    dto: {
      status: TutorApplicationStatus;
      adminNotes?: string;
    },
  ) {
    const application = await this.prisma.tutorApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException('Tutor application not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update the application status
      const updatedApp = await tx.tutorApplication.update({
        where: { id: applicationId },
        data: {
          status: dto.status,
          adminNotes: dto.adminNotes,
          reviewedByAdminId: adminId,
          reviewedAt: new Date(),
        },
      });

      // 2. If ACCEPTED, grant TUTOR role and create/update TutorProfile
      if (dto.status === TutorApplicationStatus.ACCEPTED) {
        // Ensure user has TUTOR role
        await tx.userRole.upsert({
          where: {
            userId_role: {
              userId: application.userId,
              role: RoleName.TUTOR,
            },
          },
          create: {
            userId: application.userId,
            role: RoleName.TUTOR,
          },
          update: {},
        });

        // Ensure TutorProfile is created and marked verified
        await tx.tutorProfile.upsert({
          where: { userId: application.userId },
          create: {
            userId: application.userId,
            bio: application.experienceSummary ?? 'مدرس معتمد في فك زنقة',
            teachingMode: application.preferredMode,
            isVerified: true,
            verifiedAt: new Date(),
            priceMinEGP: 150,
            priceMaxEGP: 400,
          },
          update: {
            isVerified: true,
            verifiedAt: new Date(),
            teachingMode: application.preferredMode,
          },
        });
      }

      // 3. If REJECTED, make sure tutor verification is false
      if (dto.status === TutorApplicationStatus.REJECTED) {
        const existingProfile = await tx.tutorProfile.findUnique({
          where: { userId: application.userId },
        });
        if (existingProfile) {
          await tx.tutorProfile.update({
            where: { userId: application.userId },
            data: { isVerified: false },
          });
        }
      }

      return updatedApp;
    });
  }

  // ------------------------------------------------------------
  // 3. ALL STUDENT REQUESTS OVERSIGHT
  // ------------------------------------------------------------
  async getAllRequests(filters?: {
    status?: RequestStatus;
    search?: string;
  }) {
    const where: Prisma.RequestWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { student: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { student: { email: { contains: filters.search, mode: 'insensitive' } } },
        { subject: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.request.findMany({
      where,
      include: {
        student: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        subject: true,
        topic: true,
        matches: {
          include: {
            tutor: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
          },
        },
        booking: {
          include: {
            tutor: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
            payment: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async overrideRequestStatus(
    requestId: string,
    adminId: string,
    newStatus: RequestStatus,
    reason?: string,
  ) {
    const req = await this.prisma.request.findUnique({
      where: { id: requestId },
    });
    if (!req) throw new NotFoundException('Request not found');

    return this.prisma.$transaction([
      this.prisma.request.update({
        where: { id: requestId },
        data: { status: newStatus },
      }),
      this.prisma.requestStatusHistory.create({
        data: {
          requestId,
          fromStatus: req.status,
          toStatus: newStatus,
          changedByUserId: adminId,
          reason: reason ?? 'Admin status override',
        },
      }),
    ]);
  }

  // ------------------------------------------------------------
  // 4. USER DIRECTORY & PERMISSIONS
  // ------------------------------------------------------------
  async getUsers(search?: string, role?: RoleName) {
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.roles = {
        some: { role },
      };
    }

    return this.prisma.user.findMany({
      where,
      include: {
        roles: true,
        studentProfile: true,
        tutorProfile: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createWorkshop(dto: {
    title: string;
    description?: string;
    startsAt: string;
    endsAt: string;
    type?: WorkshopType;
    priceEGP?: number;
    capacity?: number;
    tutorId?: string;
  }) {
    return this.prisma.workshop.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        type: dto.type ?? (dto.priceEGP && dto.priceEGP > 0 ? WorkshopType.PAID : WorkshopType.FREE),
        priceEGP: dto.priceEGP ? Number(dto.priceEGP) : null,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        capacity: dto.capacity ? Number(dto.capacity) : null,
        tutorId: dto.tutorId ?? null,
        status: WorkshopStatus.PENDING,
      },
    });
  }

  async getWorkshops(status?: WorkshopStatus) {
    return this.prisma.workshop.findMany({
      where: status ? { status } : undefined,
      include: {
        tutor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWorkshopStatus(id: string, status: WorkshopStatus) {
    const workshop = await this.prisma.workshop.findUnique({ where: { id } });
    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }

    const shouldFeatureOnHome = status === WorkshopStatus.APPROVED || status === WorkshopStatus.PUBLISHED;

    return this.prisma.workshop.update({
      where: { id },
      data: {
        status,
        isFeaturedOnHome: shouldFeatureOnHome ? true : false,
      },
    });
  }

  async grantFreeAccess(workshopId: string, studentId: string, adminId: string) {
    const workshop = await this.prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }

    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.workshopFreeAccess.create({
      data: {
        workshopId,
        studentId,
        grantedById: adminId,
      },
    });
  }

  async getPayouts() {
    return this.prisma.payoutRequest.findMany({
      include: {
        tutor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePayoutStatus(id: string, status: PayoutStatus) {
    const payout = await this.prisma.payoutRequest.findUnique({ where: { id } });
    if (!payout) {
      throw new NotFoundException('Payout request not found');
    }

    return this.prisma.payoutRequest.update({
      where: { id },
      data: { status },
    });
  }

  async editUserInfo(userId: string, dto: { fullName?: string; phone?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fullName = dto.fullName?.trim();
    const phone = dto.phone?.trim() || null;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(dto.phone !== undefined ? { phone } : {}),
      },
    });
  }

  async toggleUserActive(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  async grantUserRole(userId: string, role: RoleName) {
    return this.prisma.userRole.upsert({
      where: { userId_role: { userId, role } },
      create: { userId, role },
      update: {},
    });
  }

  async revokeUserRole(userId: string, role: RoleName) {
    return this.prisma.userRole.deleteMany({
      where: { userId, role },
    });
  }

  // ------------------------------------------------------------
  // 5. DISPUTES & RESOLUTION
  // ------------------------------------------------------------
  async getDisputedRequests() {
    return this.prisma.request.findMany({
      where: { status: RequestStatus.DISPUTED },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        booking: {
          include: {
            tutor: { include: { user: true } },
            payment: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async resolveDispute(
    requestId: string,
    adminId: string,
    resolution: 'REFUND_STUDENT' | 'PAYOUT_TUTOR' | 'SPLIT',
    adminNotes?: string,
  ) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: { booking: { include: { payment: true } } },
    });

    if (!request) throw new NotFoundException('Request not found');

    return this.prisma.$transaction(async (tx) => {
      const nextStatus =
        resolution === 'REFUND_STUDENT'
          ? RequestStatus.CANCELLED
          : RequestStatus.COMPLETED;

      await tx.request.update({
        where: { id: requestId },
        data: { status: nextStatus },
      });

      await tx.requestStatusHistory.create({
        data: {
          requestId,
          fromStatus: RequestStatus.DISPUTED,
          toStatus: nextStatus,
          changedByUserId: adminId,
          reason: `Dispute resolved (${resolution}): ${adminNotes ?? 'No notes'}`,
        },
      });

      return { success: true, resolution, nextStatus };
    });
  }

  // ------------------------------------------------------------
  // INVOICES: All platform payments (sessions + workshops)
  // ------------------------------------------------------------
  async getAllInvoices() {
    const COMMISSION = 0.20;

    // Session invoices: requests that are CONFIRMED or beyond
    const sessionRequests = await this.prisma.request.findMany({
      where: {
        status: {
          in: [
            RequestStatus.TUTOR_SELECTED,
            RequestStatus.CONFIRMED,
            RequestStatus.IN_PROGRESS,
            RequestStatus.COMPLETED,
            RequestStatus.STUDENT_RATED,
            RequestStatus.DISPUTED,
          ],
        },
        budgetEGP: { not: null },
      },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        subject: { select: { name: true } },
        topic: { select: { name: true } },
        negotiations: {
          where: { status: 'ACCEPTED' },
          include: {
            tutor: { select: { id: true, fullName: true, email: true } },
          },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Workshop enrollment invoices: paid workshops only
    const workshopEnrollments = await this.prisma.workshopEnrollment.findMany({
      where: {
        workshop: { type: 'PAID', priceEGP: { not: null } },
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        workshop: {
          select: {
            id: true,
            title: true,
            priceEGP: true,
            startsAt: true,
            tutor: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sessionInvoices = sessionRequests.map((r) => {
      const acceptedNeg = (r.negotiations as any[])[0];
      return {
        id: `SES-${r.id.slice(0, 8).toUpperCase()}`,
        type: 'SESSION' as const,
        requestId: r.id,
        student: (r as any).student,
        tutor: acceptedNeg?.tutor ?? null,
        subject: (r as any).subject?.name ?? (r as any).topic?.name ?? 'جلسة خاصة',
        amountEGP: r.budgetEGP ?? 0,
        platformCommissionEGP: Math.round((r.budgetEGP ?? 0) * COMMISSION),
        tutorNetEGP: Math.round((r.budgetEGP ?? 0) * (1 - COMMISSION)),
        status: r.status,
        date: r.updatedAt,
        paymentSenderAccount: (r as any).paymentSenderAccount ?? null,
        paymentMethodUsed: (r as any).paymentMethodUsed ?? null,
      };
    });

    const workshopInvoices = workshopEnrollments.map((e) => ({
      id: `WRK-${e.id.slice(0, 8).toUpperCase()}`,
      type: 'WORKSHOP' as const,
      enrollmentId: e.id,
      student: e.user,
      tutor: (e.workshop as any).tutor ?? null,
      subject: e.workshop.title,
      amountEGP: e.workshop.priceEGP ?? 0,
      platformCommissionEGP: Math.round((e.workshop.priceEGP ?? 0) * COMMISSION),
      tutorNetEGP: Math.round((e.workshop.priceEGP ?? 0) * (1 - COMMISSION)),
      status: 'PAID',
      date: e.createdAt,
    }));

    const allInvoices = [...sessionInvoices, ...workshopInvoices].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const totalRevenue = allInvoices.reduce((s, i) => s + i.amountEGP, 0);
    const totalCommission = allInvoices.reduce((s, i) => s + i.platformCommissionEGP, 0);

    return { invoices: allInvoices, totalRevenue, totalCommission };
  }

  // ------------------------------------------------------------
  // SESSIONS PAYMENT APPROVAL
  // ------------------------------------------------------------
  async approveRequestPayment(requestId: string, adminId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: { booking: true },
    });
    if (!request) throw new NotFoundException('Request not found');

    const fromStatus = request.status;
    await this.prisma.request.update({
      where: { id: requestId },
      data: { status: RequestStatus.CONFIRMED },
    });

    await this.prisma.requestStatusHistory.create({
      data: {
        requestId,
        fromStatus,
        toStatus: RequestStatus.CONFIRMED,
        changedByUserId: adminId,
        reason: 'Admin verified and approved student payment',
      },
    });

    return this.prisma.request.findUnique({
      where: { id: requestId },
      include: { booking: true, negotiations: true },
    });
  }

  async rejectRequestPayment(requestId: string, adminId: string, reason?: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');

    const fromStatus = request.status;
    await this.prisma.request.update({
      where: { id: requestId },
      data: { status: RequestStatus.CANCELLED },
    });

    await this.prisma.requestStatusHistory.create({
      data: {
        requestId,
        fromStatus,
        toStatus: RequestStatus.CANCELLED,
        changedByUserId: adminId,
        reason: reason || 'Admin rejected student payment',
      },
    });

    return this.prisma.request.findUnique({
      where: { id: requestId },
    });
  }

  // ------------------------------------------------------------
  // WORKSHOP ENROLLMENTS APPROVAL
  // ------------------------------------------------------------
  async getAllWorkshopEnrollments() {
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

  async approveWorkshopEnrollment(enrollmentId: string) {
    return this.prisma.workshopEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'APPROVED' },
      include: {
        workshop: { include: { tutor: { select: { fullName: true, email: true } } } },
        user: { select: { fullName: true, email: true } },
      },
    });
  }

  async rejectWorkshopEnrollment(enrollmentId: string) {
    return this.prisma.workshopEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'REJECTED' },
      include: {
        workshop: { include: { tutor: { select: { fullName: true, email: true } } } },
        user: { select: { fullName: true, email: true } },
      },
    });
  }
}
