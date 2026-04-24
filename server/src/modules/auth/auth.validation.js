export const STUDENT_ID_REGEX = /^(NSR|SSR)\/\d{1,6}\/\d{2,4}$/i;
export const AMU_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@amu\.edu\.et$/i;
export const EMPLOYEE_ID_REGEX = /^[A-Z]{2,5}-\d{2,5}$/i;

export function normalizeUpper(value) {
  return String(value || "").trim().toUpperCase();
}

export function resolveLoginQuery(identity, identifierRaw) {
  const identityType = String(identity || "").trim();
  const identifier = String(identifierRaw || "").trim();

  if (identityType === "student") {
    const normalized = normalizeUpper(identifier);
    if (!STUDENT_ID_REGEX.test(normalized)) {
      return { error: "Invalid student ID format." };
    }
    return {
      where: {
        username: normalized,
        role: { in: ["STUDENT", "COMPLAINT_MANAGER"] },
        status: "ACTIVE",
      },
    };
  }

  if (identityType === "staff") {
    const normalized = identifier.toLowerCase();
    if (!AMU_EMAIL_REGEX.test(normalized)) {
      return { error: "Invalid university email format." };
    }
    return {
      where: {
        email: normalized,
        role: "SERVICE_MANAGER",
        status: "ACTIVE",
      },
    };
  }

  if (identityType === "field") {
    const normalized = normalizeUpper(identifier);
    if (!EMPLOYEE_ID_REGEX.test(normalized)) {
      return { error: "Invalid employee ID format." };
    }
    return {
      where: {
        username: normalized,
        role: "STAFF",
        status: "ACTIVE",
      },
    };
  }

  if (identityType === "investigator") {
    const normalized = identifier.toLowerCase();
    if (!AMU_EMAIL_REGEX.test(normalized)) {
      return { error: "Invalid university email format." };
    }
    return {
      where: {
        email: normalized,
        role: "INVESTIGATOR",
        status: "ACTIVE",
      },
    };
  }

  if (identityType === "admin") {
    if (AMU_EMAIL_REGEX.test(identifier.toLowerCase())) {
      return {
        where: {
          email: identifier.toLowerCase(),
          role: "ADMIN",
          status: "ACTIVE",
        },
      };
    }

    const normalized = normalizeUpper(identifier);
    if (!EMPLOYEE_ID_REGEX.test(normalized)) {
      return { error: "Invalid admin ID format." };
    }

    return {
      where: {
        username: normalized,
        role: "ADMIN",
        status: "ACTIVE",
      },
    };
  }

  return { error: "Unsupported login identity." };
}
