import { Router } from "express";
import { createComplaintsController } from "../modules/complaints/complaints.controller.js";

/**
 * @openapi
 * /api/complaints:
 *   post:
 *     summary: Create complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *     responses:
 *       201:
 *         description: Complaint created
 *   get:
 *     summary: List complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complaint list
 *
 * /api/complaints/{id}:
 *   get:
 *     summary: Get complaint detail
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint details
 *
 * /api/complaints/{id}/assignment:
 *   patch:
 *     summary: Assign complaint to investigator
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complaint assigned
 *
 * /api/complaints/{id}/status:
 *   patch:
 *     summary: Update complaint status (manager/admin/investigator)
 *     tags: [Complaints]
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
 *                 enum: [SUBMITTED, UNDER_REVIEW, IN_PROGRESS, RESOLVED, REJECTED]
 *               assignedToId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint updated
 */
export function createComplaintsRouter({ prisma, auth }) {
  const router = Router();
  const controller = createComplaintsController({ prisma });

  router.post("/", auth.authenticate, controller.createComplaint);
  router.get("/", auth.authenticate, controller.listComplaints);
  router.get("/:id", auth.authenticate, controller.getComplaint);

  router.patch(
    "/:id/assignment",
    auth.authenticate,
    auth.authorizeRoles("SERVICE_MANAGER", "COMPLAINT_MANAGER", "ADMIN"),
    controller.assignComplaint,
  );

  router.patch(
    "/:id/status",
    auth.authenticate,
    auth.authorizeRoles("SERVICE_MANAGER", "COMPLAINT_MANAGER", "INVESTIGATOR", "ADMIN"),
    controller.updateComplaintStatus,
  );

  return router;
}
