import fs from 'fs';
import { pool } from './src/db';
import path from 'path';

async function main() {
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
