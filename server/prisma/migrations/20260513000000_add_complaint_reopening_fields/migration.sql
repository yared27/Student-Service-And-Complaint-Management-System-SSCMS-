-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN "canReopenUntil" TIMESTAMP(3),
ADD COLUMN "isReopened" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reopenedAt" TIMESTAMP(3);
