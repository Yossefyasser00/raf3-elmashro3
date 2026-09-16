import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { SettingsService } from '../admin/settings.service';
import { TutorRankingService } from './tutor-ranking.service';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';

@Module({
  controllers: [TutorsController],
  providers: [TutorsService, TutorRankingService, SettingsService, PrismaService],
  exports: [TutorsService, TutorRankingService],
})
export class TutorsModule {}
