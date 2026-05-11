import { predictRequestAdvisory } from "../../services/aiService.js";

function canManageComplaint(role) {
  return ["COMPLAINT_MANAGER", "ADMIN"].includes(role);
}

function isMissingGrievanceStatusColumn(error) {
  return error?.code === "P2022" && String(error?.meta?.column || "").includes("Complaint.grievanceStatus");
}

const COMPLAINT_SAFE_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  complaintType: true,
  createdById: true,
  assignedToId: true,
  assignedComplaintManagerId: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  createdBy: { select: { id: true, name: true, username: true } },
  assignedTo: { select: { id: true, name: true, role: true } },
  attachments: { orderBy: { createdAt: "asc" } },
};

function normalizeComplaintType(value) {
  const raw = String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  const aliases = {
    FOOD: "FOOD_SERVICE",
    FOODSERVICES: "FOOD_SERVICE",
    GENERAL: "GENERAL_SERVICE",
    DISCIPLINARY: "DISCIPLINE",
    HEALTH: "HEALTH_CASE",
    HEALTHCARE: "HEALTH_CASE",
    DISABILITY: "DISABILITY_CASE",
    WOMEN: "WOMEN_CASE",
  };

  const normalized = aliases[raw] || raw;
  const allowed = new Set([
    "ACADEMIC",
    "FOOD_SERVICE",
    "DISCIPLINE",
    "GENERAL_SERVICE",
    "WOMEN_CASE",
    "HEALTH_CASE",
    "DISABILITY_CASE",
    "SPORTS",
  ]);

  return allowed.has(normalized) ? normalized : null;
}

function normalizePriority(value) {
  const normalized = String(value || "").trim().toUpperCase();
  const allowed = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);
  return allowed.has(normalized) ? normalized : null;
}

function complaintTypeToCategory(complaintType) {
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

  return mapping[String(complaintType || "").toUpperCase()] || "UTILITIES";
}

function canWorkComplaint(role) {
  return ["SERVICE_MANAGER", "COMPLAINT_MANAGER", "INVESTIGATOR", "ADMIN"].includes(role);
}

function canViewAllComplaints(role) {
  return ["COMPLAINT_MANAGER", "ADMIN"].includes(role);
}

const GRIEVANCE_PHASE_SEQUENCE = ["PHASE_1", "PHASE_2", "PHASE_3"];

function normalizeGrievanceStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return GRIEVANCE_PHASE_SEQUENCE.includes(normalized) ? normalized : null;
}

async function notifyUser(prisma, userId, type, title, message, extra = {}) {
  if (!userId) {
    return;
  }

  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
    },
  });
}

