/*
  Warnings:

  - Added the required column `updatedAt` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkshopStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "NegotiationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN     "isFeaturedOnHome" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "isFeaturedOnHome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "WorkshopStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tutorId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "AiNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT,
    "topic" TEXT,
    "sourceContent" TEXT,
    "shortSummary" TEXT NOT NULL,
    "detailedSummary" TEXT NOT NULL,
    "keyPoints" JSONB NOT NULL,
    "definitions" JSONB NOT NULL,
    "formulas" JSONB NOT NULL,
    "concepts" JSONB NOT NULL,
    "rememberList" JSONB NOT NULL,
    "tags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGeneratedQuiz" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "sourceType" TEXT NOT NULL DEFAULT 'CUSTOM',
    "sourceId" TEXT,
    "questions" JSONB NOT NULL,
    "isPublishedByTeacher" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiGeneratedQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "answers" JSONB NOT NULL,
    "weakTopicsIdentified" JSONB NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeakPoint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "masteryScore" DOUBLE PRECISION NOT NULL,
    "struggleReason" TEXT NOT NULL,
    "mistakeCount" INTEGER NOT NULL DEFAULT 1,
    "recommendedLessons" JSONB NOT NULL,
    "recommendedNotes" JSONB NOT NULL,
    "recommendedQuizzes" JSONB NOT NULL,
    "recommendedQuestions" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastEvaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeakPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyRoadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "currentLevel" TEXT NOT NULL,
    "dailyStudyMinutes" INTEGER NOT NULL DEFAULT 60,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "progressPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentStreakDays" INTEGER NOT NULL DEFAULT 1,
    "tasks" JSONB NOT NULL,
    "adaptiveNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiExam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topics" JSONB NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "questions" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiExamAttempt" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "topicPerformance" JSONB NOT NULL,
    "weakAreas" JSONB NOT NULL,
    "aiFeedback" TEXT NOT NULL,
    "recommendedNextSteps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiVoiceSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT,
    "summary" TEXT,
    "messages" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiVoiceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAiResource" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "gradeLevel" TEXT,
    "difficulty" TEXT,
    "content" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherAiResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopFreeAccess" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkshopFreeAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "amountEGP" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "accountDetails" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestNegotiation" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "proposedAmountEGP" INTEGER NOT NULL,
    "proposedTime" TEXT NOT NULL,
    "status" "NegotiationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestNegotiation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiNote_userId_idx" ON "AiNote"("userId");

-- CreateIndex
CREATE INDEX "AiGeneratedQuiz_userId_idx" ON "AiGeneratedQuiz"("userId");

-- CreateIndex
CREATE INDEX "AiQuizAttempt_userId_idx" ON "AiQuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "AiQuizAttempt_quizId_idx" ON "AiQuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "WeakPoint_userId_subject_idx" ON "WeakPoint"("userId", "subject");

-- CreateIndex
CREATE INDEX "StudyRoadmap_userId_idx" ON "StudyRoadmap"("userId");

-- CreateIndex
CREATE INDEX "AiExam_userId_idx" ON "AiExam"("userId");

-- CreateIndex
CREATE INDEX "AiExamAttempt_userId_idx" ON "AiExamAttempt"("userId");

-- CreateIndex
CREATE INDEX "AiExamAttempt_examId_idx" ON "AiExamAttempt"("examId");

-- CreateIndex
CREATE INDEX "AiVoiceSession_userId_idx" ON "AiVoiceSession"("userId");

-- CreateIndex
CREATE INDEX "TeacherAiResource_teacherId_resourceType_idx" ON "TeacherAiResource"("teacherId", "resourceType");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopFreeAccess_workshopId_studentId_key" ON "WorkshopFreeAccess"("workshopId", "studentId");

-- CreateIndex
CREATE INDEX "PayoutRequest_tutorId_idx" ON "PayoutRequest"("tutorId");

-- CreateIndex
CREATE INDEX "PayoutRequest_status_idx" ON "PayoutRequest"("status");

-- CreateIndex
CREATE INDEX "RequestNegotiation_requestId_idx" ON "RequestNegotiation"("requestId");

-- CreateIndex
CREATE INDEX "RequestNegotiation_tutorId_idx" ON "RequestNegotiation"("tutorId");

-- CreateIndex
CREATE INDEX "RequestNegotiation_studentId_idx" ON "RequestNegotiation"("studentId");

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiNote" ADD CONSTRAINT "AiNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneratedQuiz" ADD CONSTRAINT "AiGeneratedQuiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizAttempt" ADD CONSTRAINT "AiQuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "AiGeneratedQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizAttempt" ADD CONSTRAINT "AiQuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeakPoint" ADD CONSTRAINT "WeakPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoadmap" ADD CONSTRAINT "StudyRoadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiExam" ADD CONSTRAINT "AiExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiExamAttempt" ADD CONSTRAINT "AiExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "AiExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiExamAttempt" ADD CONSTRAINT "AiExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiVoiceSession" ADD CONSTRAINT "AiVoiceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAiResource" ADD CONSTRAINT "TeacherAiResource_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopFreeAccess" ADD CONSTRAINT "WorkshopFreeAccess_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopFreeAccess" ADD CONSTRAINT "WorkshopFreeAccess_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopFreeAccess" ADD CONSTRAINT "WorkshopFreeAccess_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestNegotiation" ADD CONSTRAINT "RequestNegotiation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestNegotiation" ADD CONSTRAINT "RequestNegotiation_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestNegotiation" ADD CONSTRAINT "RequestNegotiation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
