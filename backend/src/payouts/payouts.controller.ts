import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayoutStatus } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PayoutsService } from './payouts.service';

@Controller('payouts')
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Roles('TUTOR')
  @Post()
  createRequest(
    @Req() req: any,
    @Body() body: { amountEGP: number; method: string; accountDetails: string },
  ) {
    return this.payoutsService.createPayoutRequest(req.user.id, body);
  }

  @Roles('TUTOR')
  @Get('my')
  getMyPayouts(@Req() req: any) {
    return this.payoutsService.findByTutor(req.user.id);
  }

  @Roles('ADMIN')
  @Get()
  getAllPayouts() {
    return this.payoutsService.findAll();
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: PayoutStatus) {
    return this.payoutsService.updateStatus(id, status);
  }
}
