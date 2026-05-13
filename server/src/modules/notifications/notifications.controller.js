import { createNotificationsService } from "./notifications.service.js";

const NOTIFICATION_ROLES = new Set(["STUDENT", "SERVICE_MANAGER", "COMPLAINT_MANAGER", "FIELD_STAFF", "STAFF", "INVESTIGATOR"]);

export function createNotificationsController({ prisma }) {
  const service = createNotificationsService({ prisma });

  function assertAllowedRole(req, res) {
    const role = String(req.user?.role || "").toUpperCase();

    if (!NOTIFICATION_ROLES.has(role)) {
      res.status(403).json({ message: "Notifications are not available for this role." });
      return false;
    }

    return true;
  }

  return {
    unreadCount: async (req, res) => {
      try {
        if (!assertAllowedRole(req, res)) {
          return;
        }

        const result = await service.countUnreadNotifications({ userId: req.user?.sub });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Count unread notifications failed:", error);
        return res.status(500).json({ message: "Failed to fetch notification count." });
      }
    },

    listMyNotifications: async (req, res) => {
      try {
        if (!assertAllowedRole(req, res)) {
          return;
        }

        const result = await service.listMyNotifications({ userId: req.user?.sub, query: req.query });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("List notifications failed:", error);
        return res.status(500).json({ message: "Failed to fetch notifications." });
      }
    },

    markAsRead: async (req, res) => {
      try {
        if (!assertAllowedRole(req, res)) {
          return;
        }

        const result = await service.markAsRead({ userId: req.user?.sub, notificationId: req.params.id });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Mark notification failed:", error);
        return res.status(500).json({ message: "Failed to mark notification." });
      }
    },

    markAllRead: async (req, res) => {
      try {
        if (!assertAllowedRole(req, res)) {
          return;
        }

        const result = await service.markAllRead({ userId: req.user?.sub });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Mark all notifications failed:", error);
        return res.status(500).json({ message: "Failed to mark notifications." });
      }
    },
  };
}
