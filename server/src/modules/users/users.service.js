import bcrypt from "bcrypt";

const ROLE_VALUES = new Set(["STUDENT", "SERVICE_MANAGER", "STAFF", "COMPLAINT_MANAGER", "INVESTIGATOR", "ADMIN"]);
const STATUS_VALUES = new Set(["ACTIVE", "WARNED", "BANNED"]);
const SERVICE_TYPE_VALUES = new Set(["DORMITORY", "CAFETERIA", "ICT", "LIBRARY", "CLASSROOM", "LABORATORY", "UTILITIES", "TRANSPORT"]);
const COMPLAINT_TYPE_VALUES = new Set(["ACADEMIC", "ADMINISTRATIVE", "DORMITORY", "CAFETERIA", "DISCIPLINARY", "HEALTH", "SECURITY"]);

function normalizeRole(raw) {
  const normalized = String(raw || "").trim().toUpperCase();
  if (normalized === "FIELD_STAFF") {
    return "STAFF";
  }

  return normalized;
}

function normalizeStatus(raw) {
  const normalized = String(raw || "").trim().toUpperCase();
  if (normalized === "INACTIVE" || normalized === "SUSPENDED") {
    return "BANNED";
  }

  return normalized;
}

function normalizeServiceType(raw) {
  return String(raw || "").trim().toUpperCase();
}

function normalizeComplaintType(raw) {
  return String(raw || "").trim().toUpperCase();
}

function normalizeModerationAction(raw) {
  const action = String(raw || "").trim().toUpperCase();

  if (action === "WARN" || action === "WARNING") {
    return "WARNING";
  }

  if (action === "BAN" || action === "PERMANENT_BAN") {
    return "PERMANENT_BAN";
  }

  return null;
}

function toBooleanOrUndefined(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const text = String(value).trim().toLowerCase();
  if (["true", "1", "yes"].includes(text)) {
    return true;
  }

  if (["false", "0", "no"].includes(text)) {
    return false;
  }

  return undefined;
}

function toAdminUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    campus: user.campus,
    department: user.department,
    strikeCount: user.strikeCount,
    isFlagged: user.isFlagged,
    isActive: user.isActive,
    createdAt: user.createdAt,
    serviceType: user.serviceManagerProfile?.serviceType || null,
    complaintType: user.complaintManagerProfile?.complaintType || null,
  };
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\n") || text.includes("\"")) {
    return `"${text.replace(/\"/g, '""')}"`;
  }

  return text;
}

function generateUsername(name, email) {
  const baseFromEmail = String(email || "").split("@")[0].trim().toLowerCase();
  const baseFromName = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

  const base = baseFromEmail || baseFromName || "user";
  return `${base}.${Date.now().toString().slice(-5)}`.toUpperCase();
}

function isWarnedStatusUnsupported(error) {
  const text = String(error?.message || "").toUpperCase();
  return text.includes("USERSTATUS") && text.includes("WARNED") && text.includes("INVALID INPUT VALUE FOR ENUM");
}

