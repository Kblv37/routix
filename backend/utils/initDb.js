const fs = require('fs/promises');
const path = require('path');
const { query } = require('../db');

const runSqlFile = async (fileName) => {
  const filePath = path.join(__dirname, '..', 'sql', fileName);
  const sql = await fs.readFile(filePath, 'utf-8');
  await query(sql);
};

const initializeDatabase = async () => {
  await runSqlFile('schema.sql');

  if (process.env.ENABLE_SAMPLE_SEED === 'true') {
    await runSqlFile('seed.sql');
  }
};

module.exports = {
  initializeDatabase
};
