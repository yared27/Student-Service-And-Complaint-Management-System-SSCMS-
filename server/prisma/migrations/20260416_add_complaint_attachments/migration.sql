-- CreateTable
CREATE TABLE "ComplaintAttachment" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "bytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplaintAttachment_complaintId_createdAt_idx" ON "ComplaintAttachment"("complaintId", "createdAt");

-- AddForeignKey
ALTER TABLE "ComplaintAttachment" ADD CONSTRAINT "ComplaintAttachment_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
