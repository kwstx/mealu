import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/mealu',
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
