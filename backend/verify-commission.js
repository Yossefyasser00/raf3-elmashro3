const { PrismaClient } = require('@prisma/client');
const { SettingsService } = require('./dist/src/admin/settings.service.js');

const prisma = new PrismaClient();

async function main() {
  const settingsService = new SettingsService(prisma);
  const commission = await settingsService.getNumber('COMMISSION_PERCENT');
  console.log(`COMMISSION_PERCENT=${commission}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
