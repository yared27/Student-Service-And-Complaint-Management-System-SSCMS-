import { Router } from "express";
import { createServiceRequestsController } from "../modules/service-requests/service-requests.controller.js";

/**
 * @openapi
 * /api/service-requests:
 *   post:
 *     summary: Create service request
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 *   get:
 *     summary: List service requests
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List
 *
 * /api/service-requests/{id}:
 *   get:
 *     summary: Get service request detail
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Details
 *
 * /api/service-requests/{id}/assignment:
 *   patch:
 *     summary: Assign a service request to field staff
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assigned
 *
 * /api/service-requests/{id}/status:
 *   patch:
 *     summary: Update service request status
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated
 */
export function createServiceRequestsRouter({ prisma, auth }) {
  const router = Router();
  const controller = createServiceRequestsController({ prisma });

  router.post("/ai-suggest", auth.authenticate, controller.aiSuggest);
  router.post("/", auth.authenticate, controller.createRequest);
  router.get("/", auth.authenticate, controller.listRequests);
  router.get("/:id", auth.authenticate, controller.getRequest);

  router.patch(
    "/:id/assignment",
    auth.authenticate,
    auth.authorizeRoles("SERVICE_MANAGER", "COMPLAINT_MANAGER", "ADMIN"),
    controller.assignRequest,
  );

  router.patch(
    "/:id/status",
    auth.authenticate,
    auth.authorizeRoles("STUDENT", "STAFF", "SERVICE_MANAGER", "COMPLAINT_MANAGER", "ADMIN"),
    controller.updateRequestStatus,
  );

  return router;
}
