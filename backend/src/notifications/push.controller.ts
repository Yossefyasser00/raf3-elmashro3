import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
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
