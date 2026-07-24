const prisma = require('./src/prisma');

async function main() {
  const dayGoals = await prisma.dayGoal.findMany({
    orderBy: { id: 'desc' },
    take: 5
  });
  console.log(dayGoals);
}

main().finally(() => process.exit(0));
