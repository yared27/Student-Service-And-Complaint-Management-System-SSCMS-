import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createApp } from "./src/app.js";

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

const app = createApp({
    prisma,
    jwtSecret: JWT_SECRET,
    refreshTokenSecret: REFRESH_TOKEN_SECRET,
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