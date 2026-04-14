export function createNotificationsService({ prisma }) {
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
      }),
    ]);

    return { status: 200, body: { total, page, limit, items } };
  }

  async function markAsRead({ userId, notificationId }) {
    const item = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!item || item.userId !== userId) {
      return { status: 404, body: { message: "Notification not found." } };
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { status: 200, body: { message: "Notification marked as read.", notification: updated } };
  }

  async function markAllRead({ userId }) {
    const updated = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { status: 200, body: { message: "All notifications marked as read.", count: updated.count } };
  }

  return {
    listMyNotifications,
    markAsRead,
    markAllRead,
  };
}
