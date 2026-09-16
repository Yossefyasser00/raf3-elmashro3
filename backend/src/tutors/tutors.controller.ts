import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TeachingMode } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { TutorsService } from './tutors.service';

import { Public } from '../common/decorators/public.decorator';

@Controller('tutors')
export class TutorsController {
  constructor(private tutorsService: TutorsService) {}

  @Public()
  @Get('featured')
  getFeaturedTutors() {
    return this.tutorsService.getFeaturedTutors();
  }

  @Post('apply')
  submitApplication(
    @Req() req: any,
    @Body()
    dto: {
      universityName: string;
      facultyName: string;
      departmentName?: string;
      experienceSummary?: string;
      introVideoUrl?: string;
      preferredMode?: TeachingMode;
    },
  ) {
    return this.tutorsService.submitApplication(req.user.id, dto);
  }

  @Get('my-application')
  getMyApplication(@Req() req: any) {
    return this.tutorsService.getMyApplication(req.user.id);
  }

  @Roles('TUTOR')
  @Get('leads')
  getLeads(@Req() req: any) {
    return this.tutorsService.getLeadsForTutor(req.user.id);
  }

  @Roles('TUTOR')
  @Get('bookings')
  getBookings(@Req() req: any) {
    return this.tutorsService.getMyBookings(req.user.id);
  }

  @Roles('TUTOR')
  @Get('earnings')
  getEarnings(@Req() req: any) {
    return this.tutorsService.getEarningsSummary(req.user.id);
  }

  @Public()
  @Get('all')
  getAllTutors() {
    return this.tutorsService.getAllTutors();
  }

  @Public()
  @Get('profile/:id')
  getPublicProfile(@Req() req: any) {
    return this.tutorsService.getPublicProfile(req.params.id);
  }

  @Roles('TUTOR')
  @Get('me/profile')
  getMyProfile(@Req() req: any) {
    return this.tutorsService.getMyProfile(req.user.id);
  }

  @Roles('TUTOR')
  @Patch('me/profile')
  updateMyProfile(
    @Req() req: any,
    @Body() body: { bio?: string; priceMinEGP?: number; priceMaxEGP?: number; teachingMode?: 'ONLINE' | 'IN_PERSON' | 'BOTH' },
  ) {
    return this.tutorsService.updateMyProfile(req.user.id, body);
  }

  @Roles('TUTOR')
  @Put('me/subjects')
  updateMySubjects(
    @Req() req: any,
    @Body() body: { subjectIds?: string[]; subjects?: string[] },
  ) {
    const list = body.subjects || body.subjectIds || [];
    return this.tutorsService.updateMySubjects(req.user.id, list);
  }

  @Roles('TUTOR')
  @Get('reviews')
  getMyReviews(@Req() req: any) {
    return this.tutorsService.getMyReviews(req.user.id);
  }
}
