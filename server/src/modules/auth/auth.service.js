import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { STUDENT_ID_REGEX, normalizeUpper, resolveLoginQuery } from "./auth.validation.js";

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

export async function login(prisma, payload, jwtSecret) {
  const { identity, identifier, password } = payload || {};
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

  const user = await userDelegate.findFirst({ where: resolution.where });
  if (!user) {
    return { status: 401, body: { message: "Invalid credentials." } };
  }

  const passwordMatches = await bcrypt.compare(String(password), user.password);
  if (!passwordMatches) {
    return { status: 401, body: { message: "Invalid credentials." } };
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role, username: user.username, email: user.email },
    jwtSecret,
    { expiresIn: "12h" },
  );

  return {
    status: 200,
    body: {
      message: "Login successful.",
      token,
      user: toPublicUser(user),
    },
  };
}
