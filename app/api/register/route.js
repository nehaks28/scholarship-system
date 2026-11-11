import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';

export async function POST(req) {
  const b = await req.json();
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const hash = await bcrypt.hash(b.password, 10);
    const u = await c.query("INSERT INTO users(email,password_hash,role) VALUES ($1,$2,'student') RETURNING user_id", [b.email, hash]);
    await c.query(
      'INSERT INTO students(user_id,full_name,dob,gender,category,state,annual_family_income,disability,course,year_of_study,cgpa,interests) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
      [u.rows[0].user_id, b.full_name, b.dob, b.gender, b.category, b.state, b.income, b.disability === 'true', b.course, b.year, b.cgpa, b.interests]
    );
    await c.query('COMMIT');
    return NextResponse.json({ ok: true });
  } catch (e) {
    await c.query('ROLLBACK');
    return NextResponse.json({ error: e.message }, { status: 400 });
  } finally {
    c.release();
  }
}
