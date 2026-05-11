import bcrypt from "bcrypt";
import crypto from "crypto";
import xlsx from "xlsx";

const SUPPORTED_EXTENSIONS = new Set(["csv", "xlsx", "xls"]);
const REQUIRED_COLUMNS = ["studentid", "username", "name", "email", "campus", "department"];

function normalizeHeaderKey(key) {
  return String(key || "").trim().toLowerCase();
}

function parseRows(file) {
  if (!file || !file.buffer) {
    return [];
  }

  const fileName = String(file.originalname || "");
  const extension = fileName.split(".").pop().toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error("Unsupported file type.");
  }

  const workbook = xlsx.read(file.buffer, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) {
    return [];
  }

  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
}

function normalizeRow(row) {
  const normalized = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    normalized[normalizeHeaderKey(key)] = value;
  });

  return {
    username: String(normalized.studentid || normalized.username || normalized["student id"] || normalized["id"] || "").trim(),
    name: String(normalized.name || normalized["full name"] || normalized["student name"] || "").trim(),
    email: String(normalized.email || normalized["e-mail"] || normalized["email address"] || "").trim(),
    campus: String(normalized.campus || normalized["campus name"] || "").trim() || "ARBA_MINCH_MAIN",
    department: String(normalized.department || normalized["faculty"] || normalized["dept"] || "").trim(),
  };
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

export function createStudentImportService({ prisma }) {
  async function importStudents(actorId, file, body) {
    if (!actorId) {
      return { status: 401, body: { message: "Unauthorized." } };
    }

    if (!file) {
      return { status: 400, body: { message: "Please attach a CSV or XLSX file." } };
    }

    const rows = parseRows(file);
    if (!rows.length) {
      return { status: 400, body: { message: "No student records found in the uploaded file." } };
    }

    const parsed = rows.map((row, index) => ({
      rowIndex: index + 1,
      data: normalizeRow(row),
    }));

    const usernames = Array.from(new Set(parsed.map((item) => String(item.data.username || "").trim()).filter(Boolean)));
    const emails = Array.from(new Set(parsed.map((item) => String(item.data.email || "").trim()).filter(Boolean)));

    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { username: { in: usernames } },
          { email: { in: emails } },
        ],
      },
      select: { username: true, email: true },
    });

    const existingUsernames = new Set(existingUsers.map((user) => String(user.username || "").trim().toLowerCase()));
    const existingEmails = new Set(existingUsers.map((user) => String(user.email || "").trim().toLowerCase()));
    const seen = new Set();

    const importResults = {
      totalCount: parsed.length,
      importedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      errors: [],
    };

    for (const item of parsed) {
      const { rowIndex, data } = item;
      const username = String(data.username || "").trim();
      const email = String(data.email || "").trim();
      const name = String(data.name || "").trim();
      const campus = String(data.campus || "ARBA_MINCH_MAIN").trim();
      const department = String(data.department || "").trim();

      if (!username || !name || !email || !department) {
        importResults.failedCount += 1;
        importResults.errors.push({
          row: rowIndex,
          reason: "Required fields missing. Provide studentId, name, email, and department.",
          data,
        });
        continue;
      }

      const normalizedUsername = username.toLowerCase();
      const normalizedEmail = email.toLowerCase();

      if (seen.has(normalizedUsername) || seen.has(normalizedEmail)) {
        importResults.skippedCount += 1;
        importResults.errors.push({ row: rowIndex, reason: "Duplicate row in upload.", data });
        continue;
      }

      if (existingUsernames.has(normalizedUsername) || existingEmails.has(normalizedEmail)) {
        importResults.skippedCount += 1;
        importResults.errors.push({ row: rowIndex, reason: "User already exists.", data });
        continue;
      }

      seen.add(normalizedUsername);
      seen.add(normalizedEmail);

      try {
        const password = await bcrypt.hash(generateSecurePassword(12), 10);
        await prisma.user.create({
          data: {
            username,
            name,
            email,
            password,
            role: "STUDENT",
            status: "ACTIVE",
            campus,
            department,
          },
        });
        importResults.importedCount += 1;
      } catch (error) {
        importResults.failedCount += 1;
        importResults.errors.push({ row: rowIndex, reason: String(error.message || "Create failed."), data });
      }
    }

    const batch = await prisma.importBatch.create({
      data: {
        importedById: actorId,
        fileName: file.originalname || "student-import",
        totalCount: importResults.totalCount,
        importedCount: importResults.importedCount,
        skippedCount: importResults.skippedCount,
        failedCount: importResults.failedCount,
        errors: importResults.errors,
      },
    });

    return {
      status: 200,
      body: {
        message: "Import completed.",
        batch: {
          id: batch.id,
          fileName: batch.fileName,
          totalCount: batch.totalCount,
          importedCount: batch.importedCount,
          skippedCount: batch.skippedCount,
          failedCount: batch.failedCount,
          createdAt: batch.createdAt,
        },
        summary: importResults,
      },
    };
  }

  async function listImportHistory(query) {
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const [total, items] = await prisma.$transaction([
      prisma.importBatch.count(),
      prisma.importBatch.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { importedBy: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    return {
      status: 200,
      body: {
        total,
        page,
        limit,
        items: items.map((item) => ({
          id: item.id,
          fileName: item.fileName,
          totalCount: item.totalCount,
          importedCount: item.importedCount,
          skippedCount: item.skippedCount,
          failedCount: item.failedCount,
          importedBy: item.importedBy,
          createdAt: item.createdAt,
        })),
      },
    };
  }

  async function getImportBatch(batchId) {
    const batch = await prisma.importBatch.findUnique({
      where: { id: batchId },
      include: { importedBy: { select: { id: true, name: true, email: true } } },
    });

    if (!batch) {
      return { status: 404, body: { message: "Import batch not found." } };
    }

    return {
      status: 200,
      body: {
        batch: {
          id: batch.id,
          fileName: batch.fileName,
          totalCount: batch.totalCount,
          importedCount: batch.importedCount,
          skippedCount: batch.skippedCount,
          failedCount: batch.failedCount,
          errors: batch.errors || [],
          importedBy: batch.importedBy,
          createdAt: batch.createdAt,
        },
      },
    };
  }

  return {
    importStudents,
    listImportHistory,
    getImportBatch,
  };
}
