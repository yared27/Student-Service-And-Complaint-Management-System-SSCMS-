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

    listUsers: async (req, res) => {
      try {
        const result = await service.listUsers(req.query);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("List users failed:", error);
        return res.status(500).json({ message: "Failed to list users." });
      }
    },
  };
}
