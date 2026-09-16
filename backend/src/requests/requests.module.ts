import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { TutorRankingService } from '../tutors/tutor-ranking.service';
import { PrismaService } from '../config/prisma.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [RequestsController],
  providers: [RequestsService, TutorRankingService, PrismaService],
})
export class RequestsModule {}