async function pickComplaintManagerForType(prisma, complaintType) {
  const managers = await prisma.complaintManager.findMany({
    where: {
      complaintType,
      user: {
        role: "COMPLAINT_MANAGER",
        status: { in: ["ACTIVE", "WARNED"] },
      },
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!managers.length) {
    return null;
  }

  if (managers.length === 1) {
    return managers[0];
  }

  const withLoad = await Promise.all(
    managers.map(async (manager) => {
      const activeLoad = await prisma.complaint.count({
        where: {
          assignedComplaintManagerId: manager.id,
          status: {
            in: ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS"],
          },
        },
      });

      return {
        ...manager,
        activeLoad,
      };
    }),
  );

  withLoad.sort((left, right) => {
    if (left.activeLoad !== right.activeLoad) {
      return left.activeLoad - right.activeLoad;
    }

    return left.id.localeCompare(right.id);
  });

  return withLoad[0];
}

export function createComplaintsService({ prisma }) {
  async function createGrievance({ userId, role, payload }) {
    const normalizedRole = String(role || "").toUpperCase();
    if (normalizedRole !== "STUDENT") {
      return {
        status: 403,
        body: {
          message: "Only students can submit complaints.",
        },
      };
    }

    const title = String(payload?.title || "").trim();
    const description = String(payload?.description || "").trim();
    const attachmentUrls = Array.isArray(payload?.attachmentUrls)
      ? payload.attachmentUrls
          .map((value) => {
            if (typeof value === "string") {
              return { url: String(value || "").trim() };
            }

            return {
              url: String(value?.url || "").trim(),
              publicId: value?.publicId ? String(value.publicId).trim() : null,
              width: Number.isInteger(value?.width) ? value.width : null,
              height: Number.isInteger(value?.height) ? value.height : null,
              format: value?.format ? String(value.format).trim() : null,
              bytes: Number.isInteger(value?.bytes) ? value.bytes : null,
            };
          })
          .filter((value) => value.url)
      : [];
    // Ignore any incoming priority from client - must be generated by AI
    const complaintType = normalizeComplaintType(payload?.complaintType || payload?.category || payload?.department || title);

    if (!title || !description) {
      return { status: 400, body: { message: "title and description are required." } };
    }

    if (!complaintType) {
      return {
        status: 400,
        body: {
          message:
            "complaintType is required and must be one of: ACADEMIC, FOOD_SERVICE, DISCIPLINE, GENERAL_SERVICE, WOMEN_CASE, HEALTH_CASE, DISABILITY_CASE, SPORTS.",
        },
      };
    }

    const category = complaintTypeToCategory(complaintType);

    // Run AI advisory to determine priority and duplicate risk
    const textForAi = `${title}. ${description}`;
    let advisory = null;
    try {
      advisory = await predictRequestAdvisory(textForAi);
    } catch {
      advisory = null;
    }

    // Duplicate blocking
    if (advisory?.duplicateScore > 0.7) {
      return { status: 409, body: { message: "A similar request already exists. Please check existing requests." } };
    }

    const priority = normalizePriority(advisory?.priority) || "MEDIUM";

    let manager = await pickComplaintManagerForType(prisma, complaintType);

    // Safety fallback: attempt to restore missing profile mapping from user category.
    if (!manager) {
      const fallbackUser = await prisma.user.findFirst({
        where: {
          role: "COMPLAINT_MANAGER",
          category,
          status: { in: ["ACTIVE", "WARNED"] },
        },
        select: { id: true },
      });

      if (fallbackUser) {
        manager = await prisma.complaintManager.upsert({
          where: { complaintType },
          update: { userId: fallbackUser.id, category },
          create: { userId: fallbackUser.id, category, complaintType },
          select: { id: true, userId: true },
        });
      }
    }

    if (!manager) {
      return {
        status: 422,
        body: {
          message: "Complaint manager coverage is missing for this complaint type. Run prisma seed to repair role coverage.",
          complaintType,
        },
      };
    }

    console.log("Routing to manager:", manager.id);

    let complaint;
    try {
      complaint = await prisma.complaint.create({
        data: {
          title,
          description,
          priority,
          grievanceStatus: "PHASE_1",
          complaintType,
          category,
          createdById: userId,
          assignedComplaintManagerId: manager.id,
          attachments: attachmentUrls.length
            ? {
                create: attachmentUrls,
              }
            : undefined,
        },
        select: COMPLAINT_SAFE_SELECT,
      });
    } catch (error) {
      if (!isMissingGrievanceStatusColumn(error)) {
        throw error;
      }

      complaint = await prisma.complaint.create({
        data: {
          title,
          description,
          priority,
          complaintType,
          category,
          createdById: userId,
          assignedComplaintManagerId: manager.id,
          attachments: attachmentUrls.length
            ? {
                create: attachmentUrls,
              }
            : undefined,
        },
        select: COMPLAINT_SAFE_SELECT,
      });
    }

    await notifyUser(
      prisma,
      manager.userId,
      "COMPLAINT",
      "New routed complaint",
      `A ${complaintType.toLowerCase().replaceAll("_", " ")} complaint has been routed to your queue: ${complaint.title}`,
      {
        route: "/complaint-manager/complaints",
        entityType: "COMPLAINT",
        entityId: complaint.id,
      },
    );

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        complaintId: complaint.id,
        action: "COMPLAINT_CREATED",
        entityType: "COMPLAINT",
        entityId: complaint.id,
        description: "Complaint created.",
      },
    });

    return { status: 201, body: { message: "Complaint submitted.", complaint } };
  }

  const createComplaint = createGrievance;

  async function listComplaints({ userId, role, category, query }) {
    const status = query?.status ? String(query.status) : undefined;
    const priority = query?.priority ? String(query.priority) : undefined;
    const complaintTypeFilter = query?.complaintType ? normalizeComplaintType(query.complaintType) : null;
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const normalizedRole = String(role || "").toUpperCase();
    let managerComplaintType = null;

    if (normalizedRole === "COMPLAINT_MANAGER") {
      const managerProfile = await prisma.complaintManager.findUnique({
        where: { userId },
        select: { complaintType: true },
      });

      managerComplaintType = managerProfile?.complaintType || null;
    }

    const where = {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(complaintTypeFilter ? { complaintType: complaintTypeFilter } : {}),
      ...(normalizedRole === "COMPLAINT_MANAGER" && managerComplaintType
        ? { complaintType: managerComplaintType }
        : canViewAllComplaints(normalizedRole)
          ? {}
          : normalizedRole === "INVESTIGATOR"
            ? { assignedToId: userId }
            : { createdById: userId }),
    };

    const [total, items] = await prisma.$transaction([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: COMPLAINT_SAFE_SELECT,
      }),
    ]);

    return { status: 200, body: { total, page, limit, items } };
  }

  async function getComplaint({ userId, role, complaintId }) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: COMPLAINT_SAFE_SELECT,
    });

    if (!complaint) {
      return { status: 404, body: { message: "Complaint not found." } };
    }

    if (!canViewAllComplaints(role) && complaint.createdById !== userId && complaint.assignedToId !== userId) {
      return { status: 403, body: { message: "Forbidden." } };
    }

    return { status: 200, body: { complaint } };
  }

  async function assignComplaint({ userId, role, complaintId, payload }) {
    if (!canManageComplaint(role)) {
      return { status: 403, body: { message: "Only complaint managers/admin can assign complaints." } };
    }

    const assignedToId = String(payload?.assignedToId || "").trim();
    if (!assignedToId) {
      return { status: 400, body: { message: "assignedToId is required." } };
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: {
        id: true,
        title: true,
        status: true,
        createdById: true,
      },
    });

    if (!complaint) {
      return { status: 404, body: { message: "Complaint not found." } };
    }

    if (["RESOLVED", "REJECTED"].includes(complaint.status)) {
      return { status: 400, body: { message: "Resolved complaints cannot be reassigned." } };
    }

    const assignee = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { id: true, name: true, role: true },
    });

    if (!assignee || assignee.role !== "INVESTIGATOR") {
      return { status: 400, body: { message: "Complaints can only be assigned to investigators." } };
    }

    if (complaint.assignedToId === assignedToId) {
      const existingComplaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
        select: COMPLAINT_SAFE_SELECT,
      });

      return {
        status: 200,
        body: {
          message: `Complaint is already assigned to ${assignee.name}.`,
          complaint: existingComplaint,
        },
      };
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        assignedToId,
        status: complaint.status === "SUBMITTED" ? "UNDER_REVIEW" : complaint.status,
      },
      select: COMPLAINT_SAFE_SELECT,
    });

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        complaintId,
        action: "COMPLAINT_ASSIGNED",
        entityType: "COMPLAINT",
        entityId: complaintId,
        description: `Complaint assigned to ${assignee.name}.`,
      },
    });

    await notifyUser(
      prisma,
      assignedToId,
      "COMPLAINT",
      "New complaint assignment",
      `You have been assigned to complaint: ${updated.title}`,
      {
        route: "/student/dashboard",
        entityType: "COMPLAINT",
        entityId: updated.id,
      },
    );

    return { status: 200, body: { message: "Complaint assigned.", complaint: updated } };
  }

  async function updateComplaintStatus({ userId, role, complaintId, payload }) {
    const status = String(payload?.status || "").trim();
    const assignedToId = payload?.assignedToId ? String(payload.assignedToId) : undefined;

    if (!status) {
      return { status: 400, body: { message: "status is required." } };
    }

    if (!canWorkComplaint(role)) {
      return { status: 403, body: { message: "You are not allowed to update complaints." } };
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: {
        id: true,
        assignedToId: true,
      },
    });
    if (!complaint) {
      return { status: 404, body: { message: "Complaint not found." } };
    }

    if (role === "INVESTIGATOR" && complaint.assignedToId !== userId) {
      return { status: 403, body: { message: "You can only update complaints assigned to you." } };
    }

    if (role === "INVESTIGATOR" && !["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"].includes(status)) {
      return {
        status: 400,
        body: { message: "Investigators can only move complaints to UNDER_REVIEW, IN_PROGRESS, RESOLVED, or REJECTED." },
      };
    }

    if (role !== "INVESTIGATOR" && assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, name: true, role: true },
      });

      if (!assignee || assignee.role !== "INVESTIGATOR") {
        return { status: 400, body: { message: "Complaints can only be assigned to investigators." } };
      }
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status,
        ...(role !== "INVESTIGATOR" && assignedToId ? { assignedToId } : {}),
        resolvedAt: ["RESOLVED", "REJECTED"].includes(status) ? new Date() : null,
      },
      select: COMPLAINT_SAFE_SELECT,
    });

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        complaintId: complaintId,
        action: "COMPLAINT_STATUS_UPDATED",
        entityType: "COMPLAINT",
        entityId: complaintId,
        description: `Complaint status updated to ${status}.`,
      },
    });

    if (updated.assignedToId && ["RESOLVED", "REJECTED"].includes(updated.status)) {
      await notifyUser(
        prisma,
        updated.createdById,
        "COMPLAINT",
        "Complaint reviewed",
        `Your complaint \"${updated.title}\" has been ${updated.status.toLowerCase().replace("_", " ")}.`,
        {
          route: `/student/submission/${updated.id}`,
          entityType: "COMPLAINT",
          entityId: updated.id,
        },
      );
    }

    return { status: 200, body: { message: "Complaint updated.", complaint: updated } };
  }

  async function updateGrievanceStatus({ userId, role, complaintId, payload }) {
    if (!canManageComplaint(role)) {
      return { status: 403, body: { message: "You are not allowed to move grievance phases." } };
    }

    const nextStatus = normalizeGrievanceStatus(payload?.status);
    if (!nextStatus) {
      return { status: 400, body: { message: "status must be one of: PHASE_1, PHASE_2, PHASE_3." } };
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: {
        id: true,
        grievanceStatus: true,
      },
    }).catch((error) => {
      if (isMissingGrievanceStatusColumn(error)) {
        return { __missingGrievanceColumn: true };
      }

      throw error;
    });

    if (complaint?.__missingGrievanceColumn) {
      return { status: 400, body: { message: "Grievance phase tracking is not available until database migration is applied." } };
    }

    if (!complaint) {
      return { status: 404, body: { message: "Complaint not found." } };
    }


    const currentStatus = normalizeGrievanceStatus(complaint.grievanceStatus) || "PHASE_1";
    const currentIndex = GRIEVANCE_PHASE_SEQUENCE.indexOf(currentStatus);
    const nextIndex = GRIEVANCE_PHASE_SEQUENCE.indexOf(nextStatus);

    if (nextIndex !== currentIndex + 1) {
      return {
        status: 400,
        body: { message: `Invalid grievance phase transition from ${currentStatus} to ${nextStatus}.` },
      };
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: { grievanceStatus: nextStatus },
      select: COMPLAINT_SAFE_SELECT,
    }).catch((error) => {
      if (isMissingGrievanceStatusColumn(error)) {
        return { __missingGrievanceColumn: true };
      }

      throw error;
    });

    if (updated?.__missingGrievanceColumn) {
      return { status: 400, body: { message: "Grievance phase tracking is not available until database migration is applied." } };
    }

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        complaintId,
        action: "GRIEVANCE_PHASE_UPDATED",
        entityType: "COMPLAINT",
        entityId: complaintId,
        description: `Grievance phase moved to ${nextStatus}.`,
      },
    });

    await notifyUser(
      prisma,
      updated.createdById,
      "COMPLAINT",
      "Grievance phase updated",
      `Your grievance has moved to ${nextStatus.replace("_", " ")}.`,
      {
        route: `/student/submission/${updated.id}`,
        entityType: "COMPLAINT",
        entityId: updated.id,
      },
    );

    return { status: 200, body: { message: "Grievance phase updated.", complaint: updated } };
  }

  return {
    createGrievance,
    createComplaint,
    listComplaints,
    getComplaint,
    assignComplaint,
    updateComplaintStatus,
    updateGrievanceStatus,
  };
}
