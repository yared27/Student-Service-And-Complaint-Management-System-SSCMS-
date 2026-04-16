function canManageRequest(role) {
  return ["SERVICE_MANAGER", "COMPLAINT_MANAGER", "ADMIN"].includes(role);
}

function canWorkRequest(role) {
  return ["STAFF", "SERVICE_MANAGER", "COMPLAINT_MANAGER", "ADMIN"].includes(role);
}

function isTerminalStatus(status) {
  return ["COMPLETED", "REJECTED"].includes(status);
}

async function notifyUser(prisma, userId, type, title, message) {
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

export function createServiceRequestsService({ prisma }) {
  async function createRequest({ userId, payload }) {
    const title = String(payload?.title || "").trim();
    const description = String(payload?.description || "").trim();
    const attachmentUrls = Array.isArray(payload?.attachmentUrls)
      ? payload.attachmentUrls
          .map((value) => String(value || "").trim())
          .filter(Boolean)
      : [];
    const priority = payload?.priority ? String(payload.priority) : "MEDIUM";

    if (!title || !description) {
      return { status: 400, body: { message: "title and description are required." } };
    }

    const finalDescription = attachmentUrls.length
      ? `${description}\n\nAttachments:\n${attachmentUrls.join("\n")}`
      : description;

    const request = await prisma.serviceRequest.create({
      data: {
        title,
        description: finalDescription,
        priority,
        createdById: userId,
      },
    });

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

    return { status: 201, body: { message: "Service request submitted.", serviceRequest: request } };
  }

  async function listRequests({ userId, role, query }) {
    const status = query?.status ? String(query.status) : undefined;
    const priority = query?.priority ? String(query.priority) : undefined;
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(canManageRequest(role) ? {} : { OR: [{ createdById: userId }, { assignedToId: userId }] }),
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
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
      },
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

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        assignedToId,
      },
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
    );

    return { status: 200, body: { message: "Service request assigned.", serviceRequest: updated } };
  }

  async function updateRequestStatus({ userId, role, requestId, payload }) {
    const status = String(payload?.status || "").trim();
    const assignedToId = payload?.assignedToId ? String(payload.assignedToId) : undefined;

    if (!status) {
      return { status: 400, body: { message: "status is required." } };
    }

    if (!canWorkRequest(role)) {
      return { status: 403, body: { message: "You are not allowed to update service requests." } };
    }

    const existing = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!existing) {
      return { status: 404, body: { message: "Service request not found." } };
    }

    if (role === "STAFF") {
      if (existing.assignedToId !== userId) {
        return { status: 403, body: { message: "You can only update requests assigned to you." } };
      }

      if (!["IN_PROGRESS", "COMPLETED"].includes(status)) {
        return {
          status: 400,
          body: { message: "Field staff can only move requests to IN_PROGRESS or COMPLETED." },
        };
      }

      if (status === "COMPLETED" && existing.status !== "IN_PROGRESS") {
        return { status: 400, body: { message: "Start the request before marking it completed." } };
      }
    }

    if (role !== "STAFF" && assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, name: true, role: true },
      });

      if (!assignee || assignee.role !== "STAFF") {
        return { status: 400, body: { message: "Service requests can only be assigned to field staff." } };
      }
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status,
        ...(role !== "STAFF" && assignedToId ? { assignedToId } : {}),
        resolvedAt: isTerminalStatus(status) ? new Date() : null,
      },
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        serviceRequestId: requestId,
        action: "SERVICE_REQUEST_STATUS_UPDATED",
        entityType: "SERVICE_REQUEST",
        entityId: requestId,
        description: `Service request status updated to ${status}.`,
      },
    });

    if (updated.assignedToId && updated.status === "COMPLETED") {
      await notifyUser(
        prisma,
        updated.createdById,
        "SERVICE_REQUEST",
        "Service request completed",
        `Your service request \"${updated.title}\" has been completed.`,
      );
    }

    return { status: 200, body: { message: "Service request updated.", serviceRequest: updated } };
  }

  return {
    createRequest,
    listRequests,
    getRequest,
    assignRequest,
    updateRequestStatus,
  };
}
