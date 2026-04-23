import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const dbPool = new Pool({
  connectionString: env.databaseUrl,
});

export const query = (text, params = []) => dbPool.query(text, params);

export const withTransaction = async (callback) => {
  const client = await dbPool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
