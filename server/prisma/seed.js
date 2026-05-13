import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Password@123";
const CAMPUS = "ARBA_MINCH_MAIN";

const CAMPUSES = [
  "Main Campus",
  "Abaya Campus",
  "Nechi Sar Campus",
  "Kulfo Campus",
  "Chamo Campus",
  "Sawla Campus",
];

const COMPLAINT_BUREAUS = [
  {
    complaintType: "ACADEMIC",
    label: "Academic",
    managerName: "Academic Bureau Manager",
    managerEmail: "academic_manager@amu.edu.et",
    investigatorName: "Academic Bureau Investigator",
    investigatorEmail: "academic_investigator@amu.edu.et",
  },
  {
    complaintType: "FOOD_SERVICE",
    label: "Food Service",
    managerName: "Food Service Bureau Manager",
    managerEmail: "foodservice_manager@amu.edu.et",
    investigatorName: "Food Service Bureau Investigator",
    investigatorEmail: "foodservice_investigator@amu.edu.et",
  },
  {
    complaintType: "DISCIPLINE",
    label: "Discipline",
    managerName: "Discipline Bureau Manager",
    managerEmail: "discipline_manager@amu.edu.et",
    investigatorName: "Discipline Bureau Investigator",
    investigatorEmail: "discipline_investigator@amu.edu.et",
  },
  {
    complaintType: "GENERAL_SERVICE",
    label: "General Service",
    managerName: "General Service Bureau Manager",
    managerEmail: "generalservice_manager@amu.edu.et",
    investigatorName: "General Service Bureau Investigator",
    investigatorEmail: "generalservice_investigator@amu.edu.et",
  },
  {
    complaintType: "WOMEN_CASE",
    label: "Women Case",
    managerName: "Women Case Bureau Manager",
    managerEmail: "womencase_manager@amu.edu.et",
    investigatorName: "Women Case Bureau Investigator",
    investigatorEmail: "womencase_investigator@amu.edu.et",
  },
  {
    complaintType: "HEALTH_CASE",
    label: "Health Case",
    managerName: "Health Case Bureau Manager",
    managerEmail: "healthcase_manager@amu.edu.et",
    investigatorName: "Health Case Bureau Investigator",
    investigatorEmail: "healthcase_investigator@amu.edu.et",
  },
  {
    complaintType: "DISABILITY_CASE",
    label: "Disability Case",
    managerName: "Disability Case Bureau Manager",
    managerEmail: "disability_manager@amu.edu.et",
    investigatorName: "Disability Case Bureau Investigator",
    investigatorEmail: "disability_investigator@amu.edu.et",
  },
  {
    complaintType: "SPORTS",
    label: "Sports",
    managerName: "Sports Bureau Manager",
    managerEmail: "sports_manager@amu.edu.et",
    investigatorName: "Sports Bureau Investigator",
    investigatorEmail: "sports_investigator@amu.edu.et",
  },
];

const COMPLAINT_CATEGORY_BY_TYPE = {
  ACADEMIC: "CLASSROOM",
  FOOD_SERVICE: "CAFETERIA",
  DISCIPLINE: "DORMITORY",
  GENERAL_SERVICE: "UTILITIES",
  WOMEN_CASE: "UTILITIES",
  HEALTH_CASE: "CLINIC",
  DISABILITY_CASE: "CLINIC",
  SPORTS: "CLASSROOM",
};

function complaintTypeToCategory(complaintType) {
  return COMPLAINT_CATEGORY_BY_TYPE[String(complaintType || "").toUpperCase()] || "UTILITIES";
}


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
      category: data.category ?? null,
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
      category: data.category ?? null,
      password: data.password,
    },
  });
}

async function upsertServiceManagerProfile({ userId, serviceType }) {
  return prisma.serviceManager.upsert({
    where: { serviceType },
    update: { userId },
    create: { userId, serviceType },
  });
}

