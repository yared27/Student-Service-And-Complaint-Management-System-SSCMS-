import { Router } from "express";
import { handleUploadImages } from "../middlewares/upload.middleware.js";
import { createUploadsController } from "../modules/uploads/uploads.controller.js";

/**
 * @openapi
 * /api/uploads/images:
 *   post:
 *     summary: Upload image files to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded
 */
export function createUploadsRouter({ auth }) {
  const router = Router();
  const controller = createUploadsController();

  router.post("/images", auth.authenticate, handleUploadImages, controller.uploadImages);

  return router;
}
