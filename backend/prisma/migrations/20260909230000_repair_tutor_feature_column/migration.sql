-- Repair schema drift from the partially applied home-feature migration.
ALTER TABLE "TutorProfile"
ADD COLUMN IF NOT EXISTS "isFeaturedOnHome" BOOLEAN NOT NULL DEFAULT false;
