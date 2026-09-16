const { PrismaClient, RoleName, WorkshopStatus, WorkshopType, TeachingMode } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function upsertUser(user) {
  const passwordHash = await bcrypt.hash('Test1234!', 12);

  const existing = await prisma.user.findUnique({
    where: { email: user.email },
    include: { roles: true, studentProfile: true, tutorProfile: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        fullName: user.fullName,
        phone: user.phone,
        passwordHash,
        isActive: true,
      },
    });

    for (const role of user.roles) {
      await prisma.userRole.upsert({
        where: {
          userId_role: {
            userId: existing.id,
            role,
          },
        },
        create: { userId: existing.id, role },
        update: {},
      });
    }

    if (user.studentProfile) {
      await prisma.studentProfile.upsert({
        where: { userId: existing.id },
        create: {
          userId: existing.id,
          gradeLevel: user.studentProfile.gradeLevel,
          pointsBalance: user.studentProfile.pointsBalance,
        },
        update: {
          gradeLevel: user.studentProfile.gradeLevel,
          pointsBalance: user.studentProfile.pointsBalance,
        },
      });
    }

    if (user.tutorProfile) {
      await prisma.tutorProfile.upsert({
        where: { userId: existing.id },
        create: {
          userId: existing.id,
          bio: user.tutorProfile.bio,
          teachingMode: user.tutorProfile.teachingMode,
          priceMinEGP: user.tutorProfile.priceMinEGP,
          priceMaxEGP: user.tutorProfile.priceMaxEGP,
          isVerified: true,
          verifiedAt: new Date(),
          isFeaturedOnHome: user.tutorProfile.isFeaturedOnHome ?? false,
        },
        update: {
          bio: user.tutorProfile.bio,
          teachingMode: user.tutorProfile.teachingMode,
          priceMinEGP: user.tutorProfile.priceMinEGP,
          priceMaxEGP: user.tutorProfile.priceMaxEGP,
          isVerified: true,
          verifiedAt: new Date(),
          isFeaturedOnHome: user.tutorProfile.isFeaturedOnHome ?? false,
        },
      });
    }

    console.log(`Updated existing: ${user.email} | password: Test1234!`);
    return existing;
  }

  const created = await prisma.user.create({
    data: {
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      passwordHash,
      roles: {
        create: user.roles.map((role) => ({ role })),
      },
      ...(user.studentProfile
        ? {
            studentProfile: {
              create: {
                gradeLevel: user.studentProfile.gradeLevel,
                pointsBalance: user.studentProfile.pointsBalance,
              },
            },
          }
        : {}),
      ...(user.tutorProfile
        ? {
            tutorProfile: {
              create: {
                bio: user.tutorProfile.bio,
                teachingMode: user.tutorProfile.teachingMode,
                priceMinEGP: user.tutorProfile.priceMinEGP,
                priceMaxEGP: user.tutorProfile.priceMaxEGP,
                isVerified: true,
                verifiedAt: new Date(),
                isFeaturedOnHome: user.tutorProfile.isFeaturedOnHome ?? false,
              },
            },
          }
        : {}),
    },
  });

  console.log(`Created: ${created.email} | password: Test1234!`);
  return created;
}

async function main() {
  const demoUsers = [
    {
      email: 'student.demo@fokzanqa.local',
      phone: '966500000001',
      fullName: 'Demo Student',
      roles: [RoleName.STUDENT],
      studentProfile: { gradeLevel: '3', pointsBalance: 100 },
    },
    {
      email: 'tutor.demo@fokzanqa.local',
      phone: '966500000002',
      fullName: 'Demo Tutor',
      roles: [RoleName.TUTOR],
      tutorProfile: {
        bio: 'Demo tutor account',
        teachingMode: TeachingMode.BOTH,
        priceMinEGP: 150,
        priceMaxEGP: 400,
        isFeaturedOnHome: true,
      },
    },
    {
      email: 'admin.demo@fokzanqa.local',
      phone: '966500000003',
      fullName: 'Demo Admin',
      roles: [RoleName.ADMIN],
    },
  ];

  const createdUsers = [];

  for (const user of demoUsers) {
    const result = await upsertUser(user);
    createdUsers.push(result);
  }

  const tutorUser = await prisma.user.findUnique({
    where: { email: 'tutor.demo@fokzanqa.local' },
    include: { tutorProfile: true },
  });

  if (tutorUser?.tutorProfile) {
    const existingWorkshop = await prisma.workshop.findFirst({
      where: { title: 'Demo Featured Workshop' },
    });

    if (!existingWorkshop) {
      await prisma.workshop.create({
        data: {
          title: 'Demo Featured Workshop',
          description: 'Demo workshop used to check homepage showcase.',
          type: WorkshopType.FREE,
          priceEGP: 0,
          startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          endsAt: new Date(Date.now() + 1000 * 60 * 60 * 26),
          capacity: 30,
          tutorId: tutorUser.id,
          status: WorkshopStatus.APPROVED,
          isFeaturedOnHome: true,
        },
      });

      console.log('Created demo featured workshop');
    } else {
      console.log('Demo featured workshop already exists');
    }
  }

  console.log('\nDemo data ready. Use these accounts:');
  console.log('student.demo@fokzanqa.local | Test1234!');
  console.log('tutor.demo@fokzanqa.local | Test1234!');
  console.log('admin.demo@fokzanqa.local | Test1234!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
