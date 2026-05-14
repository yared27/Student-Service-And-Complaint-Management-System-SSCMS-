import { createUsersService } from "./users.service.js";

export function createUsersController({ prisma }) {
  const service = createUsersService({ prisma });

  return {
    getMe: async (req, res) => {
      try {
        const result = await service.getMe(req.user?.sub);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Get profile failed:", error);
        return res.status(500).json({ message: "Failed to fetch profile." });
      }
    },

    updateMe: async (req, res) => {
      try {
        const result = await service.updateMe(req.user?.sub, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Update profile failed:", error);
        return res.status(500).json({ message: "Failed to update profile." });
      }
    },

    updateProfileImage: async (req, res) => {
      try {
        const result = await service.updateProfileImage(req.user?.sub, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Update profile image failed:", error);
        return res.status(500).json({ message: "Failed to update profile image." });
      }
    },

    changePassword: async (req, res) => {
      try {
        const result = await service.changePassword(req.user?.sub, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Change password failed:", error);
        return res.status(500).json({ message: "Failed to change password." });
      }
    },

    changePasswordOnFirstLogin: async (req, res) => {
      try {
        const result = await service.changePasswordOnFirstLogin(req.user?.sub, req.body);
        // TEMP LOG: help debug client-side mismatch where frontend reports failure
        console.log("[DEBUG] changePasswordOnFirstLogin -> status:", result?.status, "body:", result?.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Change password on first login failed:", error);
        return res.status(500).json({ message: "Failed to change password." });
      }
    },

    listUsers: async (req, res) => {
      try {
        const result = await service.listUsers({
          query: req.query,
          actorId: req.user?.sub,
          actorRole: req.user?.role,
        });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("List users failed:", error);
        return res.status(500).json({ message: "Failed to list users." });
      }
    },

    listAdminUsers: async (req, res) => {
      try {
        const result = await service.listAdminUsers(req.query);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("List admin users failed:", error);
        return res.status(500).json({ message: "Failed to list admin users." });
      }
    },

    listAdminReports: async (req, res) => {
      try {
        const result = await service.listAdminReports(req.query);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("List admin reports failed:", error);
        return res.status(500).json({ message: "Failed to fetch reports." });
      }
    },

    moderateAdminReport: async (req, res) => {
      try {
        const result = await service.moderateAdminReport(req.params.id, {
          ...req.body,
          reviewedById: req.user?.sub,
        });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Moderate admin report failed:", error);
        return res.status(500).json({ message: "Failed to moderate report." });
      }
    },

    moderateUser: async (req, res) => {
      try {
        const result = await service.moderateUser(req.params.id, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Moderate user failed:", error);
        return res.status(500).json({ message: "Failed to moderate user." });
      }
    },

    getAdminAnalytics: async (req, res) => {
      try {
        const result = await service.getAdminAnalytics();
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Get admin analytics failed:", error);
        return res.status(500).json({ message: "Failed to fetch analytics." });
      }
    },

    getAdminAnalyticsServices: async (req, res) => {
      try {
        const result = await service.getAdminAnalyticsServices();
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Get admin services analytics failed:", error);
        return res.status(500).json({ message: "Failed to fetch services analytics." });
      }
    },

    getAdminAnalyticsComplaints: async (req, res) => {
      try {
        const result = await service.getAdminAnalyticsComplaints();
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Get admin complaints analytics failed:", error);
        return res.status(500).json({ message: "Failed to fetch complaints analytics." });
      }
    },

    getAdminAnalyticsUsers: async (req, res) => {
      try {
        const result = await service.getAdminAnalyticsUsers();
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Get admin users analytics failed:", error);
        return res.status(500).json({ message: "Failed to fetch user analytics." });
      }
    },

    createUser: async (req, res) => {
      try {
        const result = await service.createUser({ payload: req.body, actorId: req.user?.sub, actorRole: req.user?.role });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Create user failed:", error);
        return res.status(500).json({ message: "Failed to create user." });
      }
    },

    updateUser: async (req, res) => {
      try {
        const result = await service.updateUser(req.params.id, { payload: req.body, actorId: req.user?.sub, actorRole: req.user?.role });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Update user failed:", error);
        return res.status(500).json({ message: "Failed to update user." });
      }
    },

    createAdminUser: async (req, res) => {
      try {
        const result = await service.createAdminUser(req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Create admin user failed:", error);
        return res.status(500).json({ message: "Failed to create user." });
      }
    },

    updateAdminUser: async (req, res) => {
      try {
        const result = await service.updateAdminUser(req.params.id, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Update admin user failed:", error);
        return res.status(500).json({ message: "Failed to update user." });
      }
    },

    exportAdminUsersCsv: async (req, res) => {
      try {
        const result = await service.exportAdminUsersCsv(req.query);
        if (result.status !== 200) {
          return res.status(result.status).json(result.body);
        }

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${result.body.filename}"`);
        return res.status(200).send(result.body.csv);
      } catch (error) {
        console.error("Export admin users failed:", error);
        return res.status(500).json({ message: "Failed to export users." });
      }
    },
  };
}
