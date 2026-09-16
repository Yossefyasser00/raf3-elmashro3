import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

const DEFAULTS: Record<string, string> = {
  COMMISSION_PERCENT: '20',        // platform keeps 20% by default
  IN_PERSON_SURCHARGE_PCT: '10',   // in-person sessions priced 10% higher
  IN_PERSON_LOCATIONS: JSON.stringify([
    {
      id: 'loc-1',
      name: 'مقر فك زنقة التعليمي — المنصورة (بجوار كلية هندسة)',
      address: 'شارع جيهان، المنصورة',
      details: 'قاعات مكيفة ومجهزة بالسبورات الذكية وواي فاي سريع',
      isActive: true,
    },
    {
      id: 'loc-2',
      name: 'مساحة عمل كروان (Karawan Workspace) — حي الجامعة',
      address: 'أمام بوابة جامعة المنصورة الرئيسية',
      details: 'غرف دراسة هادئة وخدمة مشروبات',
      isActive: true,
    },
    {
      id: 'loc-3',
      name: 'مساحة دافنشي الأكاديمية — بجوار كلية الطب',
      address: 'شارع كلية الآداب، المنصورة',
      details: 'بيئة دراسية مريحة ومناسبة للمذاكرة الجماعية',
      isActive: true,
    },
    {
      id: 'loc-4',
      name: 'ساحة المذاكرة المعتمدة — الحرم الجامعي',
      address: 'داخل مجمع كليات جامعة المنصورة',
      details: 'مكان معتمد ومجاني مخصص لطلاب الجامعة',
      isActive: true,
    },
  ]),
};

// All "business knobs" (commission %, surcharge %, etc.) are read
// through here — never hard-coded — so admins change them from the
// dashboard without a deploy. Values are cached in Redis in production
// (see infra notes in README); this in-memory fallback keeps local
// dev simple.
@Injectable()
export class SettingsService {
  private cache = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  async get(key: string): Promise<string> {
    if (this.cache.has(key)) return this.cache.get(key)!;

    const row = await this.prisma.platformSetting.findUnique({ where: { key } });
    const value = row?.value ?? DEFAULTS[key];
    if (value === undefined) throw new Error(`Unknown setting key: ${key}`);

    this.cache.set(key, value);
    return value;
  }

  async getNumber(key: string): Promise<number> {
    return Number(await this.get(key));
  }

  async set(key: string, value: string) {
    await this.prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    this.cache.set(key, value);
  }

  async getLocations(): Promise<Array<{ id: string; name: string; address: string; details?: string; isActive: boolean }>> {
    try {
      const raw = await this.get('IN_PERSON_LOCATIONS');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return JSON.parse(DEFAULTS.IN_PERSON_LOCATIONS);
    } catch {
      return JSON.parse(DEFAULTS.IN_PERSON_LOCATIONS);
    }
  }

  async setLocations(locations: any[]) {
    await this.set('IN_PERSON_LOCATIONS', JSON.stringify(locations));
  }

  // Student pays 200 EGP, commission 20% → tutor gets 170, platform keeps 30.
  async splitPayment(amountEGP: number) {
    const commissionPct = await this.getNumber('COMMISSION_PERCENT');
    const platformFeeEGP = Math.round((amountEGP * commissionPct) / 100);
    const tutorEarningsEGP = amountEGP - platformFeeEGP;
    return { platformFeeEGP, tutorEarningsEGP };
  }
}
