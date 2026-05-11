import { Router } from "express";
import { createStudentImportController } from "../modules/student-import/student-import.controller.js";
import { uploadFile } from "../middlewares/upload.middleware.js";

export function createStudentImportRouter({ prisma, auth }) {
  const router = Router();
  const controller = createStudentImportController({ prisma });

  router.use(auth.authenticate, auth.authorizeRoles("ADMIN"));

  router.post("/upload", uploadFile, controller.uploadStudents);
  router.get("/history", controller.listImportHistory);
  router.get("/history/:id", controller.getImportBatch);

  return router;
}
