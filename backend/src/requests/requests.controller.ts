import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestStatus } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RequestsService } from './requests.service';
import { SettingsService } from '../admin/settings.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(
    private requestsService: RequestsService,
    private settingsService: SettingsService,
  ) {}

  @Get('locations')
  async getLocations() {
    const locations = await this.settingsService.getLocations();
    return locations.filter((l: any) => l.isActive !== false);
  }

  @Roles('STUDENT')
  @Post()
  create(@Req() req: any, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.id, dto);
  }

  @Roles('STUDENT')
  @Get('my')
  findMyRequests(@Req() req: any, @Query('status') status?: RequestStatus) {
    return this.requestsService.findMyRequests(req.user.id, status);
  }

  @Roles('STUDENT')
  @Patch(':id/publish')
  publish(@Req() req: any, @Param('id') id: string) {
    return this.requestsService.publish(id, req.user.id);
  }

  @Get(':id')
  getById(@Req() req: any, @Param('id') id: string) {
    const isTutorOrAdmin =
      req.user.roles?.includes('ADMIN') || req.user.roles?.includes('TUTOR');
    return this.requestsService.getById(id, req.user.id, isTutorOrAdmin);
  }

  @Roles('STUDENT')
  @Patch(':id/select-tutor')
  selectTutor(
    @Req() req: any,
    @Param('id') id: string,
    @Body('tutorId') tutorId: string,
  ) {
    return this.requestsService.selectTutor(id, req.user.id, tutorId);
  }

  @Roles('TUTOR')
  @Post(':id/negotiate')
  negotiate(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    dto: {
      proposedAmountEGP: number;
      proposedTime: string;
    },
  ) {
    return this.requestsService.createNegotiation(id, req.user.id, dto);
  }

  @Roles('STUDENT', 'TUTOR')
  @Get(':id/negotiations')
  getNegotiations(@Req() req: any, @Param('id') id: string) {
    return this.requestsService.getNegotiations(id, req.user.id);
  }

  @Roles('STUDENT')
  @Patch(':id/negotiations/:negotiationId')
  respondToNegotiation(
    @Req() req: any,
    @Param('id') id: string,
    @Param('negotiationId') negotiationId: string,
    @Body('action') action: 'ACCEPT' | 'REJECT',
  ) {
    return this.requestsService.respondToNegotiation(
      id,
      req.user.id,
      negotiationId,
      action,
    );
  }

  @Roles('STUDENT')
  @Patch(':id/confirm-payment')
  confirmPayment(@Req() req: any, @Param('id') id: string, @Body() body: { senderAccount?: string; method?: string }) {
    return this.requestsService.confirmPayment(id, req.user.id, body?.senderAccount, body?.method);
  }

  @Roles('TUTOR')
  @Patch(':id/start')
  startSession(@Req() req: any, @Param('id') id: string) {
    return this.requestsService.startSession(id, req.user.id);
  }

  @Roles('TUTOR', 'ADMIN')
  @Patch(':id/complete')
  completeSession(@Req() req: any, @Param('id') id: string) {
    return this.requestsService.completeSession(id, req.user.id);
  }

  @Roles('STUDENT')
  @Post(':id/rate')
  rateSession(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    dto: {
      overallRating: number;
      explanationRating?: number;
      communicationRating?: number;
      helpfulnessRating?: number;
      comment?: string;
    },
  ) {
    return this.requestsService.rateSession(id, req.user.id, dto);
  }

  @Roles('STUDENT')
  @Post(':id/dispute')
  openDispute(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.requestsService.openDispute(id, req.user.id, reason);
  }

  @Roles('STUDENT', 'ADMIN')
  @Patch(':id/cancel')
  cancel(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.requestsService.cancel(id, req.user.id, reason);
  }
}
