import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { RequestsModule } from './requests/requests.module';
import { AdminModule } from './admin/admin.module';
import { TutorsModule } from './tutors/tutors.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { WorkshopsModule } from './workshops/workshops.module';
import { PayoutsModule } from './payouts/payouts.module';
import { PointsModule } from './points/points.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), // global baseline rate limit
    AuthModule,
    AdminModule,
    TutorsModule,
    RequestsModule,
    WorkshopsModule,
    PayoutsModule,
    PointsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // every route requires auth by default
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
