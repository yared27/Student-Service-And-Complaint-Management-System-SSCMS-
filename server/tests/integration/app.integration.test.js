import bcrypt from "bcrypt";
import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.js";

describe("backend app integration", () => {
  const prisma = {
    $queryRaw: vi.fn().mockResolvedValue(1),
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn().mockResolvedValue({}),
    },
  };

  const jwtSecret = "a".repeat(32);
  const refreshTokenSecret = "b".repeat(32);
  let app;
  let passwordHash;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash("admin@123", 10);
    prisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      username: "NSR/123/23",
      name: "Test Student",
      email: "student@amu.edu.et",
      password: passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
      isActive: true,
      profileImage: null,
      campus: "Main",
      department: "General",
      passwordChangedOnFirstLogin: true,
      tempPasswordExpiration: null,
    });

    app = createApp({ prisma, jwtSecret, refreshTokenSecret, corsOrigins: [], routes: ["auth"] });
  });

  it("responds to health checks", async () => {
    await request(app).get("/api/health").expect(200).expect({ status: "ok" });
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it("logs a user in through the HTTP route", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        identity: "student",
        identifier: "nsr/123/23",
        password: "admin@123",
      })
      .expect(200);

    expect(response.body).toMatchObject({
      message: "Login successful.",
      role: "STUDENT",
      user: {
        username: "NSR/123/23",
        email: "student@amu.edu.et",
      },
    });
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(prisma.user.findFirst).toHaveBeenCalled();
    expect(prisma.refreshToken.create).toHaveBeenCalled();
  });
});