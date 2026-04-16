import { Router } from "express";
import { createAuthController } from "../modules/auth/auth.controller.js";

/**
 * @openapi
 * /api/auth/register-student:
 *   post:
 *     summary: Register a student account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, studentId, campus, password]
 *             properties:
 *               fullName:
 *                 type: string
 *               studentId:
 *                 type: string
 *               campus:
 *                 type: string
 *               department:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student registered
 *
 * /api/auth/login:
 *   post:
 *     summary: Login with identity credentials
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identity, identifier, password]
 *             properties:
 *               identity:
 *                 type: string
 *                 enum: [student, staff, field, investigator]
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *               rememberMe:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *
 * /api/auth/logout:
 *   post:
 *     summary: Revoke current refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *
 * /api/auth/logout-all:
 *   post:
 *     summary: Revoke all sessions for current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset token
 *     tags: [Auth]
 *
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using reset token
 *     tags: [Auth]
 *
 * /api/auth/change-password:
 *   post:
 *     summary: Change password for current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
export function createAuthRouter(deps) {
  const router = Router();
  const controller = createAuthController(deps);
  const auth = deps.auth;

  router.post("/register-student", controller.registerStudent);
  router.post("/login", controller.login);
  router.post("/refresh", controller.refresh);
  router.post("/logout", controller.logout);
  router.post("/forgot-password", controller.forgotPassword);
  router.post("/reset-password", controller.resetPassword);
  router.post("/logout-all", auth.authenticate, controller.logoutAll);
  router.post("/change-password", auth.authenticate, controller.changePassword);

  return router;
}
