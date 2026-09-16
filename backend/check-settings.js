const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.platformSetting.findMany({
    where: {
      key: {
        in: ['COMMISSION_PERCENT', 'IN_PERSON_SURCHARGE_PCT'],
      },
    },
  });

  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
