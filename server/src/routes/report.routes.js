import { Router } from "express";
import { createMisuseReportController } from "../modules/reports/misuse-report.controller.js";

/**
 * @openapi
 * /api/reports/misuse:
 *   post:
 *     summary: Create misuse report against a student
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reportedUserId, reason]
 *             properties:
 *               reportedUserId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 enum: [SPAM, ABUSIVE_LANGUAGE, FALSE_INFORMATION, DUPLICATE_SPAM, OTHER]
 *               details:
 *                 type: string
 *               complaintId:
 *                 type: string
 *               serviceRequestId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Role forbidden
 *
 *   get:
 *     summary: List misuse reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *       - in: query
 *         name: reportedUserId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reports list
 *
 * /api/reports/misuse/{id}/review:
 *   patch:
 *     summary: Review misuse report and optionally take action on student
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [REVIEWED, ACTION_TAKEN, DISMISSED]
 *               actionTaken:
 *                 type: string
 *                 enum: [NONE, WARNING, TEMP_SUSPENSION, PERMANENT_BAN]
 *               suspensionDays:
 *                 type: integer
 *               details:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report reviewed
 *       404:
 *         description: Report not found
 */
export function createReportRouter({ prisma, auth }) {
  const router = Router();
  const controller = createMisuseReportController({ prisma });

  router.post(
    "/misuse",
    auth.authenticate,
    auth.authorizeRoles("SERVICE_MANAGER", "COMPLAINT_MANAGER"),
    controller.createReport,
  );

  router.get(
    "/misuse",
    auth.authenticate,
    auth.authorizeRoles("SERVICE_MANAGER", "COMPLAINT_MANAGER", "ADMIN"),
    controller.listReports,
  );

  router.patch(
    "/misuse/:id/review",
    auth.authenticate,
    auth.authorizeRoles("SERVICE_MANAGER", "COMPLAINT_MANAGER", "ADMIN"),
    controller.reviewReport,
  );

  return router;
}
