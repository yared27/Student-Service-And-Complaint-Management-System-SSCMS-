import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendUserCredentialsEmail } from "../../lib/mailer.js";

const ROLE_VALUES = new Set(["STUDENT", "SERVICE_MANAGER", "STAFF", "COMPLAINT_MANAGER", "INVESTIGATOR", "ADMIN"]);
const STATUS_VALUES = new Set(["ACTIVE", "WARNED", "BANNED"]);
const SERVICE_TYPE_VALUES = new Set(["DORMITORY", "CAFETERIA", "ICT", "LIBRARY", "CLASSROOM", "LABORATORY", "UTILITIES", "TRANSPORT"]);
const CATEGORY_VALUES = new Set(["ICT", "DORMITORY", "CAFETERIA", "CLASSROOM", "LIBRARY", "LABORATORY", "UTILITIES", "TRANSPORT", "CLINIC"]);
const COMPLAINT_TYPE_VALUES = new Set(["ACADEMIC", "FOOD_SERVICE", "DISCIPLINE", "GENERAL_SERVICE", "WOMEN_CASE", "HEALTH_CASE", "DISABILITY_CASE", "SPORTS"]);

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

function normalizeCategory(raw) {
  return String(raw || "").trim().toUpperCase();
}

function mapComplaintTypeToCategory(complaintType) {
  const mapping = {
    ACADEMIC: "CLASSROOM",
    FOOD_SERVICE: "CAFETERIA",
    DISCIPLINE: "DORMITORY",
    GENERAL_SERVICE: "UTILITIES",
    WOMEN_CASE: "UTILITIES",
    HEALTH_CASE: "CLINIC",
    DISABILITY_CASE: "CLINIC",
    SPORTS: "CLASSROOM",
  };

  return mapping[String(complaintType || "").trim().toUpperCase()] || "UTILITIES";
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
    category: user.category || null,
    profileImage: user.profileImage || null,
    createdAt: user.createdAt,
    serviceType: user.serviceManagerProfile?.serviceType || null,
    complaintType: user.complaintManagerProfile?.complaintType || null,
    complaintCategory: user.complaintManagerProfile?.category || null,
  };
}

