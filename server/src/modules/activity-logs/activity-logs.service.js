export function createActivityLogsService({ prisma }) {
  async function listLogs(query) {
    const entityType = query?.entityType ? String(query.entityType) : undefined;
    const actorId = query?.actorId ? String(query.actorId) : undefined;
    const limit = Math.min(Number(query?.limit || 50), 200);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const where = {
      ...(entityType ? { entityType } : {}),
      ...(actorId ? { actorId } : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, name: true, role: true } },
          targetUser: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    return { status: 200, body: { total, page, limit, items } };
  }

  return { listLogs };
}
