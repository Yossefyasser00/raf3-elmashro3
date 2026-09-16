import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SettingsService } from './settings.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, SettingsService, PrismaService],
  exports: [AdminService, SettingsService],
})
export class AdminModule {}
