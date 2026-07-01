import { predictRequestAdvisory } from "../../services/aiService.js";

function canManageRequest(role) {
  return ["SERVICE_MANAGER", "ADMIN"].includes(role);
}

function normalizeServiceType(value) {
  const raw = String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_");

  const aliases = {
    DORM: "DORMITORY",
    DORMS: "DORMITORY",
    MAINTENANCE: "UTILITIES",
    CLEANING: "UTILITIES",
    IT: "ICT",
    IT_SUPPORT: "ICT",
    TRANSPORTATION: "TRANSPORT",
  };

  const normalized = aliases[raw] || raw;
  const allowed = new Set([
    "DORMITORY",
    "CAFETERIA",
    "ICT",
    "LIBRARY",
    "CLASSROOM",
    "LABORATORY",
    "UTILITIES",
    "TRANSPORT",
  ]);

  return allowed.has(normalized) ? normalized : null;
}

function isTerminalStatus(status) {
  return ["COMPLETED", "REJECTED"].includes(status);
}

function normalizePriority(value) {
  const normalized = String(value || "").trim().toUpperCase();
  const allowed = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);
  return allowed.has(normalized) ? normalized : null;
}

function canRetryWithoutAiColumns(error) {
  if (error?.code === "P2022") {
    const missingColumn = String(error?.meta?.column || "");
    return missingColumn.includes("ServiceRequest.type")
      || missingColumn.includes("ServiceRequest.category")
      || missingColumn.includes("ServiceRequest.isDuplicate")
      || missingColumn.includes("ServiceRequest.duplicateScore");
  }

  const message = String(error?.message || "");
  return message.includes("Unknown argument `type`")
    || message.includes("Unknown argument `category`")
    || message.includes("Unknown argument `isDuplicate`")
    || message.includes("Unknown argument `duplicateScore`");
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
      route: extra.route || null,
      entityType: extra.entityType || null,
      entityId: extra.entityId || null,
    },
  });
}

