-- AlterTable
ALTER TABLE "User" ADD COLUMN     "managedByComplaintManagerId" TEXT,
ADD COLUMN     "managedByServiceManagerId" TEXT,
ADD COLUMN     "passwordChangedOnFirstLogin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tempPasswordExpiration" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "importedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "importedCount" INTEGER NOT NULL,
    "skippedCount" INTEGER NOT NULL,
    "failedCount" INTEGER NOT NULL,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportBatch_importedById_createdAt_idx" ON "ImportBatch"("importedById", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managedByServiceManagerId_fkey" FOREIGN KEY ("managedByServiceManagerId") REFERENCES "ServiceManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managedByComplaintManagerId_fkey" FOREIGN KEY ("managedByComplaintManagerId") REFERENCES "ComplaintManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_importedById_fkey" FOREIGN KEY ("importedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
