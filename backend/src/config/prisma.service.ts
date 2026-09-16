import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Single shared Prisma client, injected wherever DB access is needed.
// Keeping this as its own module (not re-instantiated per-module) avoids
// exhausting Postgres connections as the app grows.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      console.error('Prisma connect error on init:', e);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (e) {
      console.error('Prisma disconnect error:', e);
    }
  }
}