async function pickServiceManagerForType(prisma, serviceType) {
  const managers = await prisma.serviceManager.findMany({
    where: {
      OR: [{ category: serviceType }, { serviceType }],
      user: {
        role: "SERVICE_MANAGER",
        status: { in: ["ACTIVE", "WARNED"] },
      },
    },
    select: { id: true, userId: true },
  });

  if (!managers.length) {
    return null;
  }

  if (managers.length === 1) {
    return managers[0];
  }

  const withLoad = await Promise.all(
    managers.map(async (manager) => {
      const activeLoad = await prisma.serviceRequest.count({
        where: {
          assignedServiceManagerId: manager.id,
          status: { in: ["SUBMITTED", "IN_PROGRESS"] },
        },
      });

      return { ...manager, activeLoad };
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

export function createServiceRequestsService({ prisma }) {
  async function getAiSuggestion({ text }) {
    const cleanText = String(text || "").trim();
    if (!cleanText) {
      return { status: 400, body: { message: "text is required." } };
    }

    try {
      const advisory = await predictRequestAdvisory(cleanText);
      if (!advisory) {
        return { status: 422, body: { message: "Unable to generate AI suggestion for empty text." } };
      }

      // Return only priority and duplicate score per contract.
      return {
        status: 200,
        body: {
          success: true,
          data: {
            priority: advisory.priority,
            duplicate_score: advisory.duplicateScore,
            duplicate_label: advisory.duplicateScore > 0.7 ? "HIGH" : advisory.duplicateScore >= 0.4 ? "MEDIUM" : "LOW",
          },
        },
      };
    } catch (error) {
      return {
        status: 200,
        body: {
          success: false,
          data: null,
          message: error?.message || "AI service unavailable.",
        },
      };
    }
  }

  async function createServiceRequest({ userId, role, payload }) {
    const normalizedRole = String(role || "").toUpperCase();
    if (normalizedRole !== "STUDENT") {
      return { status: 403, body: { message: "Only students can submit service requests." } };
    }

    const title = String(payload?.title || "").trim();
    const description = String(payload?.description || "").trim();
    const attachmentUrls = Array.isArray(payload?.attachmentUrls)
      ? payload.attachmentUrls.map((value) => String(value || "").trim()).filter(Boolean)
      : [];
    // Students must not provide priority; ignore any incoming priority
    const rawServiceType = payload?.serviceType;

    if (!title || !description) {
      return { status: 400, body: { message: "title and description are required." } };
    }

    const textForAi = `${title}. ${description}`;
    let advisory = null;
    try {
      advisory = await predictRequestAdvisory(textForAi);
    } catch {
      advisory = null;
    }

    const serviceType = normalizeServiceType(rawServiceType);
    if (!serviceType) {
      return {
        status: 400,
        body: {
          message:
            "serviceType is required and must be one of: DORMITORY, CAFETERIA, ICT, LIBRARY, CLASSROOM, LABORATORY, UTILITIES, TRANSPORT.",
        },
      };
    }

    // Determine priority only from AI advisory (or default)
    const priority = normalizePriority(advisory?.priority) || "MEDIUM";

    // Duplicate blocking: if AI reports high similarity, block the submission
    if (advisory?.duplicateScore > 0.7) {
      return {
        status: 409,
        body: { message: "A similar request already exists. Please check existing requests." },
      };
    }

    const finalDescription = attachmentUrls.length
      ? `${description}\n\nAttachments:\n${attachmentUrls.join("\n")}`
      : description;
    let manager = await pickServiceManagerForType(prisma, serviceType);

    // Safety fallback: if profile linkage is missing, try category-based user fallback.
    if (!manager) {
      const fallbackUser = await prisma.user.findFirst({
        where: {
          role: "SERVICE_MANAGER",
          category: serviceType,
          status: { in: ["ACTIVE", "WARNED"] },
        },
        select: { id: true },
      });

      if (fallbackUser) {
        manager = await prisma.serviceManager.upsert({
          where: { serviceType },
          update: { userId: fallbackUser.id, category: serviceType },
          create: { userId: fallbackUser.id, serviceType, category: serviceType },
          select: { id: true, userId: true },
        });
      }
    }

    if (!manager) {
      return { status: 422, body: { message: "Service manager coverage is missing for this category. Run prisma seed to repair role coverage.", serviceType } };
    }

    const baseCreateData = {
      title,
      description: finalDescription,
      priority,
      serviceType,
      createdById: userId,
      assignedServiceManagerId: manager.id,
    };

    const aiCreateData = {
      type: "SERVICE",
      category: serviceType,
      // Do not accept category/type from AI anymore; category is derived from user `serviceType`.
      isDuplicate: Boolean(advisory?.isDuplicate),
      duplicateScore: Number(advisory?.duplicateScore || 0),
    };

    let request;
    try {
      request = await prisma.serviceRequest.create({
        data: {
          ...baseCreateData,
            ...aiCreateData,
        },
      });
    } catch (error) {
      if (!canRetryWithoutAiColumns(error)) {
        throw error;
      }

      request = await prisma.serviceRequest.create({
        data: baseCreateData,
      });
    }

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        serviceRequestId: request.id,
        action: "SERVICE_REQUEST_CREATED",
        entityType: "SERVICE_REQUEST",
        entityId: request.id,
        description: "Service request created.",
      },
    });

    await notifyUser(
      prisma,
      manager.userId,
      "SERVICE_REQUEST",
      "New routed service request",
      `A ${serviceType.toLowerCase()} request has been routed to your queue: ${request.title}`,
      {
        route: "/service-manager/requests",
        entityType: "SERVICE_REQUEST",
        entityId: request.id,
      },
    );

    return {
      status: 201,
      body: {
        message: "Service request submitted.",
        serviceRequest: request,
        aiAdvisory: advisory
          ? {
              priority: advisory.priority,
              duplicate_score: advisory.duplicateScore,
            }
          : null,
      },
    };
  }

  async function listRequests({ userId, role, category, query }) {
    const status = query?.status ? String(query.status) : undefined;
    const priority = query?.priority ? String(query.priority) : undefined;
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const normalizedRole = String(role || "").toUpperCase();
    let normalizedCategory = String(category || "").trim().toUpperCase();

    if (normalizedRole === "SERVICE_MANAGER" && !normalizedCategory) {
      const actor = await prisma.user.findUnique({
        where: { id: userId },
        select: { category: true, serviceManagerProfile: { select: { serviceType: true } } },
      });
      normalizedCategory = String(actor?.category || actor?.serviceManagerProfile?.serviceType || "").trim().toUpperCase();
    }

    const where = {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(normalizedRole === "SERVICE_MANAGER" && normalizedCategory
        ? { OR: [{ category: normalizedCategory }, { serviceType: normalizedCategory }] }
        : canManageRequest(normalizedRole)
          ? {}
          : { OR: [{ createdById: userId }, { assignedToId: userId }] }),
    };

    const [total, items] = await prisma.$transaction([
      prisma.serviceRequest.count({ where }),
      prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, name: true, username: true } },
          assignedTo: { select: { id: true, name: true, role: true } },
          assignedServiceManager: { select: { id: true, userId: true } },
          activityLogs: {
            take: 3,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              action: true,
              description: true,
              createdAt: true,
              actor: { select: { id: true, name: true, role: true, username: true } },
            },
          },
        },
      }),
    ]);

    return { status: 200, body: { total, page, limit, items } };
  }

  async function getRequest({ userId, role, requestId }) {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
        assignedServiceManager: { select: { id: true, userId: true } },
        activityLogs: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            action: true,
            description: true,
            createdAt: true,
            actor: { select: { id: true, name: true, role: true, username: true } },
          },
        },
      },
    });

    if (!request) {
      return { status: 404, body: { message: "Service request not found." } };
    }

    if (!canManageRequest(role) && request.createdById !== userId && request.assignedToId !== userId) {
      return { status: 403, body: { message: "Forbidden." } };
    }

    return { status: 200, body: { serviceRequest: request } };
  }

  async function assignRequest({ userId, role, requestId, payload }) {
    if (!canManageRequest(role)) {
      return { status: 403, body: { message: "Only managers/admin can assign service requests." } };
    }

    const assignedToId = String(payload?.assignedToId || "").trim();
    if (!assignedToId) {
      return { status: 400, body: { message: "assignedToId is required." } };
    }

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { createdBy: { select: { id: true, name: true, username: true } } },
    });

    if (!request) {
      return { status: 404, body: { message: "Service request not found." } };
    }

    if (request.status === "COMPLETED") {
      return { status: 400, body: { message: "Completed requests cannot be reassigned." } };
    }

    const assignee = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { id: true, name: true, role: true },
    });

    if (!assignee || assignee.role !== "STAFF") {
      return { status: 400, body: { message: "Service requests can only be assigned to field staff." } };
    }

    if (request.assignedToId === assignedToId) {
      return {
        status: 200,
        body: {
          message: `Service request is already assigned to ${assignee.name}.`,
          serviceRequest: request,
        },
      };
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { assignedToId },
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        serviceRequestId: requestId,
        action: "SERVICE_REQUEST_ASSIGNED",
        entityType: "SERVICE_REQUEST",
        entityId: requestId,
        description: `Service request assigned to ${assignee.name}.`,
      },
    });

    await notifyUser(
      prisma,
      assignedToId,
      "SERVICE_REQUEST",
      "New service request assignment",
      `You have been assigned to service request: ${updated.title}`,
      {
        route: "/field-staff/dashboard",
        entityType: "SERVICE_REQUEST",
        entityId: updated.id,
      },
    );

    return { status: 200, body: { message: "Service request assigned.", serviceRequest: updated } };
  }

  async function updateRequestStatus({ userId, role, requestId, payload }) {
    const status = String(payload?.status || "").trim();
    const assignedToId = payload?.assignedToId ? String(payload.assignedToId) : undefined;
    const reopen = payload?.reopen === true || String(payload?.reopen) === "true";
    const note = String(payload?.note || payload?.reason || "").trim();

    if (!status && !reopen) {
      return { status: 400, body: { message: "status is required." } };
    }

    const existing = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        assignedToId: true,
        status: true,
        createdById: true,
        canReopenUntil: true,
        assignedServiceManager: {
          select: { userId: true },
        },
      },
    });

    if (!existing) {
      return { status: 404, body: { message: "Service request not found." } };
    }

    // Handle student-initiated reopen within allowed window
    if (reopen) {
      if (existing.createdById !== userId) {
        return { status: 403, body: { message: "Only the request owner can reopen this request." } };
      }

      if (existing.status !== "COMPLETED") {
        return { status: 400, body: { message: "Only completed requests can be reopened." } };
      }

      if (!existing.canReopenUntil || new Date() > new Date(existing.canReopenUntil)) {
        return { status: 400, body: { message: "The reopen window has expired for this request." } };
      }

      const reopened = await prisma.serviceRequest.update({
        where: { id: requestId },
        data: {
          status: "SUBMITTED",
          isReopened: true,
          reopenedAt: new Date(),
          resolvedAt: null,
          completedAt: null,
          canReopenUntil: null,
        },
      });

      await prisma.activityLog.create({
        data: {
          actorId: userId,
          targetUserId: reopened.assignedServiceManager?.userId || null,
          serviceRequestId: requestId,
          action: "SERVICE_REQUEST_REOPENED",
          entityType: "SERVICE_REQUEST",
          entityId: requestId,
          description: `Service request was reopened by the requester.`,
        },
      });

      // Notify assigned manager and assigned staff
      if (reopened.assignedServiceManager?.userId) {
        await notifyUser(
          prisma,
          reopened.assignedServiceManager.userId,
          "SERVICE_REQUEST",
          "A request was reopened",
          `The request \"${reopened.title}\" was reopened by the student.`,
        );
      }

      if (reopened.assignedToId) {
        await notifyUser(
          prisma,
          reopened.assignedToId,
          "SERVICE_REQUEST",
          "A request was reopened",
          `The request \"${reopened.title}\" was reopened by the student.`,
        );
      }

      return { status: 200, body: { message: "Service request reopened.", serviceRequest: reopened } };
    }

    // STAFF (field worker) may only mark a request IN_PROGRESS (not finalize)
    if (role === "STAFF") {
      if (!existing || existing.assignedToId !== userId) {
        return { status: 403, body: { message: "You can only update requests assigned to you." } };
      }

      if (status !== "IN_PROGRESS") {
        return { status: 400, body: { message: "Field staff can only move requests to IN_PROGRESS." } };
      }
    }

    // Validate assignee when changed
    if (role !== "STAFF" && assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, name: true, role: true },
      });

      if (!assignee || assignee.role !== "STAFF") {
        return { status: 400, body: { message: "Service requests can only be assigned to field staff." } };
      }
    }

    // If finalizing (COMPLETED or REJECTED), only assigned service manager or ADMIN may do it
    if (["COMPLETED", "REJECTED"].includes(status)) {
      if (role === "SERVICE_MANAGER") {
        const managerUserId = existing.assignedServiceManager?.userId;
        if (!managerUserId || managerUserId !== userId) {
          return { status: 403, body: { message: "Only the assigned service manager can finalize this request." } };
        }
      }

      if (!["SERVICE_MANAGER", "ADMIN"].includes(role)) {
        return { status: 403, body: { message: "Only service managers or admins can finalize requests." } };
      }

    }

    const now = new Date();
    const completedAt = status === "COMPLETED" ? now : null;
    const canReopenUntil = status === "COMPLETED" ? new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) : null;

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status,
        ...(role !== "STAFF" && assignedToId ? { assignedToId } : {}),
        resolvedAt: isTerminalStatus(status) ? now : null,
        completedAt: completedAt,
        canReopenUntil: canReopenUntil,
      },
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
        assignedServiceManager: { select: { userId: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        serviceRequestId: requestId,
        action: "SERVICE_REQUEST_STATUS_UPDATED",
        entityType: "SERVICE_REQUEST",
        entityId: requestId,
        description: note
          ? `Service request status updated to ${status}. Note: ${note}`
          : `Service request status updated to ${status}.`,
      },
    });

    // Notify assigned manager when staff updates
    if (role === "STAFF" && updated.assignedServiceManager?.userId) {
      await notifyUser(
        prisma,
        updated.assignedServiceManager.userId,
        "SERVICE_REQUEST",
        "Field staff updated a task",
        note
          ? `Task "${updated.title}" was updated by field staff to ${status.toLowerCase().replaceAll("_", " ")}. Note: ${note}`
          : `Task "${updated.title}" was updated by field staff to ${status.toLowerCase().replaceAll("_", " ")}.`,
      );
    }

    // Notify student only when a manager finalizes the request
    if (updated.status === "COMPLETED" && ["SERVICE_MANAGER", "ADMIN"].includes(role)) {
      await notifyUser(
        prisma,
        updated.createdById,
        "SERVICE_REQUEST",
        "Service request completed",
        note
          ? `Your service request "${updated.title}" has been completed by the manager. Note: ${note}. You may reopen within 2 days if unresolved.`
          : `Your service request "${updated.title}" has been completed by the manager. You may reopen within 2 days if unresolved.`,
        {
          route: `/student/submission/${updated.id}`,
          entityType: "SERVICE_REQUEST",
          entityId: updated.id,
        },
      );
    }

    if (updated.status === "REJECTED" && ["SERVICE_MANAGER", "ADMIN"].includes(role)) {
      await notifyUser(
        prisma,
        updated.createdById,
        "SERVICE_REQUEST",
        "Service request rejected",
        note
          ? `Your service request "${updated.title}" has been rejected by the manager. Reason: ${note}`
          : `Your service request "${updated.title}" has been rejected by the manager.`,
        {
          route: `/student/submission/${updated.id}`,
          entityType: "SERVICE_REQUEST",
          entityId: updated.id,
        },
      );
    }

    return { status: 200, body: { message: "Service request updated.", serviceRequest: updated } };
  }

  return {
    getAiSuggestion,
    createServiceRequest,
    createRequest: createServiceRequest,
    listRequests,
    getRequest,
    assignRequest,
    updateRequestStatus,
  };
}
