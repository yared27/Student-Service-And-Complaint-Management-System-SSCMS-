import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Password@123";

async function upsertUser(data) {
  return prisma.user.upsert({
    where: { username: data.username },
    update: {
      name: data.name,
      email: data.email ?? null,
      role: data.role,
      status: data.status ?? "ACTIVE",
      campus: data.campus,
      department: data.department,
      phone: data.phone ?? null,
      strikeCount: data.strikeCount ?? 0,
      isFlagged: data.isFlagged ?? false,
      password: data.password,
    },
    create: {
      username: data.username,
      name: data.name,
      email: data.email ?? null,
      role: data.role,
      status: data.status ?? "ACTIVE",
      campus: data.campus,
      department: data.department,
      phone: data.phone ?? null,
      strikeCount: data.strikeCount ?? 0,
      isFlagged: data.isFlagged ?? false,
      password: data.password,
    },
  });
}

async function main() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const users = await Promise.all([
    upsertUser({
      username: "ADMIN-001",
      name: "System Admin",
      email: "admin@amu.edu.et",
      role: "ADMIN",
      campus: "ARBA_MINCH_MAIN",
      department: "ICT",
      password: hashedPassword,
    }),
    upsertUser({
      username: "SM-001",
      name: "Marta Service Manager",
      email: "service.manager@amu.edu.et",
      role: "SERVICE_MANAGER",
      campus: "ARBA_MINCH_MAIN",
      department: "Student Services",
      password: hashedPassword,
    }),
    upsertUser({
      username: "CM-001",
      name: "Bereket Student Union",
      email: "complaints.union@amu.edu.et",
      role: "COMPLAINT_MANAGER",
      campus: "ARBA_MINCH_MAIN",
      department: "Student Union",
      password: hashedPassword,
    }),
    upsertUser({
      username: "INV-001",
      name: "Alemu Investigation Lead",
      email: "investigator@amu.edu.et",
      role: "INVESTIGATOR",
      campus: "ARBA_MINCH_MAIN",
      department: "Student Affairs",
      password: hashedPassword,
    }),
    upsertUser({
      username: "ELC-023",
      name: "Field Staff One",
      role: "STAFF",
      campus: "KULFO",
      department: "Electrical",
      password: hashedPassword,
    }),
    upsertUser({
      username: "ELC-024",
      name: "Field Staff Two",
      role: "STAFF",
      campus: "CHAMO",
      department: "Maintenance",
      password: hashedPassword,
    }),
    upsertUser({
      username: "NSR/1101/24",
      name: "Liya Mekonnen",
      role: "STUDENT",
      campus: "ARBA_MINCH_MAIN",
      department: "Software Engineering",
      password: hashedPassword,
    }),
    upsertUser({
      username: "NSR/1102/24",
      name: "Abel Tadesse",
      role: "STUDENT",
      campus: "ARBA_MINCH_MAIN",
      department: "Civil Engineering",
      password: hashedPassword,
    }),
    upsertUser({
      username: "NSR/1103/24",
      name: "Rahel Girma",
      role: "STUDENT",
      campus: "KULFO",
      department: "Law",
      password: hashedPassword,
    }),
    upsertUser({
      username: "NSR/1104/24",
      name: "Noisy Demo Student",
      role: "STUDENT",
      campus: "ARBA_MINCH_MAIN",
      department: "Business",
      strikeCount: 2,
      isFlagged: true,
      password: hashedPassword,
    }),
    upsertUser({
      username: "SSR/2250/23",
      name: "Sena Bayisa",
      role: "STUDENT",
      campus: "ABAYA",
      department: "Economics",
      password: hashedPassword,
    }),
  ]);

  const byUsername = Object.fromEntries(users.map((u) => [u.username, u]));

  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.misuseReport.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.complaint.deleteMany();

  const complaintA = await prisma.complaint.create({
    data: {
      title: "Dorm water outage",
      description: "Water has been unavailable for 2 days in block C.",
      status: "UNDER_REVIEW",
      priority: "HIGH",
      createdById: byUsername["NSR/1101/24"].id,
      assignedToId: byUsername["CM-001"].id,
    },
  });

  const complaintB = await prisma.complaint.create({
    data: {
      title: "Cafeteria hygiene concern",
      description: "Food quality and hygiene are poor this week.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      createdById: byUsername["NSR/1102/24"].id,
      assignedToId: byUsername["INV-001"].id,
    },
  });

  const complaintSpam = await prisma.complaint.create({
    data: {
      title: "Fake repeated complaint",
      description: "This is repeated with abusive text in original submission.",
      status: "REJECTED",
      priority: "LOW",
      createdById: byUsername["NSR/1104/24"].id,
      assignedToId: byUsername["CM-001"].id,
    },
  });

  const requestA = await prisma.serviceRequest.create({
    data: {
      title: "Lab projector repair",
      description: "Projector in room A2 is not turning on.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      createdById: byUsername["NSR/1103/24"].id,
      assignedToId: byUsername["ELC-023"].id,
    },
  });

  const requestB = await prisma.serviceRequest.create({
    data: {
      title: "Classroom fan replacement",
      description: "Fan in lecture room B5 is broken.",
      status: "COMPLETED",
      priority: "LOW",
      createdById: byUsername["SSR/2250/23"].id,
      assignedToId: byUsername["ELC-024"].id,
      resolvedAt: new Date(),
    },
  });

  await prisma.misuseReport.create({
    data: {
      reporterId: byUsername["SM-001"].id,
      reportedUserId: byUsername["NSR/1104/24"].id,
      reason: "FALSE_INFORMATION",
      details: "Student repeatedly submits knowingly false maintenance reports.",
      status: "ACTION_TAKEN",
      actionTaken: "WARNING",
      serviceRequestId: requestA.id,
      reviewedById: byUsername["ADMIN-001"].id,
      reviewedAt: new Date(),
    },
  });

  await prisma.misuseReport.create({
    data: {
      reporterId: byUsername["CM-001"].id,
      reportedUserId: byUsername["NSR/1104/24"].id,
      reason: "ABUSIVE_LANGUAGE",
      details: "Insulting language used during complaint follow-up.",
      status: "REVIEWED",
      actionTaken: "NONE",
      complaintId: complaintSpam.id,
      reviewedById: byUsername["SM-001"].id,
      reviewedAt: new Date(),
    },
  });

  await prisma.misuseReport.create({
    data: {
      reporterId: byUsername["CM-001"].id,
      reportedUserId: byUsername["NSR/1102/24"].id,
      reason: "DUPLICATE_SPAM",
      details: "Potential duplicate cases, but later found valid.",
      status: "DISMISSED",
      actionTaken: "NONE",
      complaintId: complaintB.id,
      reviewedById: byUsername["ADMIN-001"].id,
      reviewedAt: new Date(),
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: byUsername["NSR/1101/24"].id,
        type: "COMPLAINT",
        title: "Complaint received",
        message: "Your dorm water outage complaint is under review.",
      },
      {
        userId: byUsername["ELC-023"].id,
        type: "SERVICE_REQUEST",
        title: "New assignment",
        message: "You were assigned a projector repair request.",
      },
      {
        userId: byUsername["NSR/1104/24"].id,
        type: "MISUSE_REPORT",
        title: "Account warning",
        message: "A warning has been placed on your account due to misuse reports.",
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        actorId: byUsername["NSR/1101/24"].id,
        complaintId: complaintA.id,
        action: "COMPLAINT_CREATED",
        entityType: "COMPLAINT",
        entityId: complaintA.id,
        description: "Student created complaint for dorm water outage.",
      },
      {
        actorId: byUsername["SM-001"].id,
        serviceRequestId: requestA.id,
        action: "SERVICE_REQUEST_ASSIGNED",
        entityType: "SERVICE_REQUEST",
        entityId: requestA.id,
        description: "Service manager assigned request to field staff.",
      },
      {
        actorId: byUsername["CM-001"].id,
        complaintId: complaintB.id,
        action: "COMPLAINT_ASSIGNED",
        entityType: "COMPLAINT",
        entityId: complaintB.id,
        description: "Complaint assigned to investigator.",
      },
      {
        actorId: byUsername["ADMIN-001"].id,
        targetUserId: byUsername["NSR/1104/24"].id,
        action: "MISUSE_WARNING_ISSUED",
        entityType: "MISUSE_REPORT",
        entityId: byUsername["NSR/1104/24"].id,
        description: "Warning issued for repeated abusive/fake requests.",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Default password for seeded users:", DEFAULT_PASSWORD);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
