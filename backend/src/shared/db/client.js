import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const dbPool = new Pool({
  connectionString: env.databaseUrl,
});

export const query = (text, params = []) => dbPool.query(text, params);
