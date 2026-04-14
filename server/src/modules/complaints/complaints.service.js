function canManageComplaint(role) {
  return ["SERVICE_MANAGER", "COMPLAINT_MANAGER", "ADMIN"].includes(role);
}

function canWorkComplaint(role) {
  return ["SERVICE_MANAGER", "COMPLAINT_MANAGER", "INVESTIGATOR", "ADMIN"].includes(role);
}

function canViewAllComplaints(role) {
  return ["SERVICE_MANAGER", "COMPLAINT_MANAGER", "ADMIN"].includes(role);
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

export function createComplaintsService({ prisma }) {
  async function createComplaint({ userId, payload }) {
    const title = String(payload?.title || "").trim();
    const description = String(payload?.description || "").trim();
    const priority = payload?.priority ? String(payload.priority) : "MEDIUM";

    if (!title || !description) {
      return { status: 400, body: { message: "title and description are required." } };
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        priority,
        createdById: userId,
      },
    });

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

  async function listComplaints({ userId, role, query }) {
    const status = query?.status ? String(query.status) : undefined;
    const priority = query?.priority ? String(query.priority) : undefined;
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(canViewAllComplaints(role)
        ? {}
        : role === "INVESTIGATOR"
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
        include: {
          createdBy: { select: { id: true, name: true, username: true } },
          assignedTo: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    return { status: 200, body: { total, page, limit, items } };
  }

  async function getComplaint({ userId, role, complaintId }) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
      },
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
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
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

    if (!assignee || !["INVESTIGATOR", "COMPLAINT_MANAGER"].includes(assignee.role)) {
      return { status: 400, body: { message: "Complaints can only be assigned to investigators or complaint managers." } };
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        assignedToId,
        status: complaint.status === "SUBMITTED" ? "UNDER_REVIEW" : complaint.status,
      },
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
      },
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

    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
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

      if (!assignee || !["INVESTIGATOR", "COMPLAINT_MANAGER"].includes(assignee.role)) {
        return { status: 400, body: { message: "Complaints can only be assigned to investigators or complaint managers." } };
      }
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status,
        ...(role !== "INVESTIGATOR" && assignedToId ? { assignedToId } : {}),
        resolvedAt: ["RESOLVED", "REJECTED"].includes(status) ? new Date() : null,
      },
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
      },
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
      );
    }

    return { status: 200, body: { message: "Complaint updated.", complaint: updated } };
  }

  return {
    createComplaint,
    listComplaints,
    getComplaint,
    assignComplaint,
    updateComplaintStatus,
  };
}
