import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

// Weights are here (not scattered across queries) so tuning the
// matching algorithm later is a one-place change. Could be moved to
// PlatformSetting if the admin needs to tune it without a deploy.
const WEIGHTS = {
  rating: 0.25,
  completedSessions: 0.15,
  responseRate: 0.15,
  successRate: 0.15,
  topicRelevance: 0.2,
  availability: 0.05,
  verification: 0.05,
};

interface CandidateInput {
  tutorId: string;
  ratingAvg: number;            // 0-5
  completedSessionsCount: number;
  responseRatePct: number;      // 0-100
  successRatePct: number;       // 0-100
  isVerified: boolean;
  hasMatchingTopic: boolean;
  hasAvailabilityNearPreferredTime: boolean;
}

function normalize(value: number, max: number) {
  return Math.max(0, Math.min(1, value / max));
}

export function scoreTutor(c: CandidateInput): number {
  const score =
    WEIGHTS.rating * normalize(c.ratingAvg, 5) +
    WEIGHTS.completedSessions * normalize(c.completedSessionsCount, 100) +
    WEIGHTS.responseRate * normalize(c.responseRatePct, 100) +
    WEIGHTS.successRate * normalize(c.successRatePct, 100) +
    WEIGHTS.topicRelevance * (c.hasMatchingTopic ? 1 : 0) +
    WEIGHTS.availability * (c.hasAvailabilityNearPreferredTime ? 1 : 0) +
    WEIGHTS.verification * (c.isVerified ? 1 : 0);

  return Math.round(score * 1000) / 1000; // 0..1
}

@Injectable()
export class TutorRankingService {
  constructor(private prisma: PrismaService) {}

  // Returns the top N candidate tutors for a request. This is the
  // engine behind "show the best 3-5 matches" instead of a browsable
  // directory — the core UX principle of the product.
  async findTopMatches(params: {
    subjectId?: string | null;
    topicId?: string | null;
    teachingMode: 'ONLINE' | 'IN_PERSON' | 'BOTH';
    limit?: number;
  }) {
    const { subjectId, topicId, teachingMode, limit = 5 } = params;

    const candidates = await this.prisma.tutorProfile.findMany({
      where: {
        isVerified: true,
        ...(subjectId ? { subjects: { some: { subjectId } } } : {}),
        OR: [{ teachingMode }, { teachingMode: 'BOTH' }],
      },
      include: { topics: true, availabilities: true },
      take: 50, // pre-filter pool; final ranking narrows to `limit`
    });

    const ranked = candidates
      .map((tutor) =>
        scoreTutor({
          tutorId: tutor.id,
          ratingAvg: tutor.ratingAvg,
          completedSessionsCount: tutor.completedSessionsCount,
          responseRatePct: tutor.responseRatePct,
          successRatePct: tutor.successRatePct,
          isVerified: tutor.isVerified,
          hasMatchingTopic: topicId ? tutor.topics.some((t) => t.topicId === topicId) : false,
          hasAvailabilityNearPreferredTime: tutor.availabilities.length > 0,
        }),
      )
      .map((score, i) => ({ tutor: candidates[i], score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return ranked;
  }
}
