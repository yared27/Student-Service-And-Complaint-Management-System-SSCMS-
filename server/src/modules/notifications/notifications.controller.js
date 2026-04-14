import { createNotificationsService } from "./notifications.service.js";

export function createNotificationsController({ prisma }) {
  const service = createNotificationsService({ prisma });

  return {
    listMyNotifications: async (req, res) => {
      try {
        const result = await service.listMyNotifications({ userId: req.user?.sub, query: req.query });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("List notifications failed:", error);
        return res.status(500).json({ message: "Failed to fetch notifications." });
      }
    },

    markAsRead: async (req, res) => {
      try {
        const result = await service.markAsRead({ userId: req.user?.sub, notificationId: req.params.id });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Mark notification failed:", error);
        return res.status(500).json({ message: "Failed to mark notification." });
      }
    },

    markAllRead: async (req, res) => {
      try {
        const result = await service.markAllRead({ userId: req.user?.sub });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Mark all notifications failed:", error);
        return res.status(500).json({ message: "Failed to mark notifications." });
      }
    },
  };
}
