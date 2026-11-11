import { NextResponse } from 'next/server';
import { pool, sid, log } from '@/lib/db';
import { me } from '@/lib/auth';

export async function POST(req) {
  const u = me(['student']);
  if (!u) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { scholarship_id, statement } = await req.json();
  try {
    await pool.query('INSERT INTO applications(student_id,scholarship_id,statement) VALUES ($1,$2,$3)', [await sid(u.id), scholarship_id, statement || '']);
    await log(u.id, 'apply', { scholarshipId: scholarship_id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
