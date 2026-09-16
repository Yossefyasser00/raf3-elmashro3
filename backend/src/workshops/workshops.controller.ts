import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkshopStatus } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { WorkshopsService } from './workshops.service';
import { Public } from '../common/decorators/public.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('workshops')
export class WorkshopsController {
  constructor(private workshopsService: WorkshopsService) {}

  @Public()
  @Get('featured')
  getFeaturedWorkshops() {
    return this.workshopsService.getFeaturedWorkshops();
  }

  @Public()
  @Get('public')
  getAllPublicWorkshops() {
    return this.workshopsService.getAllPublicWorkshops();
  }

  @Roles('TUTOR', 'ADMIN')
  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.workshopsService.create(req.user.id, body);
  }

  @Roles('TUTOR', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.workshopsService.updateWorkshop(id, body, req.user.id, req.user.roles?.includes('ADMIN'));
  }

  @Roles('TUTOR')
  @Get('my')
  getMyWorkshops(@Req() req: any) {
    return this.workshopsService.findByTutor(req.user.id);
  }

  @Roles('ADMIN')
  @Get()
  getAll(@Query('status') status?: WorkshopStatus) {
    return this.workshopsService.findAll(status);
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: WorkshopStatus) {
    return this.workshopsService.updateStatus(id, status);
  }

  @Roles('ADMIN')
  @Post(':id/grant-free')
  grantFree(
    @Param('id') workshopId: string,
    @Body('studentId') studentId: string,
    @Req() req: any,
  ) {
    return this.workshopsService.grantFreeAccess(workshopId, studentId, req.user.id);
  }

  /**
   * POST /api/v1/workshops/:id/upload-video
   * Upload a workshop video (and optional thumbnail) to YouTube as a private video.
   * Accepts multipart/form-data with fields: `video` (required) and `thumbnail` (optional).
   */
  @Roles('ADMIN')
  @Post(':id/upload-video')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async uploadVideo(
    @Param('id') workshopId: string,
    @UploadedFiles() files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
  ) {
    const videoFile = files?.video?.[0];
    if (!videoFile) {
      throw new BadRequestException('Video file is required');
    }

    const thumbnailFile = files?.thumbnail?.[0];

    return this.workshopsService.uploadWorkshopVideo(
      workshopId,
      videoFile.buffer,
      videoFile.mimetype,
      thumbnailFile?.buffer,
      thumbnailFile?.mimetype,
    );
  }

  // Student: list workshops I enrolled in (for invoices)
  @Get('my-enrollments')
  getMyEnrollments(@Req() req: any) {
    return this.workshopsService.getMyEnrollments(req.user.id);
  }

  // Tutor: list enrollments in my workshops (for invoices)
  @Roles('TUTOR')
  @Get('tutor-enrollments')
  getEnrollmentsForTutor(@Req() req: any) {
    return this.workshopsService.getEnrollmentsForTutor(req.user.id);
  }

  // Student: Enroll / Pay for workshop (persists in DB)
  @Post(':id/enroll')
  enrollWorkshop(
    @Req() req: any,
    @Param('id') id: string,
    @Body('paidWithPoints') paidWithPoints?: boolean,
  ) {
    return this.workshopsService.enrollWorkshop(id, req.user.id, paidWithPoints ?? false);
  }

  @Post(':id/pay')
  payWorkshop(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.workshopsService.enrollWorkshop(id, req.user.id, false);
  }
}
