const REPORTER_ROLES = ["SERVICE_MANAGER", "COMPLAINT_MANAGER"];
const REVIEWER_ROLES = ["SERVICE_MANAGER", "COMPLAINT_MANAGER", "ADMIN"];
const REASONS = ["SPAM", "ABUSIVE_LANGUAGE", "FALSE_INFORMATION", "DUPLICATE_SPAM", "OTHER"];
const REVIEW_STATUSES = ["REVIEWED", "ACTION_TAKEN", "DISMISSED"];
const ACTIONS = ["NONE", "WARNING", "TEMP_SUSPENSION", "PERMANENT_BAN"];

function getDelegate(prisma, key) {
  const delegate = prisma?.[key] ?? prisma?.$parent?.[key];
  if (!delegate) {
    throw new Error(`Prisma delegate not found: ${key}`);
  }
  return delegate;
}

function buildStudentRoute(report) {
  if (report?.complaintId) {
    return `/student/submission/${report.complaintId}`;
  }

  if (report?.serviceRequestId) {
    return `/student/submission/${report.serviceRequestId}`;
  }

  return "/student/dashboard";
}

export function createMisuseReportService({ prisma }) {
  const userDelegate = getDelegate(prisma, "user");
  const reportDelegate = getDelegate(prisma, "misuseReport");

  async function resolveReportedUser(identifier) {
    const cleanIdentifier = String(identifier || "").trim();
    if (!cleanIdentifier) {
      return null;
    }

    return userDelegate.findFirst({
      where: {
        OR: [{ id: cleanIdentifier }, { username: cleanIdentifier }],
      },
      select: { id: true, role: true, status: true, username: true },
    });
  }

  async function createReport({ reporterId, reporterUsername, reporterRole, payload }) {
    if (!REPORTER_ROLES.includes(reporterRole)) {
      return { status: 403, body: { message: "Only Service Manager and Student Union can report students." } };
    }

    const reportedUserInput = String(payload?.reportedUserId || payload?.studentId || "").trim();
    const rawReason = String(payload?.reason || "").trim();
    const normalizedReason = rawReason.toUpperCase();
    const reason = REASONS.includes(normalizedReason) ? normalizedReason : "OTHER";

    if (!reportedUserInput || !rawReason) {
      return { status: 400, body: { message: "studentId (or reportedUserId) and reason are required." } };
    }

    if (reportedUserInput === reporterId || reportedUserInput === reporterUsername) {
      return { status: 400, body: { message: "You cannot report yourself." } };
    }

    const reportedUser = await resolveReportedUser(reportedUserInput);

    if (!reportedUser || reportedUser.role !== "STUDENT") {
      return { status: 400, body: { message: "Only students can be reported." } };
    }

    if (reportedUser.id === reporterId || reportedUser.username === reporterUsername) {
      return { status: 400, body: { message: "You cannot report yourself." } };
    }

    const report = await reportDelegate.create({
      data: {
        reporterId,
        reportedUserId: reportedUser.id,
        reason,
        details: payload?.details
          ? String(payload.details)
          : !REASONS.includes(normalizedReason)
            ? `Original reason: ${rawReason}`
            : null,
        complaintId: payload?.complaintId ? String(payload.complaintId) : null,
        serviceRequestId: payload?.serviceRequestId ? String(payload.serviceRequestId) : null,
      },
      include: {
        reporter: { select: { id: true, name: true, role: true } },
        reportedUser: { select: { id: true, name: true, username: true, role: true, strikeCount: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: reportedUser.id,
        type: "SYSTEM",
        title: "Disciplinary report filed",
        message: `A report was filed against your account for ${reason.toLowerCase().replaceAll("_", " ")}.`,
      },
    });

    return { status: 201, body: { message: "Report submitted.", report } };
  }

  async function listReports({ query, user }) {
    const status = query?.status ? String(query.status) : undefined;
    const reason = query?.reason ? String(query.reason) : undefined;
    const reportedUserId = query?.reportedUserId ? String(query.reportedUserId) : undefined;
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    // Base filters
    const baseWhere = {
      ...(status ? { status } : {}),
      ...(reason ? { reason } : {}),
      ...(reportedUserId ? { reportedUserId } : {}),
    };

    // Role-based category filtering: for SERVICE_MANAGER and COMPLAINT_MANAGER, restrict to reports linked
    // to complaints or service requests that match the manager's category.
    let where = { ...baseWhere };
    if (user && (user.role === "SERVICE_MANAGER" || user.role === "COMPLAINT_MANAGER")) {
      const cat = user.category;
      where = {
        AND: [
          baseWhere,
          {
            OR: [
              { complaint: { is: { category: cat } } },
              { serviceRequest: { is: { category: cat } } },
            ],
          },
        ],
      };
    }

    const [total, items] = await prisma.$transaction([
      reportDelegate.count({ where }),
      reportDelegate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, name: true, role: true } },
          // Always include student identity fields (username used for studentId login)
          reportedUser: { select: { id: true, name: true, username: true, email: true, role: true, strikeCount: true, status: true } },
          reviewedBy: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    return {
      status: 200,
      body: {
        total,
        page,
        limit,
        items,
      },
    };
  }

  async function reviewReport({ reviewerId, reviewerRole, reportId, payload }) {
    if (!REVIEWER_ROLES.includes(reviewerRole)) {
      return { status: 403, body: { message: "Only Service Manager, Student Union, or Admin can review reports." } };
    }

    const status = String(payload?.status || "").trim();
    const actionTaken = String(payload?.actionTaken || "NONE").trim();

    if (!status) {
      return { status: 400, body: { message: "status is required." } };
    }

    if (!REVIEW_STATUSES.includes(status)) {
      return { status: 400, body: { message: "Invalid review status." } };
    }

    if (!ACTIONS.includes(actionTaken)) {
      return { status: 400, body: { message: "Invalid actionTaken value." } };
    }

    const report = await reportDelegate.findUnique({
      where: { id: reportId },
      select: { id: true, reportedUserId: true, status: true },
    });

    if (!report) {
      return { status: 404, body: { message: "Report not found." } };
    }

    const reviewedAt = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updatedReport = await tx.misuseReport.update({
        where: { id: reportId },
        data: {
          status,
          actionTaken,
          reviewedById: reviewerId,
          reviewedAt,
          details: payload?.details ? String(payload.details) : undefined,
        },
      });

      if (actionTaken === "WARNING") {
        await tx.user.update({
          where: { id: report.reportedUserId },
          data: {
            strikeCount: { increment: 1 },
            isFlagged: true,
            status: "WARNED",
          },
        });
      }

      if (actionTaken === "TEMP_SUSPENSION") {
        const days = Math.max(Number(payload?.suspensionDays || 7), 1);
        const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        await tx.user.update({
          where: { id: report.reportedUserId },
          data: {
            status: "BANNED",
            isFlagged: true,
            lastSuspendedAt: reviewedAt,
            suspensionEndsAt: until,
            strikeCount: { increment: 1 },
          },
        });
      }

      if (actionTaken === "PERMANENT_BAN") {
        await tx.user.update({
          where: { id: report.reportedUserId },
          data: {
            status: "BANNED",
            isFlagged: true,
            lastSuspendedAt: reviewedAt,
            suspensionEndsAt: null,
            strikeCount: { increment: 1 },
          },
        });
      }

      if (actionTaken !== "NONE") {
        await tx.notification.create({
          data: {
            userId: report.reportedUserId,
            type: "SYSTEM",
            title: actionTaken === "WARNING" ? "Account warning issued" : "Account banned",
            message: actionTaken === "WARNING" ? "Your account has been warned." : "Your account has been banned.",
          },
        });
      }

      return updatedReport;
    });

    return {
      status: 200,
      body: {
        message: "Report reviewed successfully.",
        report: result,
      },
    };
  }

  return {
    createReport,
    listReports,
    reviewReport,
  };
}
