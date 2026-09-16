import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  PayoutStatus,
  RequestStatus,
  RoleName,
  TeachingMode,
  TutorApplicationStatus,
  WorkshopStatus,
} from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { SettingsService } from './settings.service';

@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private settingsService: SettingsService,
  ) {}

  @Get('stats')
  getStats() {
    return this.adminService.getOverviewStats();
  }

  // ------------------------------------------------------------
  // Teacher Applications
  // ------------------------------------------------------------
  @Get('tutor-applications')
  getTutorApplications(@Query('status') status?: TutorApplicationStatus) {
    return this.adminService.getTutorApplications(status);
  }

  @Patch('tutor-applications/:id/status')
  reviewTutorApplication(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: { status: TutorApplicationStatus; adminNotes?: string },
  ) {
    return this.adminService.reviewTutorApplication(id, req.user.id, dto);
  }

  // ------------------------------------------------------------
  // Featured Items (Home Page)
  // ------------------------------------------------------------
  @Patch('tutors/:id/feature')
  toggleFeaturedTutor(
    @Param('id') tutorId: string,
    @Body() dto: { isFeatured: boolean },
  ) {
    return this.adminService.toggleFeaturedTutor(tutorId, dto.isFeatured);
  }

  @Post('users/:id/tutor-profile')
  createTutorProfileForUser(
    @Param('id') userId: string,
    @Body() dto: {
      fullName?: string;
      bio?: string;
      priceMinEGP?: number | null;
      priceMaxEGP?: number | null;
      teachingMode?: TeachingMode;
      isFeaturedOnHome?: boolean;
    },
  ) {
    return this.adminService.createTutorProfileForUser(userId, dto);
  }

  @Patch('tutors/:id/profile')
  updateTutorProfile(
    @Param('id') tutorProfileId: string,
    @Body() dto: {
      fullName?: string;
      bio?: string;
      priceMinEGP?: number | null;
      priceMaxEGP?: number | null;
      teachingMode?: TeachingMode;
      isFeaturedOnHome?: boolean;
    },
  ) {
    return this.adminService.updateTutorProfile(tutorProfileId, dto);
  }

  @Delete('tutors/:id/profile')
  deleteTutorProfile(@Param('id') tutorProfileId: string) {
    return this.adminService.deleteTutorProfile(tutorProfileId);
  }

  @Patch('workshops/:id/feature')
  toggleFeaturedWorkshop(
    @Param('id') workshopId: string,
    @Body() dto: { isFeatured: boolean },
  ) {
    return this.adminService.toggleFeaturedWorkshop(workshopId, dto.isFeatured);
  }

  // ------------------------------------------------------------
  // All Student Requests
  // ------------------------------------------------------------
  @Get('requests')
  getAllRequests(
    @Query('status') status?: RequestStatus,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllRequests({ status, search });
  }

  @Patch('requests/:id/override-status')
  overrideRequestStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: { status: RequestStatus; reason?: string },
  ) {
    return this.adminService.overrideRequestStatus(
      id,
      req.user.id,
      dto.status,
      dto.reason,
    );
  }

  // ------------------------------------------------------------
  // Users & Permissions
  // ------------------------------------------------------------
  @Get('users')
  getUsers(
    @Query('search') search?: string,
    @Query('role') role?: RoleName,
  ) {
    return this.adminService.getUsers(search, role);
  }

  @Patch('users/:id/status')
  toggleUserActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.toggleUserActive(id, isActive);
  }

  @Post('users/:id/roles')
  grantRole(
    @Param('id') id: string,
    @Body('role') role: RoleName,
  ) {
    return this.adminService.grantUserRole(id, role);
  }

  @Patch('users/:id/roles/revoke')
  revokeRole(
    @Param('id') id: string,
    @Body('role') role: RoleName,
  ) {
    return this.adminService.revokeUserRole(id, role);
  }

  // ------------------------------------------------------------
  // Disputes
  // ------------------------------------------------------------
  @Get('disputes')
  getDisputes() {
    return this.adminService.getDisputedRequests();
  }

  @Post('disputes/:id/resolve')
  resolveDispute(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    dto: {
      resolution: 'REFUND_STUDENT' | 'PAYOUT_TUTOR' | 'SPLIT';
      adminNotes?: string;
    },
  ) {
    return this.adminService.resolveDispute(
      id,
      req.user.id,
      dto.resolution,
      dto.adminNotes,
    );
  }

  // ------------------------------------------------------------
  // Platform Settings
  // ------------------------------------------------------------
  @Get('settings/commission')
  async getCommission() {
    const commission = await this.settingsService.getNumber('COMMISSION_PERCENT');
    const inPersonSurcharge = await this.settingsService.getNumber('IN_PERSON_SURCHARGE_PCT');
    const locations = await this.settingsService.getLocations();
    return { commissionPercent: commission, inPersonSurchargePct: inPersonSurcharge, locations };
  }

  @Get('settings/locations')
  async getLocations() {
    return this.settingsService.getLocations();
  }

  @Put('settings/locations')
  async updateLocations(@Body() body: { locations: any[] }) {
    await this.settingsService.setLocations(body.locations || []);
    return { success: true, locations: body.locations };
  }

  @Put('settings')
  async updateSetting(
    @Body() dto: { key: string; value: string },
  ) {
    await this.settingsService.set(dto.key, dto.value);
    return { success: true, key: dto.key, value: dto.value };
  }


  // ------------------------------------------------------------
  // User Management
  // ------------------------------------------------------------
  @Patch('users/:id/info')
  editUserInfo(
    @Param('id') id: string,
    @Body() dto: { fullName?: string; phone?: string },
  ) {
    return this.adminService.editUserInfo(id, dto);
  }

  // ------------------------------------------------------------
  // Workshops Management
  // ------------------------------------------------------------
  @Get('workshops')
  getWorkshops(@Query('status') status?: WorkshopStatus) {
    return this.adminService.getWorkshops(status);
  }

  @Patch('workshops/:id/status')
  updateWorkshopStatus(
    @Param('id') id: string,
    @Body() dto: { status: WorkshopStatus }, // PENDING, APPROVED, REJECTED, PUBLISHED
  ) {
    return this.adminService.updateWorkshopStatus(id, dto.status);
  }

  @Post('workshops/:id/grant-free')
  grantFreeAccess(
    @Param('id') id: string,
    @Body() dto: { studentId: string },
    @Req() req: any,
  ) {
    return this.adminService.grantFreeAccess(id, dto.studentId, req.user.id);
  }

  // ------------------------------------------------------------
  // Payouts Management
  // ------------------------------------------------------------
  @Get('payouts')
  getPayouts() {
    return this.adminService.getPayouts();
  }

  @Patch('payouts/:id/status')
  updatePayoutStatus(
    @Param('id') id: string,
    @Body() dto: { status: PayoutStatus }, // PENDING, APPROVED, PAID, REJECTED
  ) {
    return this.adminService.updatePayoutStatus(id, dto.status);
  }

  // ------------------------------------------------------------
  // Invoices
  // ------------------------------------------------------------
  @Get('invoices')
  getAllInvoices() {
    return this.adminService.getAllInvoices();
  }

  // ------------------------------------------------------------
  // Session Payment Approvals
  // ------------------------------------------------------------
  @Patch('requests/:id/approve-payment')
  approveRequestPayment(@Req() req: any, @Param('id') id: string) {
    return this.adminService.approveRequestPayment(id, req.user.id);
  }

  @Patch('requests/:id/reject-payment')
  rejectRequestPayment(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.rejectRequestPayment(id, req.user.id, reason);
  }

  // ------------------------------------------------------------
  // Workshop Enrollment Approvals
  // ------------------------------------------------------------
  @Get('workshop-enrollments')
  getAllWorkshopEnrollments() {
    return this.adminService.getAllWorkshopEnrollments();
  }

  @Patch('workshop-enrollments/:id/approve')
  approveWorkshopEnrollment(@Param('id') id: string) {
    return this.adminService.approveWorkshopEnrollment(id);
  }

  @Patch('workshop-enrollments/:id/reject')
  rejectWorkshopEnrollment(@Param('id') id: string) {
    return this.adminService.rejectWorkshopEnrollment(id);
  }
}
