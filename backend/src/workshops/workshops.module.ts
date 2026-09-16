import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { WorkshopsService } from './workshops.service';
import { WorkshopsController } from './workshops.controller';
import { YoutubeService } from './youtube.service';

@Module({
  providers: [WorkshopsService, PrismaService, YoutubeService],
  controllers: [WorkshopsController]
})
export class WorkshopsModule {}
