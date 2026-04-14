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

export function createMisuseReportService({ prisma }) {
  const userDelegate = getDelegate(prisma, "user");
  const reportDelegate = getDelegate(prisma, "misuseReport");

  async function createReport({ reporterId, reporterRole, payload }) {
    if (!REPORTER_ROLES.includes(reporterRole)) {
      return { status: 403, body: { message: "Only Service Manager and Student Union can report students." } };
    }

    const reportedUserId = String(payload?.reportedUserId || "").trim();
    const reason = String(payload?.reason || "").trim();

    if (!reportedUserId || !reason) {
      return { status: 400, body: { message: "reportedUserId and reason are required." } };
    }

    if (!REASONS.includes(reason)) {
      return { status: 400, body: { message: "Invalid reason value." } };
    }

    if (reportedUserId === reporterId) {
      return { status: 400, body: { message: "You cannot report yourself." } };
    }

    const reportedUser = await userDelegate.findUnique({
      where: { id: reportedUserId },
      select: { id: true, role: true, status: true },
    });

    if (!reportedUser || reportedUser.role !== "STUDENT") {
      return { status: 400, body: { message: "Only students can be reported." } };
    }

    const report = await reportDelegate.create({
      data: {
        reporterId,
        reportedUserId,
        reason,
        details: payload?.details ? String(payload.details) : null,
        complaintId: payload?.complaintId ? String(payload.complaintId) : null,
        serviceRequestId: payload?.serviceRequestId ? String(payload.serviceRequestId) : null,
      },
      include: {
        reporter: { select: { id: true, name: true, role: true } },
        reportedUser: { select: { id: true, name: true, username: true, role: true, strikeCount: true } },
      },
    });

    return { status: 201, body: { message: "Report submitted.", report } };
  }

  async function listReports({ query }) {
    const status = query?.status ? String(query.status) : undefined;
    const reason = query?.reason ? String(query.reason) : undefined;
    const reportedUserId = query?.reportedUserId ? String(query.reportedUserId) : undefined;
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(reason ? { reason } : {}),
      ...(reportedUserId ? { reportedUserId } : {}),
    };

    const [total, items] = await prisma.$transaction([
      reportDelegate.count({ where }),
      reportDelegate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, name: true, role: true } },
          reportedUser: { select: { id: true, name: true, username: true, role: true, strikeCount: true, status: true } },
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
          },
        });
      }

      if (actionTaken === "TEMP_SUSPENSION") {
        const days = Math.max(Number(payload?.suspensionDays || 7), 1);
        const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        await tx.user.update({
          where: { id: report.reportedUserId },
          data: {
            status: "SUSPENDED",
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
            status: "SUSPENDED",
            isFlagged: true,
            lastSuspendedAt: reviewedAt,
            suspensionEndsAt: null,
            strikeCount: { increment: 1 },
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
