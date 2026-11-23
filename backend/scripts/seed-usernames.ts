import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cleanUsername(base: string): string {
  let cleaned = base.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!cleaned || cleaned.length < 3) {
    cleaned = 'user_' + Math.random().toString(36).substring(2, 6);
  }
  return cleaned;
}

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, username: true },
  });

  const used = new Set<string>();

  // Specific mappings for known accounts
  const specificMap: Record<string, string> = {
    'admin@fokzanqa.com': 'admin',
    'student@fokzanqa.com': 'student',
    'tutor@fokzanqa.com': 'tutor',
    'student.demo@fokzanqa.local': 'student_demo',
    'tutor.demo@fokzanqa.local': 'tutor_demo',
    'admin.demo@fokzanqa.local': 'admin_demo',
  };

  for (const u of users) {
    if (u.username) {
      used.add(u.username);
    }
  }

  for (const u of users) {
    if (u.username) continue;

    let candidate = specificMap[u.email.toLowerCase()];
    if (!candidate) {
      const emailPrefix = u.email.split('@')[0];
      candidate = cleanUsername(emailPrefix);
    }

    let finalUsername = candidate;
    let counter = 1;
    while (used.has(finalUsername)) {
      finalUsername = `${candidate}${counter}`;
      counter++;
    }

    used.add(finalUsername);

    await prisma.user.update({
      where: { id: u.id },
      data: { username: finalUsername },
    });
    console.log(`Updated user ${u.email} -> @${finalUsername}`);
  }

  console.log('All users assigned unique usernames!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
