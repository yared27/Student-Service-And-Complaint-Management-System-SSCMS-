import {
  changePassword,
  forgotPassword,
  login,
  logout,
  logoutAll,
  refreshSession,
  registerStudent,
  resetPassword,
} from "./auth.service.js";

export function createAuthController({ prisma, jwtSecret, refreshTokenSecret }) {
  return {
    registerStudent: async (req, res) => {
      try {
        const result = await registerStudent(prisma, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Register student failed:", error);
        return res.status(500).json({ message: "Failed to register student account." });
      }
    },

    login: async (req, res) => {
      try {
        const result = await login(prisma, req.body, jwtSecret, refreshTokenSecret, {
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ message: "Failed to login." });
      }
    },

    refresh: async (req, res) => {
      try {
        const result = await refreshSession(prisma, req.body, jwtSecret, refreshTokenSecret, {
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Refresh session failed:", error);
        return res.status(500).json({ message: "Failed to refresh session." });
      }
    },

    logout: async (req, res) => {
      try {
        const result = await logout(prisma, req.body, refreshTokenSecret);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Logout failed:", error);
        return res.status(500).json({ message: "Failed to logout." });
      }
    },

    logoutAll: async (req, res) => {
      try {
        const result = await logoutAll(prisma, req.user?.sub);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Logout all failed:", error);
        return res.status(500).json({ message: "Failed to logout from all sessions." });
      }
    },

    forgotPassword: async (req, res) => {
      try {
        const result = await forgotPassword(prisma, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Forgot password failed:", error);
        return res.status(500).json({ message: "Failed to process forgot password." });
      }
    },

    resetPassword: async (req, res) => {
      try {
        const result = await resetPassword(prisma, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Reset password failed:", error);
        return res.status(500).json({ message: "Failed to reset password." });
      }
    },

    changePassword: async (req, res) => {
      try {
        const result = await changePassword(prisma, req.user?.sub, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Change password failed:", error);
        return res.status(500).json({ message: "Failed to change password." });
      }
    },
  };
}
