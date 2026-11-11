import { NextResponse } from 'next/server';
import { pool, mongo } from '@/lib/db';
import { me } from '@/lib/auth';

export async function GET() {
  if (!me(['admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const scholarships = (await pool.query('SELECT * FROM v_scholarship_stats ORDER BY scholarship_id')).rows;
  const db = await mongo();
  const activity = await db.collection('audit_logs').aggregate([{ $group: { _id: '$action', count: { $sum: 1 } } }, { $sort: { count: -1 } }]).toArray();
  return NextResponse.json({ scholarships, activity });
}
