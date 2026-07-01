import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createReportRouter } from "./routes/report.routes.js";
import { createAdminUsersRouter, createUsersRouter } from "./routes/users.routes.js";
import { createStudentImportRouter } from "./routes/student-import.routes.js";
import { createComplaintsRouter } from "./routes/complaints.routes.js";
import { createServiceRequestsRouter } from "./routes/service-requests.routes.js";
import { createNotificationsRouter } from "./routes/notifications.routes.js";
import { createActivityLogsRouter } from "./routes/activity-logs.routes.js";
import { createUploadsRouter } from "./routes/uploads.routes.js";
import { createAuthMiddleware } from "./middlewares/auth.middleware.js";
import { swaggerSpec } from "./config/swagger.js";

const DEFAULT_CORS_ORIGINS = [
  "https://student-service-and-complaint-manag.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
];

const DEFAULT_ROUTE_GROUPS = [
  "auth",
  "reports",
  "users",
  "admin",
  "student-imports",
  "complaints",
  "service-requests",
  "notifications",
  "activity-logs",
  "uploads",
];

export function createApp({
  prisma,
  jwtSecret,
  refreshTokenSecret,
  corsOrigins = DEFAULT_CORS_ORIGINS,
  routes = DEFAULT_ROUTE_GROUPS,
} = {}) {
  const app = express();
  const auth = createAuthMiddleware({ jwtSecret, prisma });
  const enabledRoutes = new Set(routes);

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/api/docs.json", (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello World!" });
  });

  app.get("/api/health", async (_req, res) => {
    try {
      if (!prisma || typeof prisma.$queryRaw !== "function") {
        return res.status(200).json({ status: "ok" });
      }

      await prisma.$queryRaw`SELECT 1`;
      return res.status(200).json({ status: "ok" });
    } catch {
      return res.status(500).json({ status: "error" });
    }
  });

  if (enabledRoutes.has("auth")) {
    app.use(
      "/api/auth",
      createAuthRouter({
        prisma,
        jwtSecret,
        refreshTokenSecret,
        auth,
      }),
    );
  }

  if (enabledRoutes.has("reports")) {
    app.use(
      "/api/reports",
      createReportRouter({
        prisma,
        auth,
      }),
    );
  }

  if (enabledRoutes.has("users")) {
    app.use(
      "/api/users",
      createUsersRouter({
        prisma,
        auth,
      }),
    );
  }

  if (enabledRoutes.has("admin")) {
    app.use(
      "/api/admin",
      createAdminUsersRouter({
        prisma,
        auth,
      }),
    );
  }

  if (enabledRoutes.has("student-imports")) {
    app.use(
      "/api/admin/imports",
      createStudentImportRouter({
        prisma,
        auth,
      }),
    );
  }

  if (enabledRoutes.has("complaints")) {
    app.use(
      "/api/complaints",
      createComplaintsRouter({
        prisma,
        auth,
      }),
    );
  }

  if (enabledRoutes.has("service-requests")) {
    app.use(
      "/api/service-requests",
      createServiceRequestsRouter({
        prisma,
        auth,
      }),
    );
  }

  if (enabledRoutes.has("notifications")) {
    app.use(
      "/api/notifications",
      createNotificationsRouter({
        prisma,
        auth,
      }),
    );
  }

  if (enabledRoutes.has("activity-logs")) {
    app.use(
      "/api/activity-logs",
      createActivityLogsRouter({
        prisma,
        auth,
      }),
    );
  }

  if (enabledRoutes.has("uploads")) {
    app.use(
      "/api/uploads",
      createUploadsRouter({
        auth,
      }),
    );
  }

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err?.message || "Internal server error" });
  });

  return app;
}