async function countUsersByStatusText(prisma, statusValues) {
  const normalized = Array.isArray(statusValues)
    ? statusValues.map((value) => String(value || "").toUpperCase()).filter(Boolean)
    : [String(statusValues || "").toUpperCase()].filter(Boolean);

  if (!normalized.length) {
    return 0;
  }

  let total = 0;

  for (const status of normalized) {
    const rows = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS count
      FROM "User"
      WHERE status::text = ${status}
    `;

    total += Number(rows?.[0]?.count || 0);
  }

  return total;
}

async function syncManagerProfiles(tx, { userId, role, serviceType, complaintType }) {
  if (role === "SERVICE_MANAGER") {
    if (!serviceType || !SERVICE_TYPE_VALUES.has(serviceType)) {
      return { status: 400, message: "serviceType is required for SERVICE_MANAGER." };
    }

    const serviceConflict = await tx.serviceManager.findFirst({
      where: {
        serviceType,
        NOT: { userId },
      },
      select: { id: true },
    });

    if (serviceConflict) {
      return { status: 409, message: "serviceType already assigned to another service manager." };
    }

    await tx.serviceManager.upsert({
      where: { userId },
      update: { serviceType },
      create: { userId, serviceType },
    });

    await tx.complaintManager.deleteMany({ where: { userId } });
    return null;
  }

  if (role === "COMPLAINT_MANAGER") {
    if (!complaintType || !COMPLAINT_TYPE_VALUES.has(complaintType)) {
      return { status: 400, message: "complaintType is required for COMPLAINT_MANAGER." };
    }

    const complaintConflict = await tx.complaintManager.findFirst({
      where: {
        complaintType,
        NOT: { userId },
      },
      select: { id: true },
    });

    if (complaintConflict) {
      return { status: 409, message: "complaintType already assigned to another complaint manager." };
    }

    await tx.complaintManager.upsert({
      where: { userId },
      update: { complaintType },
      create: { userId, complaintType },
    });

    await tx.serviceManager.deleteMany({ where: { userId } });
    return null;
  }

  await tx.serviceManager.deleteMany({ where: { userId } });
  await tx.complaintManager.deleteMany({ where: { userId } });
  return null;
}

export function createUsersService({ prisma }) {
  async function getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        campus: true,
        department: true,
        phone: true,
        profileImage: true,
        strikeCount: true,
        isFlagged: true,
        suspensionEndsAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { status: 404, body: { message: "User not found." } };
    }

    return { status: 200, body: { user } };
  }

  async function updateMe(userId, payload) {
    const data = {
      name: payload?.name ? String(payload.name).trim() : undefined,
      phone: payload?.phone !== undefined ? String(payload.phone).trim() || null : undefined,
      profileImage: payload?.profileImage !== undefined ? String(payload.profileImage).trim() || null : undefined,
      department: payload?.department ? String(payload.department).trim() : undefined,
    };

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        campus: true,
        department: true,
        phone: true,
        profileImage: true,
      },
    });

    return {
      status: 200,
      body: {
        message: "Profile updated.",
        user: updated,
      },
    };
  }

  async function listUsers(query) {
    const role = query?.role ? String(query.role) : undefined;
    const status = query?.status ? String(query.status) : undefined;
    const search = query?.search ? String(query.search).trim() : undefined;
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const where = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          status: true,
          campus: true,
          department: true,
          strikeCount: true,
          isFlagged: true,
          createdAt: true,
        },
      }),
    ]);

    return { status: 200, body: { total, page, limit, items } };
  }

  async function listAdminUsers(query) {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        campus: true,
        department: true,
        strikeCount: true,
        isFlagged: true,
        createdAt: true,
        serviceManagerProfile: { select: { serviceType: true } },
        complaintManagerProfile: { select: { complaintType: true } },
      },
    });

    return { status: 200, body: users.map(toAdminUser) };
  }

  async function listAdminReports(query) {
    const status = query?.status ? String(query.status).toUpperCase() : undefined;
    const reason = query?.reason ? String(query.reason).toUpperCase() : undefined;
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(reason ? { reason } : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.misuseReport.count({ where }),
      prisma.misuseReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, name: true, role: true } },
          reportedUser: { select: { id: true, name: true, username: true, role: true, status: true, campus: true, department: true } },
          reviewedBy: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    return {
      status: 200,
      body: { total, page, limit, items },
    };
  }

  async function moderateAdminReport(reportId, payload) {
    const actionTaken = normalizeModerationAction(payload?.actionTaken || payload?.action);
    const status = String(payload?.status || "ACTION_TAKEN").trim().toUpperCase();

    if (!reportId) {
      return { status: 400, body: { message: "reportId is required." } };
    }

    if (!["WARNING", "PERMANENT_BAN"].includes(actionTaken || "")) {
      return { status: 400, body: { message: "actionTaken must be one of: WARN, WARNING, BAN, PERMANENT_BAN." } };
    }

    const report = await prisma.misuseReport.findUnique({
      where: { id: reportId },
      select: { id: true, reportedUserId: true, status: true },
    });

    if (!report) {
      return { status: 404, body: { message: "Report not found." } };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const reportUpdate = await tx.misuseReport.update({
        where: { id: reportId },
        data: {
          status,
          actionTaken,
          reviewedById: payload?.reviewedById || null,
          reviewedAt: new Date(),
        },
      });

      const nextStatus = actionTaken === "WARNING" ? "WARNED" : "BANNED";
      try {
        await tx.user.update({
          where: { id: report.reportedUserId },
          data: {
            status: nextStatus,
            isFlagged: true,
            strikeCount: { increment: 1 },
          },
        });
      } catch (error) {
        if (nextStatus === "WARNED" && isWarnedStatusUnsupported(error)) {
          await tx.user.update({
            where: { id: report.reportedUserId },
            data: {
              status: "ACTIVE",
              isFlagged: true,
              strikeCount: { increment: 1 },
            },
          });
        } else {
          throw error;
        }
      }

      await tx.notification.create({
        data: {
          userId: report.reportedUserId,
          type: "MISUSE_REPORT",
          title: actionTaken === "WARNING" ? "You have been warned" : "Your account has been banned",
          message: actionTaken === "WARNING" ? "You have been warned by an administrator." : "Your account has been banned by an administrator.",
        },
      });

      return reportUpdate;
    });

    return { status: 200, body: { message: "Report moderated.", report: updated } };
  }

  async function moderateUser(userId, payload) {
    const nextStatus = String(payload?.status || "").trim().toUpperCase();
    const nextIsActive = toBooleanOrUndefined(payload?.isActive);

    if (!userId) {
      return { status: 400, body: { message: "userId is required." } };
    }

    const validStatus = nextStatus ? STATUS_VALUES.has(nextStatus) : true;
    if (!validStatus) {
      return { status: 400, body: { message: "Invalid status." } };
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return { status: 404, body: { message: "User not found." } };
    }

    let updated;
    try {
      updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(nextStatus ? { status: nextStatus } : {}),
          ...(nextIsActive !== undefined ? { isActive: nextIsActive } : {}),
          ...(nextStatus === "WARNED" || nextStatus === "BANNED"
            ? {
                isFlagged: true,
                strikeCount: { increment: 1 },
              }
            : {}),
        },
      });
    } catch (error) {
      if (nextStatus === "WARNED" && isWarnedStatusUnsupported(error)) {
        updated = await prisma.user.update({
          where: { id: userId },
          data: {
            status: "ACTIVE",
            isFlagged: true,
            strikeCount: { increment: 1 },
          },
        });
      } else {
        throw error;
      }
    }

    if (nextStatus === "WARNED" || nextStatus === "BANNED") {
      await prisma.notification.create({
        data: {
          userId,
          type: "SYSTEM",
          title: nextStatus === "WARNED" ? "You have been warned" : "Your account has been banned",
          message: nextStatus === "WARNED" ? "An administrator has warned your account." : "An administrator has banned your account.",
        },
      });
    }

    return { status: 200, body: { message: "User moderated.", user: toAdminUser(updated) } };
  }

  async function getAdminAnalyticsServices() {
    const serviceRequestsByType = await prisma.serviceRequest.groupBy({
      by: ["serviceType"],
      _count: { _all: true },
    });

    const sortedServiceRequests = [...serviceRequestsByType].sort((left, right) => right._count._all - left._count._all);
    return { status: 200, body: sortedServiceRequests };
  }

  async function getAdminAnalyticsComplaints() {
    const complaintsByType = await prisma.complaint.groupBy({
      by: ["complaintType"],
      _count: { _all: true },
    });

    const sortedComplaints = [...complaintsByType].sort((left, right) => right._count._all - left._count._all);
    return { status: 200, body: sortedComplaints };
  }

  async function getAdminAnalyticsUsers() {
    const [totalUsers, reports] = await Promise.all([
      prisma.user.count(),
      prisma.misuseReport.findMany({
        select: {
          id: true,
          reportedUserId: true,
          reportedUser: { select: { campus: true } },
        },
      }),
    ]);

    const [activeUsers, bannedUsers, warnedUsers] = await Promise.all([
      countUsersByStatusText(prisma, ["ACTIVE"]),
      countUsersByStatusText(prisma, ["BANNED", "SUSPENDED", "INACTIVE"]),
      countUsersByStatusText(prisma, ["WARNED"]),
    ]);

    const reportsByCampus = reports.reduce((accumulator, item) => {
      const campus = item.reportedUser?.campus || "Unknown";
      accumulator[campus] = (accumulator[campus] || 0) + 1;
      return accumulator;
    }, {});
    const uniqueReportedStudents = new Set(reports.map((item) => item.reportedUserId));

    return {
      status: 200,
      body: {
        totalUsers,
        activeUsers,
        bannedUsers,
        warnedUsers,
        reportedStudentsCount: uniqueReportedStudents.size,
        reportsByCampus,
      },
    };
  }

  async function getAdminAnalytics() {
    const [servicesResult, complaintsResult, usersResult] = await Promise.all([
      getAdminAnalyticsServices(),
      getAdminAnalyticsComplaints(),
      getAdminAnalyticsUsers(),
    ]);

    const serviceRequestsByType = servicesResult.body;
    const complaintsByType = complaintsResult.body;
    const {
      totalUsers,
      activeUsers,
      bannedUsers,
      warnedUsers,
      reportedStudentsCount,
      reportsByCampus,
    } = usersResult.body;

    return {
      status: 200,
      body: {
        totalUsers,
        activeUsers,
        bannedUsers,
        warnedUsers,
        reportedStudentsCount,
        mostRequestedService: serviceRequestsByType[0] || null,
        mostFrequentComplaint: complaintsByType[0] || null,
        serviceRequestsByType,
        complaintsByType,
        reportsByCampus,
      },
    };
  }

  async function createAdminUser(payload) {
    const name = String(payload?.name || "").trim();
    const email = payload?.email !== undefined ? String(payload.email).trim() || null : null;
    const role = payload?.role ? normalizeRole(payload.role) : null;
    const status = payload?.status ? normalizeStatus(payload.status) : "ACTIVE";
    const department = String(payload?.department || "General").trim() || "General";
    const campus = String(payload?.campus || "AMU").trim() || "AMU";
    const serviceType = payload?.serviceType ? normalizeServiceType(payload.serviceType) : null;
    const complaintType = payload?.complaintType ? normalizeComplaintType(payload.complaintType) : null;
    const plainPassword = payload?.password ? String(payload.password).trim() : "";
    if (!name || name.length < 2) {
      return { status: 400, body: { message: "name is required." } };
    }

    if (!email || !plainPassword || !role) {
      return { status: 400, body: { message: "Missing fields: email, password, and role are required." } };
    }

    if (!ROLE_VALUES.has(role)) {
      return { status: 400, body: { message: "Invalid role." } };
    }

    if (!STATUS_VALUES.has(status)) {
      return { status: 400, body: { message: "Invalid status." } };
    }

    const requestedUsername = payload?.username ? String(payload.username).trim().toUpperCase() : null;
    const username = requestedUsername || generateUsername(name, email);
    const password = await bcrypt.hash(plainPassword, 10);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(email ? [{ email }] : []),
        ],
      },
      select: { id: true },
    });

    if (existing) {
      return { status: 409, body: { message: "User with same username or email already exists." } };
    }

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          name,
          email,
          password,
          role,
          status,
          campus,
          department,
        },
      });

      const profileSyncError = await syncManagerProfiles(tx, {
        userId: user.id,
        role,
        serviceType,
        complaintType,
      });

      if (profileSyncError) {
        throw new Error(`PROFILE_SYNC:${profileSyncError.status}:${profileSyncError.message}`);
      }

      const hydrated = await tx.user.findUnique({
        where: { id: user.id },
        include: {
          serviceManagerProfile: { select: { serviceType: true } },
          complaintManagerProfile: { select: { complaintType: true } },
        },
      });

      return hydrated;
    }).catch((error) => {
      const marker = "PROFILE_SYNC:";
      if (String(error?.message || "").startsWith(marker)) {
        const [, statusCode, message] = String(error.message).split(":");
        return { __error: true, status: Number(statusCode), message };
      }

      if (error?.code === "P2002") {
        return { __error: true, status: 409, message: "User with same username or email already exists." };
      }

      throw error;
    });

    if (created?.__error) {
      return { status: created.status, body: { message: created.message } };
    }

    return {
      status: 201,
      body: {
        message: "User created.",
        user: toAdminUser(created),
      },
    };
  }

  async function updateAdminUser(userId, payload) {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        serviceManagerProfile: { select: { serviceType: true } },
        complaintManagerProfile: { select: { complaintType: true } },
      },
    });

    if (!existing) {
      return { status: 404, body: { message: "User not found." } };
    }

    const nextRole = payload?.role ? normalizeRole(payload.role) : existing.role;
    const nextStatus = payload?.status ? normalizeStatus(payload.status) : existing.status;
    const nextServiceType = payload?.serviceType !== undefined
      ? (String(payload.serviceType || "").trim() ? normalizeServiceType(payload.serviceType) : null)
      : existing.serviceManagerProfile?.serviceType || null;
    const nextComplaintType = payload?.complaintType !== undefined
      ? (String(payload.complaintType || "").trim() ? normalizeComplaintType(payload.complaintType) : null)
      : existing.complaintManagerProfile?.complaintType || null;

    if (!ROLE_VALUES.has(nextRole)) {
      return { status: 400, body: { message: "Invalid role." } };
    }

    if (!STATUS_VALUES.has(nextStatus)) {
      return { status: 400, body: { message: "Invalid status." } };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          name: payload?.name !== undefined ? String(payload.name || "").trim() || existing.name : undefined,
          email: payload?.email !== undefined ? String(payload.email || "").trim() || null : undefined,
          role: nextRole,
          status: nextStatus,
          ...(toBooleanOrUndefined(payload?.isActive) !== undefined ? { isActive: toBooleanOrUndefined(payload?.isActive) } : {}),
          department: payload?.department !== undefined ? String(payload.department || "").trim() || existing.department : undefined,
          campus: payload?.campus !== undefined ? String(payload.campus || "").trim() || existing.campus : undefined,
        },
      });

      const profileSyncError = await syncManagerProfiles(tx, {
        userId: user.id,
        role: nextRole,
        serviceType: nextServiceType,
        complaintType: nextComplaintType,
      });

      if (profileSyncError) {
        throw new Error(`PROFILE_SYNC:${profileSyncError.status}:${profileSyncError.message}`);
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          serviceManagerProfile: { select: { serviceType: true } },
          complaintManagerProfile: { select: { complaintType: true } },
        },
      });
    }).catch((error) => {
      const marker = "PROFILE_SYNC:";
      if (String(error?.message || "").startsWith(marker)) {
        const [, statusCode, message] = String(error.message).split(":");
        return { __error: true, status: Number(statusCode), message };
      }

      throw error;
    });

    if (updated?.__error) {
      return { status: updated.status, body: { message: updated.message } };
    }

    if (nextStatus === "WARNED" || nextStatus === "BANNED") {
      await prisma.notification.create({
        data: {
          userId,
          type: "SYSTEM",
          title: nextStatus === "WARNED"
            ? "You have been warned"
            : nextStatus === "BANNED"
              ? "Your account has been banned"
              : "Your account has been deactivated",
          message: nextStatus === "WARNED"
            ? "An administrator has warned your account."
            : nextStatus === "BANNED"
              ? "An administrator has banned your account."
              : "An administrator has deactivated your account.",
        },
      });
    }

    return {
      status: 200,
      body: {
        message: "User updated.",
        user: toAdminUser(updated),
      },
    };
  }

  async function exportAdminUsersCsv(query) {
    const role = query?.role ? normalizeRole(query.role) : undefined;
    const status = query?.status ? normalizeStatus(query.status) : undefined;
    const search = query?.search ? String(query.search).trim() : undefined;

    const where = {
      ...(role && ROLE_VALUES.has(role) ? { role } : {}),
      ...(status && STATUS_VALUES.has(status) ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const items = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        serviceManagerProfile: { select: { serviceType: true } },
        complaintManagerProfile: { select: { complaintType: true } },
      },
    });

    const headers = [
      "id",
      "username",
      "name",
      "email",
      "role",
      "status",
      "campus",
      "department",
      "serviceType",
      "complaintType",
      "createdAt",
    ];

    const lines = [headers.join(",")];
    items.forEach((item) => {
      const row = toAdminUser(item);
      lines.push(
        [
          row.id,
          row.username,
          row.name,
          row.email || "",
          row.role,
          row.status,
          row.campus,
          row.department,
          row.serviceType || "",
          row.complaintType || "",
          row.createdAt,
        ]
          .map(escapeCsv)
          .join(","),
      );
    });

    return {
      status: 200,
      body: {
        filename: "admin-users.csv",
        csv: lines.join("\n"),
      },
    };
  }

  return {
    getMe,
    updateMe,
    listUsers,
    listAdminUsers,
    createAdminUser,
    updateAdminUser,
    exportAdminUsersCsv,
    listAdminReports,
    moderateAdminReport,
    moderateUser,
    getAdminAnalytics,
    getAdminAnalyticsServices,
    getAdminAnalyticsComplaints,
    getAdminAnalyticsUsers,
  };
}
