-- Prisma's current payout model uses accountDetails; keep the legacy column nullable.
ALTER TABLE "PayoutRequest"
ALTER COLUMN "paymentAccount" DROP NOT NULL;