function generateStrongPassword(length = 12) {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const all = uppercase + lowercase + numbers + symbols;

  const randomChar = (chars) => chars[crypto.randomInt(chars.length)];
  const passwordChars = [
    randomChar(uppercase),
    randomChar(lowercase),
    randomChar(numbers),
    randomChar(symbols),
  ];

  while (passwordChars.length < length) {
    passwordChars.push(randomChar(all));
  }

  for (let index = passwordChars.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(index + 1);
    [passwordChars[index], passwordChars[swapIndex]] = [passwordChars[swapIndex], passwordChars[index]];
  }

  return passwordChars.join("");
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

function randomNumericSuffix(length = 5) {
  const min = 10 ** (length - 1);
  const max = (10 ** length) - 1;
  return String(crypto.randomInt(min, max + 1));
}

function normalizeUsernamePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildCredentialUsername({ role, category, complaintType, email, name }) {
  const normalizedRole = String(role || "").trim().toUpperCase();
  if (normalizedRole === "ADMIN" || normalizedRole === "SERVICE_MANAGER") {
    return String(email || "").trim().toLowerCase();
  }

  const bureauSeed = normalizedRole === "COMPLAINT_MANAGER" || normalizedRole === "INVESTIGATOR"
    ? complaintType || category
    : category;
  const resolvedCategory = normalizeUsernamePart(bureauSeed);
  const rolePart = normalizedRole === "COMPLAINT_MANAGER"
    ? "bureau-manager"
    : normalizedRole === "INVESTIGATOR"
      ? "investigator"
      : normalizeUsernamePart(normalizedRole);

  if (!resolvedCategory) {
    throw new Error("category or complaintType is required for credential generation.");
  }

  return `${resolvedCategory}-${rolePart}-${randomNumericSuffix(3)}`;
}

function generateSecurePassword(length = 12) {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_-+=";
  const all = uppercase + lowercase + numbers + symbols;

  const pick = (chars) => chars[crypto.randomInt(chars.length)];
  const chars = [pick(uppercase), pick(lowercase), pick(numbers), pick(symbols)];

  while (chars.length < length) {
    chars.push(pick(all));
  }

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(index + 1);
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }

  return chars.join("");
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
  const resolvedServiceType = normalizeServiceType(serviceType);
  const resolvedComplaintType = normalizeComplaintType(complaintType);
  const resolvedComplaintCategory = resolvedComplaintType ? mapComplaintTypeToCategory(resolvedComplaintType) : null;

  if (role === "SERVICE_MANAGER") {
    if (!resolvedServiceType || !SERVICE_TYPE_VALUES.has(resolvedServiceType)) {
      return { status: 400, message: "serviceType is required for SERVICE_MANAGER." };
    }

    const serviceConflict = await tx.serviceManager.findFirst({
      where: {
        serviceType: resolvedServiceType,
        NOT: { userId },
      },
      select: { id: true },
    });

    if (serviceConflict) {
      return { status: 409, message: "serviceType already assigned to another service manager." };
    }

    await tx.serviceManager.upsert({
      where: { userId },
      update: { serviceType: resolvedServiceType, category: resolvedServiceType },
      create: { userId, serviceType: resolvedServiceType, category: resolvedServiceType },
    });

    await tx.complaintManager.deleteMany({ where: { userId } });
    return null;
  }

  if (role === "COMPLAINT_MANAGER") {
    if (!resolvedComplaintType || !COMPLAINT_TYPE_VALUES.has(resolvedComplaintType)) {
      return { status: 400, message: "complaintType is required for COMPLAINT_MANAGER." };
    }

    const complaintConflict = await tx.complaintManager.findFirst({
      where: {
        complaintType: resolvedComplaintType,
        NOT: { userId },
      },
      select: { id: true },
    });

    if (complaintConflict) {
      return { status: 409, message: "complaintType already assigned to another complaint manager." };
    }

    await tx.complaintManager.upsert({
      where: { userId },
      update: { complaintType: resolvedComplaintType, category: resolvedComplaintCategory },
      create: { userId, complaintType: resolvedComplaintType, category: resolvedComplaintCategory },
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
        isActive: true,
        profileImage: true,
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
        isActive: true,
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

  async function updateProfileImage(userId, payload) {
    const profileImage = String(payload?.profileImage || payload?.imageUrl || payload?.url || "").trim();

    if (!profileImage) {
      return { status: 400, body: { message: "profileImage is required." } };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { profileImage },
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
        phone: true,
        profileImage: true,
      },
    });

    return {
      status: 200,
      body: {
        success: true,
        data: {
          message: "Profile image updated.",
          user: updated,
        },
      },
    };
  }

  async function changePassword(userId, payload) {
    if (!userId) {
      return { status: 401, body: { message: "Unauthorized." } };
    }

    const currentPassword = String(payload?.currentPassword || "");
    const newPassword = String(payload?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return { status: 400, body: { message: "currentPassword and newPassword are required." } };
    }

    if (newPassword.length < 8) {
      return { status: 400, body: { message: "Password must be at least 8 characters." } };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return { status: 404, body: { message: "User not found." } };
    }

    const validCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validCurrentPassword) {
      return { status: 401, body: { message: "Current password is incorrect." } };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return {
      status: 200,
      body: {
        success: true,
        data: { message: "Password changed successfully. Please login again." },
      },
    };
  }

  async function listUsers({ query, actorId, actorRole } = {}) {
    const role = query?.role ? String(query.role).trim().toUpperCase() : undefined;
    const status = query?.status ? String(query.status).trim().toUpperCase() : undefined;
    const search = query?.search ? String(query.search).trim() : undefined;
    const requestedCategory = query?.category ? String(query.category).trim().toUpperCase() : undefined;
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    let category = requestedCategory;
    const normalizedActorRole = String(actorRole || "").trim().toUpperCase();
    let where = {
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

    if (normalizedActorRole === "SERVICE_MANAGER" && actorId) {
      const actor = await prisma.user.findUnique({
        where: { id: actorId },
        select: { role: true, category: true, serviceManagerProfile: { select: { serviceType: true } } },
      });

      if (String(actor?.role || "").toUpperCase() !== "SERVICE_MANAGER") {
        return { status: 403, body: { message: "Forbidden." } };
      }

      const managerCategory = String(actor.category || actor.serviceManagerProfile?.serviceType || "").trim().toUpperCase() || undefined;
      if (!role) {
        where.role = "STAFF";
      }

      if (String(where.role || "").toUpperCase() !== "STAFF") {
        return { status: 403, body: { message: "Service managers may only view their field staff." } };
      }

      const actorServiceManager = await prisma.serviceManager.findFirst({
        where: { userId: actorId },
        select: { id: true },
      });

      if (managerCategory) {
        where = {
          ...where,
          AND: [
            {
              OR: [
                { managedByServiceManagerId: actorServiceManager?.id },
                { category: managerCategory },
              ],
            },
          ],
        };
      } else {
        where.managedByServiceManagerId = actorServiceManager?.id;
      }
    }

    if (normalizedActorRole === "COMPLAINT_MANAGER" && actorId) {
      const actor = await prisma.user.findUnique({
        where: { id: actorId },
        select: { role: true, category: true, complaintManagerProfile: { select: { complaintType: true } } },
      });

      if (String(actor?.role || "").toUpperCase() !== "COMPLAINT_MANAGER") {
        return { status: 403, body: { message: "Forbidden." } };
      }

      if (!role) {
        where.role = "INVESTIGATOR";
      }

      if (String(where.role || "").toUpperCase() !== "INVESTIGATOR") {
        return { status: 403, body: { message: "Complaint managers may only view their investigators." } };
      }

      const actorComplaintManager = await prisma.complaintManager.findFirst({
        where: { userId: actorId },
        select: { id: true },
      });

      where.managedByComplaintManagerId = actorComplaintManager?.id;
    }

    if (category && normalizedActorRole !== "SERVICE_MANAGER" && normalizedActorRole !== "COMPLAINT_MANAGER") {
      where.category = category;
    }

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
          category: true,
          email: true,
          role: true,
          status: true,
          isActive: true,
          profileImage: true,
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

  async function createUser({ payload, actorId, actorRole }) {
    const role = normalizeRole(payload?.role);
    const name = String(payload?.name || "").trim();
    const email = payload?.email ? String(payload.email || "").trim() : null;
    const username = payload?.username ? String(payload.username || "").trim() : undefined;
    const department = payload?.department ? String(payload.department || "").trim() : undefined;
    const campus = payload?.campus ? String(payload.campus || "").trim() : undefined;
    const status = payload?.status ? normalizeStatus(payload.status) : "ACTIVE";

    if (!role || !ROLE_VALUES.has(role)) {
      return { status: 400, body: { message: "Invalid role." } };
    }

    if (role !== "STAFF" && role !== "INVESTIGATOR") {
      return { status: 403, body: { message: "Only field staff and investigators may be created from this gateway." } };
    }

    const manager = await prisma.user.findUnique({
      where: { id: actorId },
      include: {
        serviceManagerProfile: true,
        complaintManagerProfile: true,
      },
    });

    if (!manager) {
      return { status: 401, body: { message: "Unauthorized." } };
    }

    const normalizedActorRole = String(actorRole || "").trim().toUpperCase();

    if (normalizedActorRole === "SERVICE_MANAGER") {
      if (role !== "STAFF") {
        return { status: 403, body: { message: "Service managers can only create field staff." } };
      }
    }

    if (normalizedActorRole === "COMPLAINT_MANAGER") {
      if (role !== "INVESTIGATOR") {
        return { status: 403, body: { message: "Complaint managers can only create investigators." } };
      }
    }

    if (normalizedActorRole === "SERVICE_MANAGER" && !manager.serviceManagerProfile?.serviceType) {
      return { status: 400, body: { message: "Service manager profile is missing service type." } };
    }

    if (normalizedActorRole === "COMPLAINT_MANAGER" && !manager.complaintManagerProfile?.complaintType) {
      return { status: 400, body: { message: "Complaint manager profile is missing complaint type." } };
    }

    const resolvedCategory = role === "STAFF"
      ? manager.serviceManagerProfile?.serviceType || manager.category
      : undefined;
    const resolvedComplaintType = role === "INVESTIGATOR"
      ? manager.complaintManagerProfile?.complaintType
      : undefined;

    const computedUsername = username || buildCredentialUsername({
      role,
      category: resolvedCategory,
      complaintType: resolvedComplaintType,
      email,
      name,
    });

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: computedUsername },
          ...(email ? [{ email }] : []),
        ],
      },
      select: { id: true },
    });

    if (existing) {
      return { status: 409, body: { message: "User with same username or email already exists." } };
    }

    const plainPassword = generateSecurePassword(10);
    const password = await bcrypt.hash(plainPassword, 10);

    const resolvedCampus = campus || manager.campus || "";

    let managedByServiceManagerId = undefined;
    if (role === "STAFF" && resolvedCategory) {
      const mgr = await prisma.serviceManager.findFirst({
        where: { serviceType: resolvedCategory },
        select: { id: true },
      });
      managedByServiceManagerId = mgr?.id;
    }

    let managedByComplaintManagerId = undefined;
    if (role === "INVESTIGATOR" && resolvedComplaintType) {
      const mgr = await prisma.complaintManager.findFirst({
        where: { complaintType: resolvedComplaintType },
        select: { id: true },
      });
      managedByComplaintManagerId = mgr?.id;
    }

    const createdUser = await prisma.user.create({
      data: {
        username: computedUsername,
        name,
        email,
        password,
        role,
        status,
        campus: resolvedCampus,
        department,
        category: resolvedCategory,
        managedByServiceManagerId,
        managedByComplaintManagerId,
      },
      include: {
        serviceManagerProfile: { select: { serviceType: true } },
        complaintManagerProfile: { select: { complaintType: true } },
      },
    });

    // Create profile for managers
    if (role === "SERVICE_MANAGER" && resolvedCategory) {
      await prisma.serviceManager.create({
        data: {
          userId: createdUser.id,
          serviceType: resolvedCategory,
        },
      });
    }

    if (role === "COMPLAINT_MANAGER" && resolvedComplaintType) {
      await prisma.complaintManager.create({
        data: {
          userId: createdUser.id,
          complaintType: resolvedComplaintType,
        },
      });
    }

    return {
      status: 201,
      body: {
        message: "User created.",
        user: toAdminUser(createdUser),
      },
    };
  }

  async function updateUser(userId, { payload, actorId, actorRole }) {
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

    const normalizedActorRole = String(actorRole || "").trim().toUpperCase();
    const targetRole = payload?.role ? normalizeRole(payload.role) : existing.role;

    if (normalizedActorRole === "SERVICE_MANAGER") {
      const actorServiceManager = await prisma.serviceManager.findFirst({
        where: { userId: actorId },
        select: { id: true },
      });
      if (!actorServiceManager || existing.role !== "STAFF" || existing.managedByServiceManagerId !== actorServiceManager.id) {
        return { status: 403, body: { message: "Forbidden." } };
      }
      if (payload?.role && normalizeRole(payload.role) !== "STAFF") {
        return { status: 400, body: { message: "Service managers may not change field staff roles." } };
      }
    }

    if (normalizedActorRole === "COMPLAINT_MANAGER") {
      const actorComplaintManager = await prisma.complaintManager.findFirst({
        where: { userId: actorId },
        select: { id: true },
      });
      if (!actorComplaintManager || existing.role !== "INVESTIGATOR" || existing.managedByComplaintManagerId !== actorComplaintManager.id) {
        return { status: 403, body: { message: "Forbidden." } };
      }
      if (payload?.role && normalizeRole(payload.role) !== "INVESTIGATOR") {
        return { status: 400, body: { message: "Complaint managers may not change investigator roles." } };
      }
    }

    if (normalizedActorRole !== "ADMIN" && normalizedActorRole !== "SERVICE_MANAGER" && normalizedActorRole !== "COMPLAINT_MANAGER") {
      return { status: 403, body: { message: "Forbidden." } };
    }

    const nextStatus = payload?.status ? normalizeStatus(payload.status) : existing.status;
    const isActiveUpdate = payload?.isActive !== undefined ? toBooleanOrUndefined(payload?.isActive) : undefined;

    const updateData = {
      name: payload?.name !== undefined ? String(payload.name || "").trim() || existing.name : undefined,
      email: payload?.email !== undefined ? String(payload.email || "").trim() || null : undefined,
      status: nextStatus,
      isActive: isActiveUpdate !== undefined ? isActiveUpdate : undefined,
      department: payload?.department !== undefined ? String(payload.department || "").trim() || existing.department : undefined,
      campus: payload?.campus !== undefined ? String(payload.campus || "").trim() || existing.campus : undefined,
    };

    if (payload?.role) {
      updateData.role = targetRole;
      if (targetRole !== "STAFF") {
        updateData.managedByServiceManagerId = null;
      }
      if (targetRole !== "INVESTIGATOR") {
        updateData.managedByComplaintManagerId = null;
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        serviceManagerProfile: { select: { serviceType: true } },
        complaintManagerProfile: { select: { complaintType: true } },
      },
    });

    if (nextStatus === "BANNED") {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
    }

    if (nextStatus === "WARNED" || nextStatus === "BANNED") {
      await prisma.notification.create({
        data: {
          userId,
          type: "SYSTEM",
          title: nextStatus === "WARNED"
            ? "You have been warned"
            : "Your account has been banned",
          message: nextStatus === "WARNED"
            ? "An administrator has warned your account."
            : "An administrator has banned your account.",
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
        profileImage: true,
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
    const [serviceRequestsByType, requestsByStatus, requestsByPriority] = await Promise.all([
      prisma.serviceRequest.groupBy({
        by: ["serviceType"],
        _count: { _all: true },
      }),
      prisma.serviceRequest.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.serviceRequest.groupBy({
        by: ["priority"],
        _count: { _all: true },
      }),
    ]);

    const sortedServiceRequests = [...serviceRequestsByType].sort((left, right) => right._count._all - left._count._all);
    const totalRequests = requestsByStatus.reduce((sum, item) => sum + item._count._all, 0);
    
    return {
      status: 200,
      body: {
        byType: sortedServiceRequests,
        byStatus: requestsByStatus,
        byPriority: requestsByPriority,
        total: totalRequests,
      },
    };
  }

  async function getAdminAnalyticsComplaints() {
    const [complaintsByType, complaintsByStatus] = await Promise.all([
      prisma.complaint.groupBy({
        by: ["complaintType"],
        _count: { _all: true },
      }),
      prisma.complaint.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const sortedComplaints = [...complaintsByType].sort((left, right) => right._count._all - left._count._all);
    const totalComplaints = complaintsByStatus.reduce((sum, item) => sum + item._count._all, 0);
    
    return {
      status: 200,
      body: {
        byType: sortedComplaints,
        byStatus: complaintsByStatus,
        total: totalComplaints,
      },
    };
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

    const serviceData = servicesResult.body;
    const complaintData = complaintsResult.body;
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
        summary: {
          totalUsers,
          activeUsers,
          bannedUsers,
          warnedUsers,
          reportedStudentsCount,
          totalServiceRequests: serviceData.total,
          totalComplaints: complaintData.total,
        },
        services: {
          mostRequested: serviceData.byType[0] || null,
          byType: serviceData.byType,
          byStatus: serviceData.byStatus,
          byPriority: serviceData.byPriority,
        },
        complaints: {
          mostFrequent: complaintData.byType[0] || null,
          byType: complaintData.byType,
          byStatus: complaintData.byStatus,
        },
        users: {
          reportsByCampus,
        },
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
    if (!name || name.length < 2) {
      return { status: 400, body: { message: "name is required." } };
    }

    if (!role) {
      return { status: 400, body: { message: "role is required." } };
    }

    if (!email) {
      return { status: 400, body: { message: "Email is required to send credentials." } };
    }

    if (role === "SERVICE_MANAGER" && !/^[A-Za-z0-9._%+-]+@amu\.edu\.et$/i.test(email)) {
      return { status: 400, body: { message: "Service manager email must be an @amu.edu.et address." } };
    }

    if (!ROLE_VALUES.has(role)) {
      return { status: 400, body: { message: "Invalid role." } };
    }

    if (!STATUS_VALUES.has(status)) {
      return { status: 400, body: { message: "Invalid status." } };
    }

    const resolvedCategory = role === "SERVICE_MANAGER"
      ? serviceType
      : role === "STAFF"
        ? serviceType || department
        : role === "COMPLAINT_MANAGER" || role === "INVESTIGATOR"
          ? complaintType || department
          : payload?.category || department;

    const username = buildCredentialUsername({ role, category: resolvedCategory, complaintType, email, name });
    const plainPassword = generateSecurePassword(10);

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

    try {
      await sendUserCredentialsEmail({
        to: email,
        username,
        password: plainPassword,
        role,
        category: resolvedCategory,
      });
    } catch (error) {
      const message = String(error?.message || "Failed to send credentials email. User not created.");
      if (message.includes("SMTP configuration missing")) {
        return { status: 500, body: { message: "SMTP configuration missing" } };
      }

      return { status: 502, body: { message: "Failed to send credentials email. User not created." } };
    }

    const password = await bcrypt.hash(plainPassword, 10);

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
        message: "User created and credentials emailed.",
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
      // Determine target email (either updated or existing)
      const targetEmail = payload?.email !== undefined ? String(payload.email || "").trim() || null : existing.email;

      // If switching to SERVICE_MANAGER, require an email to be present
      if (nextRole === "SERVICE_MANAGER" && !targetEmail) {
        return { __error: true, status: 400, message: "Email is required for SERVICE_MANAGER." };
      }

      // Compute username updates: enforce username=email (lowercase) for service managers.
      let usernameUpdate = undefined;
      if (nextRole === "SERVICE_MANAGER") {
        usernameUpdate = String(targetEmail).toLowerCase();
      } else if (existing.role === "SERVICE_MANAGER" && payload?.email !== undefined && targetEmail) {
        // If user WAS a service manager and their email changed, keep username in sync
        usernameUpdate = String(targetEmail).toLowerCase();
      }

      const user = await tx.user.update({
        where: { id: userId },
        data: {
          ...(usernameUpdate !== undefined ? { username: usernameUpdate } : {}),
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

    if (nextStatus === "BANNED") {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
      updated = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          serviceManagerProfile: { select: { serviceType: true } },
          complaintManagerProfile: { select: { complaintType: true } },
        },
      });
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
    updateProfileImage,
    changePassword,
    listUsers,
    listAdminUsers,
    createUser,
    updateUser,
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