async function upsertComplaintManagerProfile({ userId, complaintType, category }) {
  return prisma.complaintManager.upsert({
    where: { complaintType },
    update: { userId, category: category ?? null },
    create: { userId, complaintType, category: category ?? null },
  });
}

async function seedComplaintBureaus(hashedPassword) {
  const seededBureaus = {};

  for (const bureau of COMPLAINT_BUREAUS) {
    const category = complaintTypeToCategory(bureau.complaintType);
    const managerUsername = `CM-${bureau.complaintType}`;
    const investigatorUsername = `INV-${bureau.complaintType}-001`;

    const manager = await upsertUser({
      username: managerUsername,
      name: bureau.managerName,
      email: bureau.managerEmail,
      role: "COMPLAINT_MANAGER",
      campus: CAMPUS,
      department: `${bureau.label} Bureau`,
      category,
      password: hashedPassword,
    });

    const profile = await upsertComplaintManagerProfile({
      userId: manager.id,
      complaintType: bureau.complaintType,
      category,
    });

    const investigator = await upsertUser({
      username: investigatorUsername,
      name: bureau.investigatorName,
      email: bureau.investigatorEmail,
      role: "INVESTIGATOR",
      campus: CAMPUS,
      department: `${bureau.label} Investigation Team`,
      category,
      password: hashedPassword,
    });

    await prisma.user.update({
      where: { id: investigator.id },
      data: { managedByComplaintManagerId: profile.id },
    });

    seededBureaus[bureau.complaintType] = { manager, investigator, profile };
  }

  console.log(`Seeded ${COMPLAINT_BUREAUS.length} complaint managers and investigators.`);
  return seededBureaus;
}

async function seedStudents(hashedPassword) {
    const studentDepts = [
      { prefix: "NSR", name: "Nature Science", count: 5 },
      { prefix: "SSR", name: "Social Science", count: 5 },
    ];

    let studentIndex = 0;
    for (const dept of studentDepts) {
      for (let i = 1; i <= dept.count; i++) {
        const idNumber = 2700 + studentIndex;
        const batchYear = 14;
        const username = `${dept.prefix}/${idNumber}/${batchYear}`;
        const campus = CAMPUSES[studentIndex % CAMPUSES.length];

        await upsertUser({
          username,
          name: `${dept.prefix} Student ${i}`,
          email: `${username.toLowerCase().replace(/\//g, "_")}@amu.edu.et`,
          role: "STUDENT",
          campus,
          department: dept.name,
          password: hashedPassword,
        });

        studentIndex += 1;
      }
    }

    console.log(`Seeded ${studentIndex} students.`);
  }

  async function seedServiceManagers(hashedPassword) {
    const serviceTypes = [
      { id: "ICT", name: "ICT Service Manager", email: "ict_service_manager@amu.edu.et" },
      { id: "DORMITORY", name: "Dormitory Service Manager", email: "dormitory_service_manager@amu.edu.et" },
      { id: "CAFETERIA", name: "Cafeteria Service Manager", email: "cafeteria_service_manager@amu.edu.et" },
      { id: "CLASSROOM", name: "Classroom Service Manager", email: "classroom_service_manager@amu.edu.et" },
      { id: "LIBRARY", name: "Library Service Manager", email: "library_service_manager@amu.edu.et" },
      { id: "LABORATORY", name: "Laboratory Service Manager", email: "laboratory_service_manager@amu.edu.et" },
      { id: "UTILITIES", name: "Utilities Service Manager", email: "utilities_service_manager@amu.edu.et" },
      { id: "TRANSPORT", name: "Transport Service Manager", email: "transport_service_manager@amu.edu.et" },
    ];

    const managers = [];
    for (const serviceType of serviceTypes) {
      const username = `SM-${serviceType.id.substring(0, 3)}`;
      const manager = await upsertUser({
        username,
        name: serviceType.name,
        email: serviceType.email,
        role: "SERVICE_MANAGER",
        campus: CAMPUS,
        department: `${serviceType.id.replaceAll("_", " ")} Services`,
        category: serviceType.id,
        password: hashedPassword,
      });
      await upsertServiceManagerProfile({ userId: manager.id, serviceType: serviceType.id });
      managers.push({ ...manager, serviceType: serviceType.id });
    }

    console.log(`Seeded 8 service managers for service types.`);
    return managers;
  }

  async function seedStaff(hashedPassword) {
    const serviceCategories = [
      "ICT",
      "DORMITORY",
      "CAFETERIA",
      "CLASSROOM",
      "LIBRARY",
      "LABORATORY",
      "UTILITIES",
      "TRANSPORT",
    ];

    for (const category of serviceCategories) {
      const manager = await prisma.serviceManager.findFirst({
        where: { serviceType: category },
        select: { id: true },
      });

      for (let i = 1; i <= 2; i++) {
        const username = `STAFF-${category}-00${i}`;
        const staff = await upsertUser({
          username,
          name: `${category} Staff ${i}`,
          role: "STAFF",
          campus: CAMPUS,
          department: `${category.replaceAll("_", " ")} Department`,
          category,
          password: hashedPassword,
        });

        if (manager) {
          await prisma.user.update({
            where: { id: staff.id },
            data: { managedByServiceManagerId: manager.id },
          });
        }
      }
    }

    console.log(`Seeded 16 staff members for service categories.`);
  }



