import { Router } from "express";
import { createNotificationsController } from "../modules/notifications/notifications.controller.js";

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: List current user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification list
 *
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark one notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated
 *
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated
 */
export function createNotificationsRouter({ prisma, auth }) {
  const router = Router();
  const controller = createNotificationsController({ prisma });

  router.get("/unread-count", auth.authenticate, controller.unreadCount);
  router.get("/", auth.authenticate, controller.listMyNotifications);
  router.patch("/:id/read", auth.authenticate, controller.markAsRead);
  router.patch("/read-all", auth.authenticate, controller.markAllRead);

  return router;
}
