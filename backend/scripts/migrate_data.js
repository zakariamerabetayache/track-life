const mariadb = require('mariadb');
const prisma = require('../src/db/prisma');

async function run() {
  console.log('Connecting to MariaDB...');
  // Extract credentials from DATABASE_URL: mysql://root:@localhost:3306/trucklife_new
  // Or just use the known local credentials
  const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'trucklife_new',
    connectionLimit: 5
  });

  let conn;
  try {
    conn = await pool.getConnection();

    console.log('Fetching data from MariaDB...');
    const categories = await conn.query('SELECT * FROM categories');
    const goals = await conn.query('SELECT * FROM goals');
    const weeks = await conn.query('SELECT * FROM weeks');
    const dayGoals = await conn.query('SELECT * FROM day_goals');
    const completions = await conn.query('SELECT * FROM completions');
    const weekGoals = await conn.query('SELECT * FROM week_goals');

    console.log(`Found:
      Categories: ${categories.length}
      Goals: ${goals.length}
      Weeks: ${weeks.length}
      DayGoals: ${dayGoals.length}
      Completions: ${completions.length}
      WeekGoals: ${weekGoals.length}
    `);

    // MariaDB driver appends a metadata object as the last item — remove it
    const clean = (rows) => rows.filter(r => r && typeof r.id === 'bigint' || typeof r.id === 'number');

    // Convert bigint ids (MariaDB returns these) to regular numbers
    const normalize = (rows) => rows.map(r => {
      const obj = {};
      for (const [k, v] of Object.entries(r)) {
        obj[k] = typeof v === 'bigint' ? Number(v) : v;
      }
      return obj;
    });

    // Helper to fix boolean fields from MariaDB (stored as Buffer/tinyint 0/1)
    const mapBools = (rows, boolFields) => rows.map(r => {
      const obj = { ...r };
      for (const field of boolFields) {
        if (obj[field] !== undefined) {
          obj[field] = Boolean(obj[field]);
        }
      }
      return obj;
    });

    const prepare = (rows, boolFields = []) => mapBools(normalize(clean(rows)), boolFields);

    console.log('Inserting into PostgreSQL...');

    const catData = prepare(categories);
    if (catData.length) {
      await prisma.category.createMany({ data: catData, skipDuplicates: true });
      await prisma.$executeRawUnsafe(`SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));`);
      console.log(`  ✔ Categories: ${catData.length}`);
    }

    const goalData = prepare(goals, ['is_fixed', 'is_active', 'is_daily']);
    if (goalData.length) {
      await prisma.goal.createMany({ data: goalData, skipDuplicates: true });
      await prisma.$executeRawUnsafe(`SELECT setval('goals_id_seq', (SELECT MAX(id) FROM goals));`);
      console.log(`  ✔ Goals: ${goalData.length}`);
    }

    const weekData = prepare(weeks);
    if (weekData.length) {
      await prisma.week.createMany({ data: weekData, skipDuplicates: true });
      await prisma.$executeRawUnsafe(`SELECT setval('weeks_id_seq', (SELECT MAX(id) FROM weeks));`);
      console.log(`  ✔ Weeks: ${weekData.length}`);
    }

    const dayGoalData = prepare(dayGoals, ['is_auto']);
    if (dayGoalData.length) {
      await prisma.dayGoal.createMany({ data: dayGoalData, skipDuplicates: true });
      await prisma.$executeRawUnsafe(`SELECT setval('day_goals_id_seq', (SELECT MAX(id) FROM day_goals));`);
      console.log(`  ✔ DayGoals: ${dayGoalData.length}`);
    }

    const completionData = prepare(completions);
    if (completionData.length) {
      await prisma.completion.createMany({ data: completionData, skipDuplicates: true });
      await prisma.$executeRawUnsafe(`SELECT setval('completions_id_seq', (SELECT MAX(id) FROM completions));`);
      console.log(`  ✔ Completions: ${completionData.length}`);
    }

    const weekGoalData = prepare(weekGoals, ['is_checked']);
    if (weekGoalData.length) {
      await prisma.week_Goal.createMany({ data: weekGoalData, skipDuplicates: true });
      await prisma.$executeRawUnsafe(`SELECT setval('week_goals_id_seq', (SELECT MAX(id) FROM week_goals));`);
      console.log(`  ✔ WeekGoals: ${weekGoalData.length}`);
    }

    console.log('\n✅ Migration complete!');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    if (conn) conn.release();
    await pool.end();
    await prisma.$disconnect();
  }
}

run();

