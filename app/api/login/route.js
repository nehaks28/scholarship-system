import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool, log } from '@/lib/db';
import { sign } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash)))
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  const res = NextResponse.json({ role: u.role });
  res.cookies.set('token', sign(u), { httpOnly: true, path: '/' });
  await log(u.user_id, 'login');
  return res;
}
