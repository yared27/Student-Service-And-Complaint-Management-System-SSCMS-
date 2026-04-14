import { Router } from "express";
import { createUsersController } from "../modules/users/users.controller.js";

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current profile
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               profileImage:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *
 * /api/users:
 *   get:
 *     summary: List users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
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
 *         description: Users list
 */
export function createUsersRouter({ prisma, auth }) {
  const router = Router();
  const controller = createUsersController({ prisma });

  router.get("/me", auth.authenticate, controller.getMe);
  router.patch("/me", auth.authenticate, controller.updateMe);

  router.get(
    "/",
    auth.authenticate,
    auth.authorizeRoles("ADMIN", "SERVICE_MANAGER", "COMPLAINT_MANAGER"),
    controller.listUsers,
  );

  return router;
}
