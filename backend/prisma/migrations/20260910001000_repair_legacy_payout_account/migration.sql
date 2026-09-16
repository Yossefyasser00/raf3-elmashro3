-- Keep legacy payout schema compatible with the current accountDetails field.
ALTER TABLE "PayoutRequest"
ALTER COLUMN "paymentAccount" SET DEFAULT '';
