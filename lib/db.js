
import pg from 'pg';
import { MongoClient } from 'mongodb';

pg.types.setTypeParser(1082, (v) => v);
pg.types.setTypeParser(1114, (v) => v);

export const pool =
  global.pool ||
  (global.pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  }));

export const mongo = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  const client =
    global.mc ||
    (global.mc = new MongoClient(process.env.MONGO_URI).connect());

  return (await client).db('scholarship_logs');
};

export const log = async (userId, action, extra = {}) => {
  try {
    await (await mongo())
      .collection('audit_logs')
      .insertOne({ userId, action, ...extra, timestamp: new Date() });
  } catch (e) {}
};

export const sid = async (userId) =>
  (await pool.query('SELECT student_id FROM students WHERE user_id=$1', [userId])).rows[0]
    ?.student_id;
