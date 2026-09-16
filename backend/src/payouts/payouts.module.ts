import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { PayoutsService } from './payouts.service';
import { PayoutsController } from './payouts.controller';

@Module({
  providers: [PayoutsService, PrismaService],
  controllers: [PayoutsController]
})
export class PayoutsModule {}
