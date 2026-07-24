const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

// Prisma 7 requires a driver adapter — no longer uses the binary engine.
// We use the official @prisma/adapter-pg backed by the `pg` connection pool.
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const adapter = new PrismaPg(pool);

// Dev hot-reload safe singleton — prevents "too many connections" in development
const globalForPrisma = globalThis;

if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
  });
}

const prisma = globalForPrisma.__prisma;

module.exports = prisma;

