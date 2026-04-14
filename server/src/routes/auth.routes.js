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
 */
export function createAuthRouter(deps) {
  const router = Router();
  const controller = createAuthController(deps);

  router.post("/register-student", controller.registerStudent);
  router.post("/login", controller.login);

  return router;
}
