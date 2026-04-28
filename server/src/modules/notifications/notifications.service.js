export function createNotificationsService({ prisma }) {
  function normalizeNotification(item) {
    return {
      id: item.id,
      userId: item.userId,
      type: item.type,
      title: item.title || item.type || "Notification",
      message: item.message,
      isRead: item.isRead,
      createdAt: item.createdAt,
      route: null,
      entityType: null,
      entityId: null,
    };
  }

  async function countUnreadNotifications({ userId }) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { status: 200, body: { count } };
  }

  async function listMyNotifications({ userId, query }) {
    const unreadOnly = String(query?.unreadOnly || "false") === "true";
    const limit = Math.min(Number(query?.limit || 30), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          createdAt: true,
        },
      }),
    ]);

    return { status: 200, body: { total, page, limit, items: items.map(normalizeNotification) } };
  }

  async function markAsRead({ userId, notificationId }) {
    const item = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true },
    });

    if (!item || item.userId !== userId) {
      return { status: 404, body: { message: "Notification not found." } };
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
      },
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        message: true,
        isRead: true,
        createdAt: true,
      },
    });

    return { status: 200, body: { message: "Notification marked as read.", notification: normalizeNotification(updated) } };
  }

  async function markAllRead({ userId }) {
    const updated = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
      },
    });

    return { status: 200, body: { message: "All notifications marked as read.", count: updated.count } };
  }

  return {
    countUnreadNotifications,
    listMyNotifications,
    markAsRead,
    markAllRead,
  };
}
