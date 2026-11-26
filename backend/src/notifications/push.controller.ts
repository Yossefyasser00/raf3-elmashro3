import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PushService } from './push.service';

@Controller('push')
export class PushController {
  constructor(private pushService: PushService) {}

  /** GET /api/v1/push/vapid-key — public */
  @Public()
  @Get('vapid-key')
  getVapidKey() {
    return { publicKey: this.pushService.getVapidPublicKey() };
  }

  /** GET /api/v1/push/reminders — check & trigger session reminders */
  @Public()
  @Get('reminders')
  async triggerReminders() {
    await this.pushService.checkAndSendSessionReminders();
    return { ok: true };
  }

  /** GET /api/v1/push/my — get user's in-app notifications */
  @Get('my')
  getMyNotifications(@Req() req: any) {
    return this.pushService.getUserNotifications(req.user.id);
  }

  /** POST /api/v1/push/read-all — mark all notifications read */
  @Post('read-all')
  markAllAsRead(@Req() req: any) {
    return this.pushService.markAllAsRead(req.user.id);
  }

  /** POST /api/v1/push/:id/read — mark one notification read */
  @Post(':id/read')
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.pushService.markAsRead(req.user.id, id);
  }

  /** POST /api/v1/push/subscribe — authenticated */
  @Post('subscribe')
  subscribe(@Req() req: any, @Body() body: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.pushService.subscribe(req.user.id, body);
  }

  /** DELETE /api/v1/push/unsubscribe — authenticated */
  @Delete('unsubscribe')
  unsubscribe(@Body('endpoint') endpoint: string) {
    return this.pushService.unsubscribe(endpoint);
  }
}
