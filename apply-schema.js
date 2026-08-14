const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mealu',
  });
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    
    await pool.query(schemaSql);
    console.log('Schema applied successfully');
  } catch (error) {
    console.error('Error applying schema:', error);
  } finally {
    await pool.end();
  }
}

main();
