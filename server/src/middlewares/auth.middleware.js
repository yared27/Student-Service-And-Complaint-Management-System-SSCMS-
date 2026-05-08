import jwt from "jsonwebtoken";

export function createAuthMiddleware({ jwtSecret, prisma }) {
  async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Missing or invalid authorization token." });
    }

    try {
      const payload = jwt.verify(token, jwtSecret);

      // If Prisma client is available, validate the user is still active and not banned.
      if (prisma && payload?.sub) {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, role: true, status: true, isActive: true, category: true, email: true, username: true },
        });

        if (!user) {
          return res.status(401).json({ message: "Unauthorized." });
        }

        if (String(user.status || "").toUpperCase() === "BANNED" || user.isActive === false) {
          return res.status(403).json({ message: "Access denied. Account banned or deactivated." });
        }

        req.user = { sub: user.id, role: user.role, status: user.status, isActive: user.isActive, category: user.category, email: user.email, username: user.username };
        return next();
      }

      req.user = payload;
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  }

  function authorizeRoles(...roles) {
    return (req, res, next) => {
      if (!req.user?.role) {
        return res.status(401).json({ message: "Unauthorized." });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden." });
      }

      return next();
    };
  }

  return {
    authenticate,
    authorizeRoles,
  };
}
