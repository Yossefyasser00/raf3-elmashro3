import { Global, Module } from '@nestjs/common';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { PrismaService } from '../config/prisma.service';

@Global()
@Module({
  controllers: [PushController],
  providers: [PushService, PrismaService],
  exports: [PushService],
})
export class PushModule {}
