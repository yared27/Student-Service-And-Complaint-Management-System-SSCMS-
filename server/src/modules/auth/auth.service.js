import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { STUDENT_ID_REGEX, normalizeUpper, resolveLoginQuery } from "./auth.validation.js";

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "12h";
const ACCESS_TOKEN_TTL_REMEMBER_ME = process.env.ACCESS_TOKEN_TTL_REMEMBER_ME || "7d";
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "30d";
const PASSWORD_RESET_TOKEN_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 15);

function getUserDelegate(prisma) {
  const delegate = prisma?.user ?? prisma?.$parent?.user ?? prisma?.User ?? prisma?.users;

  if (
    !delegate ||
    typeof delegate.findFirst !== "function" ||
    typeof delegate.create !== "function"
  ) {
    const knownKeys = prisma && typeof prisma === "object" ? Object.keys(prisma).join(", ") : "none";
    throw new Error(`Prisma user delegate is not available. Injected keys: ${knownKeys}`);
  }

  return delegate;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function parseDurationToMilliseconds(duration) {
  const text = String(duration || "").trim();
  const match = text.match(/^(\d+)([smhd])$/i);

  if (!match) {
    return 30 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "s") {
    return value * 1000;
  }

  if (unit === "m") {
    return value * 60 * 1000;
  }

  if (unit === "h") {
    return value * 60 * 60 * 1000;
  }

  return value * 24 * 60 * 60 * 1000;
}

function createAccessToken({ user, jwtSecret, rememberMe }) {
  return jwt.sign(
    { sub: user.id, role: user.role, username: user.username, email: user.email },
    jwtSecret,
    { expiresIn: rememberMe ? ACCESS_TOKEN_TTL_REMEMBER_ME : ACCESS_TOKEN_TTL },
  );
}

async function issueRefreshToken({ prisma, userId, refreshTokenSecret, reqMeta }) {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign(
    {
      sub: userId,
      tid: tokenId,
      type: "refresh",
    },
    refreshTokenSecret,
    { expiresIn: REFRESH_TOKEN_TTL },
  );

  const refreshTokenExpiresAt = new Date(Date.now() + parseDurationToMilliseconds(REFRESH_TOKEN_TTL));
  const tokenHash = hashToken(token);

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId,
      tokenHash,
      expiresAt: refreshTokenExpiresAt,
      ipAddress: reqMeta?.ipAddress || null,
      userAgent: reqMeta?.userAgent || null,
    },
  });

  return {
    refreshToken: token,
    refreshTokenExpiresAt,
  };
}

