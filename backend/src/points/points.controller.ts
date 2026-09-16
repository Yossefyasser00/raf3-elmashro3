import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { PointsService } from './points.service';

@Controller('points')
export class PointsController {
  constructor(private pointsService: PointsService) {}

  @Roles('STUDENT')
  @Get('my')
  getMyPoints(@Req() req: any) {
    return this.pointsService.getMyPoints(req.user.id);
  }

  @Roles('STUDENT')
  @Post('redeem')
  redeemReward(
    @Req() req: any,
    @Body() dto: { rewardType: string; title?: string },
  ) {
    return this.pointsService.redeemReward(req.user.id, dto);
  }
}