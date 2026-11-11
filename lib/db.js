import pg from 'pg';
import { MongoClient } from 'mongodb';

export const pool = global.pool || (global.pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }));
const client = global.mc || (global.mc = new MongoClient(process.env.MONGO_URI).connect());

export const mongo = async () => (await client).db('scholarship_logs');

export const log = async (userId, action, extra = {}) => {
  try {
    await (await mongo()).collection('audit_logs').insertOne({ userId, action, ...extra, timestamp: new Date() });
  } catch (e) {}
};

export const sid = async (userId) =>
  (await pool.query('SELECT student_id FROM students WHERE user_id=$1', [userId])).rows[0]?.student_id;
