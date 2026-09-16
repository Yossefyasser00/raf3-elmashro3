import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  /** Returns true if Gmail credentials are configured in env */
  get isConfigured(): boolean {
    return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
  }

  async sendOtp(to: string, otpCode: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        `[DEV MODE] GMAIL_USER not set — OTP for ${to}: ${otpCode}`,
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"منصة مَعْشَرو" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'رمز التحقق لاستعادة كلمة المرور',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 16px; border: 1px solid #eee;">
          <h2 style="color: #e05252; margin-bottom: 8px;">استعادة كلمة المرور</h2>
          <p style="color: #555; margin-bottom: 24px;">استخدم رمز التحقق التالي لإعادة تعيين كلمة مرورك:</p>
          <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; text-align: center; padding: 20px; background: #fff5f5; border-radius: 12px; color: #e05252; margin-bottom: 24px;">
            ${otpCode}
          </div>
          <p style="color: #888; font-size: 13px;">الرمز صالح لمدة <strong>10 دقائق</strong> فقط ولا يمكن إعادة استخدامه.</p>
          <p style="color: #888; font-size: 13px;">إذا لم تطلب هذا، تجاهل هذا البريد.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #bbb; font-size: 12px; text-align: center;">منصة مَعْشَرو © ${new Date().getFullYear()}</p>
        </div>
      `,
    });

    this.logger.log(`OTP email sent to ${to}`);
  }
}
