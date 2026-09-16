import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RequestStatus,
  TeachingMode,
  TutorApplicationStatus,
} from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { SettingsService } from '../admin/settings.service';

@Injectable()
export class TutorsService {
  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
  ) {}

  // ------------------------------------------------------------
  // FEATURED TUTORS
  // ------------------------------------------------------------
  async getFeaturedTutors() {
    return this.prisma.tutorProfile.findMany({
      where: { isFeaturedOnHome: true },
      include: {
        user: {
          select: { fullName: true, avatarUrl: true },
        },
        university: true,
        faculty: true,
      },
      take: 6,
    });
  }

  // ------------------------------------------------------------
  // 1. TEACHER APPLICATION
  // ------------------------------------------------------------
  async submitApplication(
    userId: string,
    dto: {
      universityName: string;
      facultyName: string;
      departmentName?: string;
      experienceSummary?: string;
      introVideoUrl?: string;
      preferredMode?: TeachingMode;
    },
  ) {
    const existing = await this.prisma.tutorApplication.findFirst({
      where: {
        userId,
        status: {
          in: [
            TutorApplicationStatus.PENDING,
            TutorApplicationStatus.UNDER_REVIEW,
            TutorApplicationStatus.ACCEPTED,
          ],
        },
      },
    });

    if (existing) {
      if (existing.status === TutorApplicationStatus.ACCEPTED) {
        throw new ConflictException('You are already an accepted tutor');
      }
      throw new ConflictException(
        'You already have an active application under review',
      );
    }

    return this.prisma.tutorApplication.create({
      data: {
        userId,
        universityName: dto.universityName,
        facultyName: dto.facultyName,
        departmentName: dto.departmentName,
        experienceSummary: dto.experienceSummary,
        introVideoUrl: dto.introVideoUrl,
        preferredMode: dto.preferredMode ?? TeachingMode.BOTH,
        status: TutorApplicationStatus.PENDING,
      },
    });
  }

  async getMyApplication(userId: string) {
    return this.prisma.tutorApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ------------------------------------------------------------
  // 2. TUTOR LEADS (OPEN REQUESTS MATCHING TUTOR)
  // ------------------------------------------------------------
  async getLeadsForTutor(userId: string) {
    const tutorProfile = await this.prisma.tutorProfile.findUnique({
      where: { userId },
      include: { subjects: true, topics: true },
    });

    // Fetch requests that are either MATCHING or PUBLISHED
    return this.prisma.request.findMany({
      where: {
        status: { in: [RequestStatus.PUBLISHED, RequestStatus.MATCHING] },
      },
      include: {
        student: { select: { fullName: true, avatarUrl: true } },
        subject: true,
        topic: true,
        university: true,
        faculty: true,
        negotiations: {
          where: { tutorId: userId },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // ------------------------------------------------------------
  // 3. TUTOR BOOKINGS & SCHEDULE
  // ------------------------------------------------------------
  async getMyBookings(userId: string) {
    const tutorProfile = await this.prisma.tutorProfile.findUnique({
      where: { userId },
    });
    if (!tutorProfile) return [];

    return this.prisma.booking.findMany({
      where: { tutorId: tutorProfile.id },
      include: {
        request: {
          include: {
            student: {
              select: { fullName: true, email: true, phone: true },
            },
            subject: true,
            topic: true,
          },
        },
        tutor: {
          select: { meetingUrl: true },
        },
        payment: true,
        review: true,
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  // ------------------------------------------------------------
  // 4. EARNINGS & REVIEWS
  // ------------------------------------------------------------
  async getEarningsSummary(userId: string) {
    const tutorProfile = await this.prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        bookings: {
          include: { payment: true },
        },
      },
    });

    if (!tutorProfile) {
      return {
        totalEarnings: 0,
        clearedEarnings: 0,
        pendingEarnings: 0,
        platformFees: 0,
        completedSessions: 0,
      };
    }

    let clearedEarnings = 0;
    let pendingEarnings = 0;
    let platformFees = 0;

    for (const b of tutorProfile.bookings) {
      if (b.payment) {
        if (b.payment.status === 'PAID') {
          clearedEarnings += b.payment.tutorEarningsEGP;
          platformFees += b.payment.platformFeeEGP;
        } else {
          pendingEarnings += b.payment.tutorEarningsEGP;
        }
      }
    }

    return {
      totalEarnings: clearedEarnings + pendingEarnings,
      clearedEarnings,
      pendingEarnings,
      platformFees,
      completedSessions: tutorProfile.completedSessionsCount,
      ratingAvg: tutorProfile.ratingAvg,
      studentsHelpedCount: tutorProfile.studentsHelpedCount,
    };
  }

  // ------------------------------------------------------------
  // 5. PUBLIC TUTOR LISTING (all verified tutors)
  // ------------------------------------------------------------
  async getAllTutors() {
    return this.prisma.tutorProfile.findMany({
      where: { isVerified: true },
      include: {
        user: {
          select: { fullName: true, avatarUrl: true },
        },
        university: { select: { name: true } },
        faculty: { select: { name: true } },
        subjects: {
          include: { subject: { select: { id: true, name: true } } },
        },
        reviewsReceived: {
          select: { overallRating: true },
          take: 100,
        },
      },
      orderBy: { rankingScore: 'desc' },
    });
  }

  // ------------------------------------------------------------
  // 6. PUBLIC PROFILE (single tutor — for students to view)
  // ------------------------------------------------------------
  async getPublicProfile(idOrUserId: string) {
    let profile = await this.prisma.tutorProfile.findFirst({
      where: {
        OR: [
          { id: idOrUserId },
          { userId: idOrUserId },
        ],
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
            createdAt: true,
            workshopsTaught: {
              orderBy: { startsAt: 'desc' },
            },
          },
        },
        university: { select: { name: true } },
        faculty: { select: { name: true } },
        department: { select: { name: true } },
        subjects: {
          include: { subject: { select: { id: true, name: true } } },
        },
        topics: {
          include: { topic: { select: { id: true, name: true } } },
        },
        reviewsReceived: {
          include: {
            author: { select: { fullName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!profile) {
      const user = await this.prisma.user.findUnique({ where: { id: idOrUserId } });
      if (user) {
        await this.prisma.tutorProfile.create({
          data: {
            userId: user.id,
            bio: 'مدرس معتمد على منصة فك زنقة',
            isVerified: true,
            rankingScore: 85,
            ratingAvg: 5.0,
          },
        });
        profile = await this.prisma.tutorProfile.findFirst({
          where: { userId: user.id },
          include: {
            user: {
              select: {
                fullName: true,
                avatarUrl: true,
                createdAt: true,
                workshopsTaught: {
                  orderBy: { startsAt: 'desc' },
                },
              },
            },
            university: { select: { name: true } },
            faculty: { select: { name: true } },
            department: { select: { name: true } },
            subjects: {
              include: { subject: { select: { id: true, name: true } } },
            },
            topics: {
              include: { topic: { select: { id: true, name: true } } },
            },
            reviewsReceived: {
              include: {
                author: { select: { fullName: true, avatarUrl: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        });
      }
    }

    if (!profile) throw new NotFoundException('Tutor profile not found');
    return {
      ...profile,
      workshops: profile.user?.workshopsTaught || [],
    };
  }

  // ------------------------------------------------------------
  // 7. MY PROFILE (for the logged-in tutor)
  // ------------------------------------------------------------
  async getMyProfile(userId: string) {
    let profile = await this.prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { fullName: true, avatarUrl: true, email: true, phone: true },
        },
        university: { select: { id: true, name: true } },
        faculty: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        subjects: {
          include: { subject: { select: { id: true, name: true } } },
        },
        topics: {
          include: { topic: { select: { id: true, name: true } } },
        },
        reviewsReceived: {
          select: { overallRating: true },
        },
      },
    });

    if (!profile) {
      await this.prisma.tutorProfile.create({
        data: {
          userId,
          bio: 'مدرس معتمد على منصة فك زنقة',
          isVerified: true,
          rankingScore: 85,
          ratingAvg: 5.0,
        },
      });
      profile = await this.prisma.tutorProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: { fullName: true, avatarUrl: true, email: true, phone: true },
          },
          university: { select: { id: true, name: true } },
          faculty: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          subjects: {
            include: { subject: { select: { id: true, name: true } } },
          },
          topics: {
            include: { topic: { select: { id: true, name: true } } },
          },
          reviewsReceived: {
            select: { overallRating: true },
          },
        },
      });
    }

    // Also fetch all available subjects so the tutor can pick from them
    const allSubjects = await this.prisma.subject.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return { profile, allSubjects };
  }

  // ------------------------------------------------------------
  // 8. UPDATE MY PROFILE (bio, prices, teachingMode, meetingUrl)
  // ------------------------------------------------------------
  async updateMyProfile(
    userId: string,
    data: {
      bio?: string;
      priceMinEGP?: number;
      priceMaxEGP?: number;
      teachingMode?: 'ONLINE' | 'IN_PERSON' | 'BOTH';
      meetingUrl?: string;
    },
  ) {
    let profile = await this.prisma.tutorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      profile = await this.prisma.tutorProfile.create({
        data: {
          userId,
          bio: data.bio || 'مدرس معتمد على منصة فك زنقة',
          isVerified: true,
          rankingScore: 85,
          ratingAvg: 5.0,
        },
      });
    }

    return this.prisma.tutorProfile.update({
      where: { userId },
      data: {
        bio: data.bio,
        priceMinEGP: data.priceMinEGP !== undefined ? Number(data.priceMinEGP) : undefined,
        priceMaxEGP: data.priceMaxEGP !== undefined ? Number(data.priceMaxEGP) : undefined,
        teachingMode: data.teachingMode as any,
        meetingUrl: data.meetingUrl !== undefined ? data.meetingUrl : undefined,
      },
      include: {
        subjects: {
          include: { subject: { select: { id: true, name: true } } },
        },
      },
    });
  }

  // ------------------------------------------------------------
  // 9. UPDATE MY SUBJECTS (replace entire list, supports IDs or names)
  // ------------------------------------------------------------
  async updateMySubjects(userId: string, subjectsList: string[]) {
    let profile = await this.prisma.tutorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      profile = await this.prisma.tutorProfile.create({
        data: {
          userId,
          bio: 'مدرس معتمد على منصة فك زنقة',
          isVerified: true,
          rankingScore: 85,
          ratingAvg: 5.0,
        },
      });
    }

    // Delete all existing subjects for this tutor
    await this.prisma.tutorSubject.deleteMany({
      where: { tutorId: profile.id },
    });

    const targetSubjectIds: string[] = [];

    for (const item of subjectsList) {
      if (!item || !item.trim()) continue;
      const clean = item.trim();
      let sub = await this.prisma.subject.findFirst({
        where: { OR: [{ id: clean }, { name: clean }] },
      });
      if (!sub) {
        sub = await this.prisma.subject.create({
          data: { name: clean },
        });
      }
      targetSubjectIds.push(sub.id);
    }

    if (targetSubjectIds.length > 0) {
      await this.prisma.tutorSubject.createMany({
        data: Array.from(new Set(targetSubjectIds)).map((subjectId) => ({
          tutorId: profile.id,
          subjectId,
        })),
        skipDuplicates: true,
      });
    }

    return this.prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        subjects: {
          include: { subject: { select: { id: true, name: true } } },
        },
      },
    });
  }

  // ------------------------------------------------------------
  // 10. GET MY REVIEWS (tutor reviews received)
  // ------------------------------------------------------------
  async getMyReviews(userId: string) {
    const tutorProfile = await this.prisma.tutorProfile.findUnique({
      where: { userId },
    });
    if (!tutorProfile) return [];

    return this.prisma.review.findMany({
      where: { tutorId: tutorProfile.id },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
        booking: {
          include: {
            request: {
              select: {
                subject: { select: { name: true } },
                topic: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
