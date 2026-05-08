-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'SERVICE_MANAGER', 'STAFF', 'COMPLAINT_MANAGER', 'INVESTIGATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'WARNED', 'BANNED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('DORMITORY', 'CAFETERIA', 'ICT', 'LIBRARY', 'CLASSROOM', 'LABORATORY', 'UTILITIES', 'TRANSPORT');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ICT', 'DORMITORY', 'CAFETERIA', 'CLASSROOM', 'LIBRARY', 'LABORATORY', 'UTILITIES', 'TRANSPORT', 'CLINIC');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('SERVICE', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "ComplaintType" AS ENUM ('ACADEMIC', 'FOOD_SERVICE', 'DISCIPLINE', 'GENERAL_SERVICE', 'WOMEN_CASE', 'HEALTH_CASE', 'DISABILITY_CASE', 'SPORTS');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('PHASE_1', 'PHASE_2', 'PHASE_3');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('SUBMITTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MisuseReportReason" AS ENUM ('SPAM', 'ABUSIVE_LANGUAGE', 'FALSE_INFORMATION', 'DUPLICATE_SPAM', 'OTHER');

-- CreateEnum
CREATE TYPE "MisuseReportStatus" AS ENUM ('OPEN', 'REVIEWED', 'ACTION_TAKEN', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ActionTaken" AS ENUM ('NONE', 'WARNING', 'TEMP_SUSPENSION', 'PERMANENT_BAN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'COMPLAINT', 'SERVICE_REQUEST', 'MISUSE_REPORT');

-- CreateEnum
CREATE TYPE "ActivityEntityType" AS ENUM ('USER', 'COMPLAINT', 'SERVICE_REQUEST', 'MISUSE_REPORT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "role" "Role" NOT NULL,
    "category" "Category",
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "campus" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "phone" TEXT,
    "profileImage" TEXT,
    "strikeCount" INTEGER NOT NULL DEFAULT 0,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSuspendedAt" TIMESTAMP(3),
    "suspensionEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "category" "Category",

    CONSTRAINT "ServiceManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "complaintType" "ComplaintType" NOT NULL,
    "category" "Category",

    CONSTRAINT "ComplaintManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'SUBMITTED',
    "grievanceStatus" "GrievanceStatus" NOT NULL DEFAULT 'PHASE_1',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "complaintType" "ComplaintType" NOT NULL DEFAULT 'GENERAL_SERVICE',
    "category" "Category",
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "assignedComplaintManagerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "RequestType",
    "category" "Category",
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicateScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceType" "ServiceType" NOT NULL DEFAULT 'UTILITIES',
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "assignedServiceManagerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialRequest" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MisuseReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT NOT NULL,
    "reviewedById" TEXT,
    "complaintId" TEXT,
    "serviceRequestId" TEXT,
    "reason" "MisuseReportReason" NOT NULL,
    "details" TEXT,
    "status" "MisuseReportStatus" NOT NULL DEFAULT 'OPEN',
    "actionTaken" "ActionTaken" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "MisuseReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "route" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "targetUserId" TEXT,
    "complaintId" TEXT,
    "serviceRequestId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" "ActivityEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE INDEX "User_category_role_status_idx" ON "User"("category", "role", "status");

-- CreateIndex
CREATE INDEX "User_campus_department_idx" ON "User"("campus", "department");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceManager_userId_key" ON "ServiceManager"("userId");

-- CreateIndex
CREATE INDEX "ServiceManager_serviceType_idx" ON "ServiceManager"("serviceType");

-- CreateIndex
CREATE INDEX "ServiceManager_category_idx" ON "ServiceManager"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceManager_serviceType_key" ON "ServiceManager"("serviceType");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceManager_category_key" ON "ServiceManager"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintManager_userId_key" ON "ComplaintManager"("userId");

-- CreateIndex
CREATE INDEX "ComplaintManager_category_idx" ON "ComplaintManager"("category");

-- CreateIndex
CREATE INDEX "ComplaintManager_complaintType_idx" ON "ComplaintManager"("complaintType");

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintManager_complaintType_key" ON "ComplaintManager"("complaintType");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_revokedAt_expiresAt_idx" ON "RefreshToken"("userId", "revokedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_usedAt_expiresAt_idx" ON "PasswordResetToken"("userId", "usedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "Complaint_createdById_status_createdAt_idx" ON "Complaint"("createdById", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Complaint_assignedToId_status_idx" ON "Complaint"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "Complaint_complaintType_status_createdAt_idx" ON "Complaint"("complaintType", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Complaint_assignedComplaintManagerId_status_idx" ON "Complaint"("assignedComplaintManagerId", "status");

-- CreateIndex
CREATE INDEX "Complaint_category_status_createdAt_idx" ON "Complaint"("category", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ComplaintAttachment_complaintId_createdAt_idx" ON "ComplaintAttachment"("complaintId", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_createdById_status_createdAt_idx" ON "ServiceRequest"("createdById", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_assignedToId_status_idx" ON "ServiceRequest"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "ServiceRequest_serviceType_status_createdAt_idx" ON "ServiceRequest"("serviceType", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_assignedServiceManagerId_status_idx" ON "ServiceRequest"("assignedServiceManagerId", "status");

-- CreateIndex
CREATE INDEX "ServiceRequest_category_status_createdAt_idx" ON "ServiceRequest"("category", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MaterialRequest_serviceRequestId_status_createdAt_idx" ON "MaterialRequest"("serviceRequestId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MaterialRequest_requesterId_createdAt_idx" ON "MaterialRequest"("requesterId", "createdAt");

-- CreateIndex
CREATE INDEX "MaterialRequest_managerId_status_createdAt_idx" ON "MaterialRequest"("managerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MisuseReport_reportedUserId_status_createdAt_idx" ON "MisuseReport"("reportedUserId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MisuseReport_reporterId_createdAt_idx" ON "MisuseReport"("reporterId", "createdAt");

-- CreateIndex
CREATE INDEX "MisuseReport_complaintId_idx" ON "MisuseReport"("complaintId");

-- CreateIndex
CREATE INDEX "MisuseReport_serviceRequestId_idx" ON "MisuseReport"("serviceRequestId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_createdAt_idx" ON "ActivityLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_targetUserId_createdAt_idx" ON "ActivityLog"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_createdAt_idx" ON "ActivityLog"("entityType", "entityId", "createdAt");

-- AddForeignKey
ALTER TABLE "ServiceManager" ADD CONSTRAINT "ServiceManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintManager" ADD CONSTRAINT "ComplaintManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedComplaintManagerId_fkey" FOREIGN KEY ("assignedComplaintManagerId") REFERENCES "ComplaintManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintAttachment" ADD CONSTRAINT "ComplaintAttachment_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_assignedServiceManagerId_fkey" FOREIGN KEY ("assignedServiceManagerId") REFERENCES "ServiceManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequest" ADD CONSTRAINT "MaterialRequest_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequest" ADD CONSTRAINT "MaterialRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequest" ADD CONSTRAINT "MaterialRequest_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MisuseReport" ADD CONSTRAINT "MisuseReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MisuseReport" ADD CONSTRAINT "MisuseReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MisuseReport" ADD CONSTRAINT "MisuseReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MisuseReport" ADD CONSTRAINT "MisuseReport_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MisuseReport" ADD CONSTRAINT "MisuseReport_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
