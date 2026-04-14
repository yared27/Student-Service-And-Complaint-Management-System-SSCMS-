import { Router } from "express";
import { createActivityLogsController } from "../modules/activity-logs/activity-logs.controller.js";

/**
 * @openapi
 * /api/activity-logs:
 *   get:
 *     summary: List activity logs
 *     tags: [ActivityLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity logs list
 */
export function createActivityLogsRouter({ prisma, auth }) {
  const router = Router();
  const controller = createActivityLogsController({ prisma });

  router.get(
    "/",
    auth.authenticate,
    auth.authorizeRoles("ADMIN", "SERVICE_MANAGER", "COMPLAINT_MANAGER"),
    controller.listLogs,
  );

  return router;
}
