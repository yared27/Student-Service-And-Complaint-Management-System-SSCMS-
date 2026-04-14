export function createUsersService({ prisma }) {
  async function getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        campus: true,
        department: true,
        phone: true,
        profileImage: true,
        strikeCount: true,
        isFlagged: true,
        suspensionEndsAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { status: 404, body: { message: "User not found." } };
    }

    return { status: 200, body: { user } };
  }

  async function updateMe(userId, payload) {
    const data = {
      name: payload?.name ? String(payload.name).trim() : undefined,
      phone: payload?.phone !== undefined ? String(payload.phone).trim() || null : undefined,
      profileImage: payload?.profileImage !== undefined ? String(payload.profileImage).trim() || null : undefined,
      department: payload?.department ? String(payload.department).trim() : undefined,
    };

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        campus: true,
        department: true,
        phone: true,
        profileImage: true,
      },
    });

    return {
      status: 200,
      body: {
        message: "Profile updated.",
        user: updated,
      },
    };
  }

  async function listUsers(query) {
    const role = query?.role ? String(query.role) : undefined;
    const status = query?.status ? String(query.status) : undefined;
    const search = query?.search ? String(query.search).trim() : undefined;
    const limit = Math.min(Number(query?.limit || 20), 100);
    const page = Math.max(Number(query?.page || 1), 1);
    const skip = (page - 1) * limit;

    const where = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          status: true,
          campus: true,
          department: true,
          strikeCount: true,
          isFlagged: true,
          createdAt: true,
        },
      }),
    ]);

    return { status: 200, body: { total, page, limit, items } };
  }

  return {
    getMe,
    updateMe,
    listUsers,
  };
}
