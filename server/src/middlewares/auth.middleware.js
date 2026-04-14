import jwt from "jsonwebtoken";

export function createAuthMiddleware({ jwtSecret }) {
  function authenticate(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Missing or invalid authorization token." });
    }

    try {
      const payload = jwt.verify(token, jwtSecret);
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