async function main() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Clean up all data FIRST to avoid conflicts
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.misuseReport.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.serviceManager.deleteMany();
  await prisma.complaintManager.deleteMany();
  
  // Delete old users to avoid unique constraint conflicts
  await prisma.user.deleteMany({
    where: {
      role: { in: ["SERVICE_MANAGER", "STAFF", "COMPLAINT_MANAGER", "INVESTIGATOR"] },
    },
  });

  // Seed students with NSR/SSR format
  await seedStudents(hashedPassword);

  // Seed complaint managers and investigators aligned with complaint bureaus
  const complaintBureaus = await seedComplaintBureaus(hashedPassword);

  // Seed service managers for each service type
  const serviceManagers = await seedServiceManagers(hashedPassword);

  // Seed staff for each service category
  await seedStaff(hashedPassword);

  const users = await Promise.all([
    upsertUser({
      username: "ADMIN-001",
      name: "System Admin",
      email: "admin@amu.edu.et",
      role: "ADMIN",
      campus: CAMPUS,
      department: "ICT",
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

  // Get all service managers from database
  const allServiceManagers = await prisma.user.findMany({
    where: { role: "SERVICE_MANAGER" },
  });

  // Create service manager profiles for all 8 managers
  const serviceManagerProfiles = {};
  for (const manager of allServiceManagers) {
    const serviceType = manager.category || "UTILITIES";
    const profile = await upsertServiceManagerProfile({
      userId: manager.id,
      serviceType,
    });
    serviceManagerProfiles[serviceType] = profile;
  }

  const academicBureau = complaintBureaus.ACADEMIC;
  const disciplineBureau = complaintBureaus.DISCIPLINE;
  const foodServiceBureau = complaintBureaus.FOOD_SERVICE;
  const generalServiceBureau = complaintBureaus.GENERAL_SERVICE;

  const complaintA = await prisma.complaint.create({
    data: {
      title: "Dorm water outage",
      description: "Water has been unavailable for 2 days in block C.",
      status: "UNDER_REVIEW",
      priority: "HIGH",
      complaintType: "DISCIPLINE",
      createdById: byUsername["NSR/1101/24"].id,
      assignedToId: disciplineBureau.investigator.id,
      assignedComplaintManagerId: disciplineBureau.profile.id,
    },
  });

  const complaintB = await prisma.complaint.create({
    data: {
      title: "Cafeteria hygiene concern",
      description: "Food quality and hygiene are poor this week.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      complaintType: "FOOD_SERVICE",
      createdById: byUsername["NSR/1102/24"].id,
      assignedToId: foodServiceBureau.investigator.id,
      assignedComplaintManagerId: foodServiceBureau.profile.id,
    },
  });

  const complaintSpam = await prisma.complaint.create({
    data: {
      title: "Fake repeated complaint",
      description: "This is repeated with abusive text in original submission.",
      status: "REJECTED",
      priority: "LOW",
      complaintType: "GENERAL_SERVICE",
      createdById: byUsername["NSR/1104/24"].id,
      assignedToId: generalServiceBureau.investigator.id,
      assignedComplaintManagerId: generalServiceBureau.profile.id,
    },
  });

  // Get all staff for assignments
  const allStaff = await prisma.user.findMany({
    where: { role: "STAFF" },
  });

  // Create service requests for each service type
  const serviceRequests = [];
  const serviceTypes = ["LABORATORY", "CLASSROOM", "CAFETERIA", "UTILITIES", "ICT", "DORMITORY", "LIBRARY", "TRANSPORT"];
  
  for (let i = 0; i < serviceTypes.length; i++) {
    const serviceType = serviceTypes[i];
    const manager = serviceManagerProfiles[serviceType];
    const staffMember = allStaff.find(s => s.category === serviceType) || allStaff[i % allStaff.length];
    
    const request = await prisma.serviceRequest.create({
      data: {
        title: `${serviceType} maintenance request`,
        description: `Urgent maintenance needed in ${serviceType.toLowerCase()} facility.`,
        status: i === 0 ? "IN_PROGRESS" : i === 1 ? "COMPLETED" : "SUBMITTED",
        priority: i % 2 === 0 ? "HIGH" : "MEDIUM",
        serviceType,
        createdById: byUsername["NSR/1101/24"].id,
        assignedToId: staffMember?.id || null,
        assignedServiceManagerId: manager?.id || null,
        resolvedAt: i === 1 ? new Date() : null,
      },
    });
    
    serviceRequests.push(request);
  }

  // Get the cafeteria manager for the misuse report
  const cafeteriaManager = allServiceManagers.find(m => m.category === "CAFETERIA") || allServiceManagers[0];

  await prisma.misuseReport.create({
    data: {
      reporterId: cafeteriaManager.id,
      reportedUserId: byUsername["NSR/1104/24"].id,
      reason: "FALSE_INFORMATION",
      details: "Student repeatedly submits knowingly false maintenance reports.",
      status: "ACTION_TAKEN",
      actionTaken: "WARNING",
      serviceRequestId: serviceRequests[0]?.id,
      reviewedById: byUsername["ADMIN-001"].id,
      reviewedAt: new Date(),
    },
  });

  await prisma.misuseReport.create({
    data: {
      reporterId: generalServiceBureau.manager.id,
      reportedUserId: byUsername["NSR/1104/24"].id,
      reason: "ABUSIVE_LANGUAGE",
      details: "Insulting language used during complaint follow-up.",
      status: "REVIEWED",
      actionTaken: "NONE",
      complaintId: complaintSpam.id,
      reviewedById: cafeteriaManager.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.misuseReport.create({
    data: {
      reporterId: foodServiceBureau.manager.id,
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
        message: "Your complaint is under review.",
      },
      {
        userId: allStaff[0]?.id,
        type: "SERVICE_REQUEST",
        title: "New assignment",
        message: "You were assigned a new service request.",
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
        actorId: cafeteriaManager.id,
        serviceRequestId: serviceRequests[0]?.id,
        action: "SERVICE_REQUEST_ASSIGNED",
        entityType: "SERVICE_REQUEST",
        entityId: serviceRequests[0]?.id,
        description: "Service manager assigned request to field staff.",
      },
      {
        actorId: disciplineBureau.manager.id,
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
