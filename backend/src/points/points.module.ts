import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';

@Module({
  controllers: [PointsController],
  providers: [PointsService, PrismaService],
  exports: [PointsService],
})
export class PointsModule {}