import { NextResponse } from 'next/server';
import { pool, sid } from '@/lib/db';
import { me } from '@/lib/auth';

export async function GET() {
  const u = me(['student']);
  if (!u) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { rows } = await pool.query('SELECT * FROM fn_eligibility_check($1)', [await sid(u.id)]);
  return NextResponse.json(rows);
}
