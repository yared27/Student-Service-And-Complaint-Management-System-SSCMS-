import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.js";

vi.mock("../../src/services/aiService.js", () => ({
  predictRequestAdvisory: vi.fn().mockResolvedValue({
    priority: "HIGH",
    duplicateScore: 0.1,
    isDuplicate: false,
  }),
}));

describe("complaints integration", () => {
  const jwtSecret = "a".repeat(32);
  const refreshTokenSecret = "b".repeat(32);
  const token = jwt.sign(
    {
      sub: "student-1",
      role: "STUDENT",
      username: "NSR/123/23",
      email: "student@amu.edu.et",
    },
    jwtSecret,
    { expiresIn: "1h" },
  );

  const prisma = {
    user: {
      findUnique: vi.fn().mockResolvedValue({
        id: "student-1",
        role: "STUDENT",
        status: "ACTIVE",
        isActive: true,
        category: "UTILITIES",
        email: "student@amu.edu.et",
        username: "NSR/123/23",
      }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    complaintManager: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "manager-profile-1",
          userId: "manager-user-1",
        },
      ]),
    },
    complaint: {
      count: vi.fn(),
      create: vi.fn().mockResolvedValue({
        id: "complaint-1",
        title: "Broken dorm light",
        description: "The dorm hallway light is not working.",
        status: "SUBMITTED",
        priority: "HIGH",
        complaintType: "GENERAL_SERVICE",
        category: "UTILITIES",
        createdById: "student-1",
        assignedComplaintManagerId: "manager-profile-1",
      }),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    notification: {
      create: vi.fn().mockResolvedValue({}),
    },
    activityLog: {
      create: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  };

  let app;

  beforeAll(() => {
    app = createApp({
      prisma,
      jwtSecret,
      refreshTokenSecret,
      corsOrigins: [],
      routes: ["complaints"],
    });
  });

  it("rejects complaint creation without a bearer token", async () => {
    await request(app).post("/api/complaints").send({}).expect(401);
  });

  it("creates a complaint for an authenticated student", async () => {
    const response = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Broken dorm light",
        description: "The dorm hallway light is not working.",
        complaintType: "GENERAL_SERVICE",
      })
      .expect(201);

    expect(response.body).toMatchObject({
      message: "Complaint submitted.",
      complaint: {
        id: "complaint-1",
        title: "Broken dorm light",
        priority: "HIGH",
      },
    });
    expect(prisma.complaintManager.findMany).toHaveBeenCalled();
    expect(prisma.complaint.create).toHaveBeenCalled();
    expect(prisma.notification.create).toHaveBeenCalled();
    expect(prisma.activityLog.create).toHaveBeenCalled();
  });
});