import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const mgrs = await prisma.user.findMany({
    where: { role: 'SERVICE_MANAGER' },
    select: { id: true, username: true, name: true, category: true, department: true, serviceManagerProfile: true },
  });
  console.log('service managers:', JSON.stringify(mgrs, null, 2));
  for (const mgr of mgrs) {
    const staff = await prisma.user.findMany({
      where: {
        role: 'STAFF',
        OR: [{ managedByServiceManagerId: mgr.id }, { category: mgr.category }],
      },
      select: { id: true, username: true, name: true, category: true, managedByServiceManagerId: true },
    });
    const req = await prisma.serviceRequest.findMany({
      where: {
        OR: [{ category: mgr.category }, { serviceType: mgr.category }],
      },
      select: { id: true, title: true, status: true, serviceType: true, category: true, assignedServiceManagerId: true, assignedToId: true, createdById: true },
    });
    console.log('manager', mgr.username, 'cat', mgr.category, 'dept', mgr.department, 'staff', staff.length, 'req', req.length);
    console.log('  staff sample', JSON.stringify(staff.slice(0, 5), null, 2));
    console.log('  req sample', JSON.stringify(req.slice(0, 5), null, 2));
  }
  const user = await prisma.user.findFirst({
    where: { username: { contains: 'SM-CAF' } },
    select: { id: true, username: true, name: true, category: true, department: true, serviceManagerProfile: true },
  });
  console.log('SM-CAF user', JSON.stringify(user, null, 2));
  await prisma.$disconnect();
})();
