const { Pool } = require('pg');
const { newDb } = require('pg-mem');

const connectionString = process.env.DATABASE_URL;

let pool;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
} else {
  const memoryDb = newDb({ autoCreateForeignKeyIndices: true });
  const { Pool: MemoryPool } = memoryDb.adapters.createPg();
  pool = new MemoryPool();
  console.warn('[DB] DATABASE_URL is not set. Using in-memory PostgreSQL for local dev.');
}

const query = (text, params = []) => pool.query(text, params);

module.exports = {
  pool,
  query,
  getClient: () => pool.connect()
};