async function revokeRefreshTokenById(prisma, refreshTokenId) {
  await prisma.refreshToken.updateMany({
    where: {
      id: refreshTokenId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

function parseRefreshToken(rawToken, refreshTokenSecret) {
  try {
    const payload = jwt.verify(String(rawToken || ""), refreshTokenSecret);
    if (payload?.type !== "refresh" || !payload?.sub || !payload?.tid) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    campus: user.campus,
    department: user.department,
    status: user.status,
  };
}

export async function registerStudent(prisma, payload) {
  const { fullName, studentId, campus, department, password } = payload || {};
  const userDelegate = getUserDelegate(prisma);

  const normalizedStudentId = normalizeUpper(studentId);
  if (!fullName || String(fullName).trim().length < 2) {
    return { status: 400, body: { message: "Full name is required." } };
  }

  if (!STUDENT_ID_REGEX.test(normalizedStudentId)) {
    return { status: 400, body: { message: "Invalid student ID format." } };
  }

  if (!campus || !String(campus).trim()) {
    return { status: 400, body: { message: "Campus is required." } };
  }

  if (!password || String(password).length < 8) {
    return { status: 400, body: { message: "Password must be at least 8 characters." } };
  }

  const existing = await userDelegate.findFirst({
    where: { OR: [{ username: normalizedStudentId }] },
    select: { id: true },
  });

  if (existing) {
    return { status: 409, body: { message: "Student account already exists." } };
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);

  const user = await userDelegate.create({
    data: {
      username: normalizedStudentId,
      name: String(fullName).trim(),
      password: hashedPassword,
      role: "STUDENT",
      campus: String(campus).trim(),
      department: String(department || "").trim() || "General",
    },
  });

  return {
    status: 201,
    body: {
      message: "Account created successfully. Please login.",
      user: toPublicUser(user),
    },
  };
}

export async function login(prisma, payload, jwtSecret, refreshTokenSecret, reqMeta) {
  const { identity, identifier, password, rememberMe } = payload || {};
  const userDelegate = getUserDelegate(prisma);

  if (!identity || !identifier || !password) {
    return {
      status: 400,
      body: { message: "Identity, identifier, and password are required." },
    };
  }

  const resolution = resolveLoginQuery(identity, identifier);
  if (resolution.error) {
    return { status: 400, body: { message: resolution.error } };
  }

  const user = await userDelegate.findFirst({
    where: resolution.where,
    select: {
      id: true,
      username: true,
      name: true,
      password: true,
      email: true,
      role: true,
      status: true,
      campus: true,
      department: true,
    },
  });
  console.log("Login user lookup:", user ? { id: user.id, username: user.username, email: user.email, role: user.role } : null);
  console.log("Login user role:", user?.role || null);
  if (!user) {
    return { status: 401, body: { message: "Invalid credentials." } };
  }

  const passwordMatches = await bcrypt.compare(String(password), user.password);
  if (!passwordMatches) {
    return { status: 401, body: { message: "Invalid credentials." } };
  }

  if (String(user.status || "").toUpperCase() === "BANNED") {
    return {
      status: 403,
      body: {
        message: "Your account has been banned.",
      },
    };
  }

  const token = createAccessToken({
    user,
    jwtSecret,
    rememberMe: Boolean(rememberMe),
  });

  const refreshIssueResult = await issueRefreshToken({
    prisma,
    userId: user.id,
    refreshTokenSecret,
    reqMeta,
  });

  return {
    status: 200,
    body: {
      message: "Login successful.",
      token,
      refreshToken: refreshIssueResult.refreshToken,
      accessTokenExpiresIn: rememberMe ? ACCESS_TOKEN_TTL_REMEMBER_ME : ACCESS_TOKEN_TTL,
      refreshTokenExpiresAt: refreshIssueResult.refreshTokenExpiresAt,
      role: user.role,
      user: toPublicUser(user),
    },
  };
}

export async function refreshSession(prisma, payload, jwtSecret, refreshTokenSecret, reqMeta) {
  const rawRefreshToken = payload?.refreshToken;
  if (!rawRefreshToken) {
    return { status: 400, body: { message: "refreshToken is required." } };
  }

  const decoded = parseRefreshToken(rawRefreshToken, refreshTokenSecret);
  if (!decoded) {
    return { status: 401, body: { message: "Invalid refresh token." } };
  }

  const session = await prisma.refreshToken.findUnique({
    where: { id: decoded.tid },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    return { status: 401, body: { message: "Refresh token is expired or revoked." } };
  }

  if (session.tokenHash !== hashToken(rawRefreshToken)) {
    return { status: 401, body: { message: "Invalid refresh token." } };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: decoded.sub,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      status: true,
      campus: true,
      department: true,
    },
  });

  if (!user) {
    return { status: 401, body: { message: "User is not active." } };
  }

  if (String(user.status || "").toUpperCase() === "BANNED") {
    return { status: 403, body: { message: "Your account has been banned." } };
  }

  await revokeRefreshTokenById(prisma, decoded.tid);

  const nextRefresh = await issueRefreshToken({
    prisma,
    userId: user.id,
    refreshTokenSecret,
    reqMeta,
  });

  const token = createAccessToken({
    user,
    jwtSecret,
    rememberMe: true,
  });

  return {
    status: 200,
    body: {
      message: "Session refreshed.",
      token,
      refreshToken: nextRefresh.refreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_TTL,
      refreshTokenExpiresAt: nextRefresh.refreshTokenExpiresAt,
      user: toPublicUser(user),
    },
  };
}

export async function logout(prisma, payload, refreshTokenSecret) {
  const rawRefreshToken = payload?.refreshToken;

  if (!rawRefreshToken) {
    return { status: 200, body: { message: "Logged out." } };
  }

  const decoded = parseRefreshToken(rawRefreshToken, refreshTokenSecret);
  if (!decoded) {
    return { status: 200, body: { message: "Logged out." } };
  }

  const session = await prisma.refreshToken.findUnique({ where: { id: decoded.tid } });
  if (!session || session.tokenHash !== hashToken(rawRefreshToken)) {
    return { status: 200, body: { message: "Logged out." } };
  }

  await revokeRefreshTokenById(prisma, decoded.tid);
  return { status: 200, body: { message: "Logged out." } };
}

export async function logoutAll(prisma, userId) {
  if (!userId) {
    return { status: 401, body: { message: "Unauthorized." } };
  }

  const result = await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return {
    status: 200,
    body: {
      message: "Logged out from all devices.",
      revokedSessions: result.count,
    },
  };
}

export async function forgotPassword(prisma, payload) {
  const identifier = String(payload?.identifier || payload?.email || "").trim();

  if (!identifier) {
    return {
      status: 200,
      body: { message: "If the account exists, a reset instruction has been generated." },
    };
  }

  const normalizedEmail = identifier.toLowerCase();
  const normalizedUsername = normalizeUpper(identifier);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
    },
    select: { id: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return {
      status: 200,
      body: { message: "If the account exists, a reset instruction has been generated." },
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const responseBody = {
    message: "If the account exists, a reset instruction has been generated.",
  };

  if (process.env.NODE_ENV !== "production") {
    responseBody.resetToken = resetToken;
  }

  return {
    status: 200,
    body: responseBody,
  };
}

export async function resetPassword(prisma, payload) {
  const resetToken = String(payload?.token || "").trim();
  const newPassword = String(payload?.newPassword || "");

  if (!resetToken || !newPassword) {
    return { status: 400, body: { message: "token and newPassword are required." } };
  }

  if (newPassword.length < 8) {
    return { status: 400, body: { message: "Password must be at least 8 characters." } };
  }

  const resetEntry = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: hashToken(resetToken),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, userId: true },
  });

  if (!resetEntry) {
    return { status: 400, body: { message: "Invalid or expired reset token." } };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetEntry.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetEntry.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: resetEntry.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { status: 200, body: { message: "Password reset successful." } };
}

export async function changePassword(prisma, userId, payload) {
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
    body: { message: "Password changed successfully. Please login again." },
  };
}
