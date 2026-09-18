import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, TeachingMode, TutorApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../config/prisma.service';
import { MailService } from '../common/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 30;
const PASSWORD_RESET_TTL_MINUTES = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existingPhone) throw new ConflictException('Phone already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
          phone: dto.phone ?? null,
          roles: { create: [{ role: dto.initialRole }] },
          ...(dto.initialRole === 'STUDENT'
            ? {
                studentProfile: {
                  create: {
                    ...(dto.collegeCardFileName ? { collegeCardFileName: dto.collegeCardFileName } : {}),
                    ...(dto.gradeLevel ? { gradeLevel: dto.gradeLevel } : {}),
                  },
                },
              }
            : dto.initialRole === 'TUTOR'
              ? {
                  tutorProfile: {
                    create: {
                      bio: dto.gradeLevel || 'مدرس مسجل بانتظار اعتماد الإدارة',
                      isVerified: false,
                      rankingScore: 80,
                      ratingAvg: 5.0,
                    },
                  },
                  tutorApplications: {
                    create: {
                      universityName: 'جامعة المنصورة',
                      facultyName: 'كلية الهندسة / العلوم',
                      experienceSummary: dto.gradeLevel || 'طلب انضمام جديد كمدرس',
                      preferredMode: TeachingMode.BOTH,
                      status: TutorApplicationStatus.PENDING,
                    },
                  },
                }
              : {}),
        },
        include: { roles: true },
      });

      return this.issueTokens(
        user.id,
        user.email,
        user.roles.map((r) => r.role),
        user.fullName,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email or phone already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const identifier = dto.email?.trim();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: { roles: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(
      user.id,
      user.email,
      user.roles.map((r) => r.role),
      user.fullName,
    );
  }

  async refresh(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    // Rotate: revoke the used token and issue a brand new pair.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: stored.userId },
      include: { roles: true },
    });

    return this.issueTokens(
      user.id,
      user.email,
      user.roles.map((r) => r.role),
      user.fullName,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASSWORD RESET  (OTP stored in DB — safe on serverless / Vercel)
  // ─────────────────────────────────────────────────────────────────────────

  async requestPasswordReset(identifier: string) {
    const normalizedIdentifier = identifier?.trim();
    if (!normalizedIdentifier) {
      throw new UnauthorizedException('يرجى كتابة البريد الإلكتروني أو رقم الهاتف');
    }

    const user = await this.findUserByIdentifier(normalizedIdentifier);

    // Always return a generic message to avoid leaking whether the account exists.
    if (!user) {
      return {
        message: 'إذا كان الحساب موجودًا، سيتم إرسال رمز التحقق إلى البريد أو الهاتف المسجل.',
      };
    }

    const rawCode = this.generateOtpCode();
    const codeHash = this.hashToken(rawCode);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

    // Upsert: replace any existing token for this user (one active OTP at a time).
    await this.prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { codeHash, expiresAt, createdAt: new Date() },
      create: { userId: user.id, codeHash, expiresAt },
    });

    const destination = user.email || user.phone || 'حسابك';
    const isEmailDestination = !!user.email;

    // Production: Gmail configured → send real email, hide OTP from response.
    if (isEmailDestination && this.mail.isConfigured) {
      await this.mail.sendOtp(user.email, rawCode);
      return {
        message: `تم إرسال رمز التحقق إلى ${destination}. تحقق من صندوق الوارد والبريد المزعج.`,
        expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
      };
    }

    // Development: no Gmail config → return OTP in response for local testing.
    if (isEmailDestination) {
      await this.mail.sendOtp(user.email, rawCode).catch(() => null);
    } else {
      console.warn(`[DEV] OTP for phone user ${destination}: ${rawCode}`);
    }

    return {
      message: 'تم إرسال رمز التحقق بنجاح.',
      otpCode: rawCode,
      expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
      destination,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const normalizedIdentifier = dto.identifier?.trim();
    const normalizedOtpCode = dto.otpCode?.trim();

    if (!normalizedIdentifier || !normalizedOtpCode || !dto.newPassword) {
      throw new UnauthorizedException('يرجى ملء جميع الحقول');
    }

    if (dto.newPassword.length < 8) {
      throw new UnauthorizedException('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
    }

    const user = await this.findUserByIdentifier(normalizedIdentifier);
    if (!user) {
      throw new UnauthorizedException('الحساب غير موجود');
    }

    // Load the stored token from DB.
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { userId: user.id },
    });

    if (!stored) {
      throw new UnauthorizedException('لم يتم طلب إعادة تعيين كلمة المرور لهذا الحساب');
    }

    if (stored.expiresAt < new Date()) {
      // Clean up expired token.
      await this.prisma.passwordResetToken.delete({ where: { userId: user.id } });
      throw new UnauthorizedException('انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد');
    }

    const inputHash = this.hashToken(normalizedOtpCode);
    if (stored.codeHash !== inputHash) {
      throw new UnauthorizedException('رمز التحقق غير صحيح');
    }

    // All checks passed — update password and delete the token (no reuse).
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      // Invalidate immediately — cannot be reused.
      this.prisma.passwordResetToken.delete({ where: { userId: user.id } }),
    ]);

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private async issueTokens(
    userId: string,
    email: string,
    roles: string[],
    fullName?: string,
  ) {
    const accessToken = this.jwt.sign(
      { sub: userId, email, roles },
      { secret: process.env.JWT_ACCESS_SECRET || 'fokzanqa-fallback-access-secret-2026', expiresIn: ACCESS_TOKEN_TTL },
    );

    const rawRefreshToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken: rawRefreshToken, roles, fullName };
  }

  private hashToken(token: string) {
    // Tokens/OTPs stored as SHA-256 hashes — never plaintext.
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateOtpCode() {
    return crypto.randomInt(100000, 1000000).toString().padStart(6, '0');
  }

  private async findUserByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier.toLowerCase(), mode: 'insensitive' } },
          { phone: { equals: identifier, mode: 'insensitive' } },
        ],
      },
    });
  }
}
