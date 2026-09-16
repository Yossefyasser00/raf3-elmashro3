-- Repair schema drift for tutor payout requests.
ALTER TABLE "PayoutRequest"
ADD COLUMN IF NOT EXISTS "accountDetails" TEXT NOT NULL DEFAULT '';
