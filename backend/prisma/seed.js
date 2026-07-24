const prisma = require('../src/prisma');

async function main() {
  // Check if categories already exist
  const existingCategories = await prisma.category.count();
  if (existingCategories > 0) {
    console.log('Database already seeded!');
    return;
  }

  // Create default categories
  const healthCategory = await prisma.category.create({
    data: { name: 'Health', color: '#10B981', sort_order: 1 } // Emerald
  });
  
  const worshipCategory = await prisma.category.create({
    data: { name: 'Worship', color: '#3B82F6', sort_order: 2 } // Blue
  });

  const workCategory = await prisma.category.create({
    data: { name: 'Work / Study', color: '#8B5CF6', sort_order: 3 } // Violet
  });

  const personalCategory = await prisma.category.create({
    data: { name: 'Personal', color: '#F59E0B', sort_order: 4 } // Amber
  });

  // Create default goals
  await prisma.goal.createMany({
    data: [
      {
        title: 'Sport',
        category_id: healthCategory.id,
        is_fixed: true,
        times_a_day: 1,
        sort_order: 1
      },
      {
        title: 'Pray 5 Times',
        category_id: worshipCategory.id,
        is_fixed: true,
        times_a_day: 5,
        sort_order: 1
      },
      {
        title: 'Read Quran',
        category_id: worshipCategory.id,
        is_fixed: true,
        times_a_day: 1,
        sort_order: 2
      },
      {
        title: 'Study 2 Hours',
        category_id: workCategory.id,
        is_fixed: true,
        times_a_day: 2,
        sort_order: 1
      },
      {
        title: 'Drink 2L Water',
        category_id: healthCategory.id,
        is_fixed: true,
        times_a_day: 4, // Represents 4x 500ml
        sort_order: 2
      },
      {
        title: 'Custom Non-Fixed Task',
        category_id: personalCategory.id,
        is_fixed: false,
        times_a_day: 1,
        sort_order: 1
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
