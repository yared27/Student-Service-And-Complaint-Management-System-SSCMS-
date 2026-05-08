import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createAuthRouter } from "./src/routes/auth.routes.js";
import { createReportRouter } from "./src/routes/report.routes.js";
import { createAdminUsersRouter, createUsersRouter } from "./src/routes/users.routes.js";
import { createComplaintsRouter } from "./src/routes/complaints.routes.js";
import { createServiceRequestsRouter } from "./src/routes/service-requests.routes.js";
import { createNotificationsRouter } from "./src/routes/notifications.routes.js";
import { createActivityLogsRouter } from "./src/routes/activity-logs.routes.js";
import { createUploadsRouter } from "./src/routes/uploads.routes.js";
import { createAuthMiddleware } from "./src/middlewares/auth.middleware.js";
import { swaggerSpec } from "./src/config/swagger.js";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error("Missing or weak JWT_SECRET. Set a secret with at least 32 characters.");
    process.exit(1);
}

if (!REFRESH_TOKEN_SECRET || REFRESH_TOKEN_SECRET.length < 32) {
    console.error("Missing or weak REFRESH_TOKEN_SECRET. Set a secret with at least 32 characters.");
    process.exit(1);
}

const auth = createAuthMiddleware({ jwtSecret: JWT_SECRET, prisma });

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again later." },
});

app.use(
    cors({
        origin: true,
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
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "ok" });
    } catch {
        res.status(500).json({ status: "error" });
    }
});

app.use("/api/auth/login", loginRateLimiter);

app.use(
    "/api/auth",
    createAuthRouter({
        prisma,
        jwtSecret: JWT_SECRET,
        refreshTokenSecret: REFRESH_TOKEN_SECRET,
        auth,
    }),
);

app.use(
    "/api/reports",
    createReportRouter({
        prisma,
        auth,
    }),
);

app.use(
    "/api/users",
    createUsersRouter({
        prisma,
        auth,
    }),
);

app.use(
    "/api/admin",
    createAdminUsersRouter({
        prisma,
        auth,
    }),
);

app.use(
    "/api/complaints",
    createComplaintsRouter({
        prisma,
        auth,
    }),
);

app.use(
    "/api/service-requests",
    createServiceRequestsRouter({
        prisma,
        auth,
    }),
);

app.use(
    "/api/notifications",
    createNotificationsRouter({
        prisma,
        auth,
    }),
);

app.use(
    "/api/activity-logs",
    createActivityLogsRouter({
        prisma,
        auth,
    }),
);

app.use(
    "/api/uploads",
    createUploadsRouter({
        auth,
    }),
);

app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err?.message || "Internal server error" });
});

async function startServer() {
    try {
        await prisma.$connect();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();

async function shutdown() {
    await prisma.$disconnect();
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);