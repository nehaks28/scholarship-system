import { NextResponse } from 'next/server';
import { sid, mongo } from '@/lib/db';
import { me } from '@/lib/auth';

export async function GET() {
  const u = me(['student']);
  if (!u) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = await mongo();
  const rows = await db.collection('notifications').find({ studentId: await sid(u.id) }).sort({ createdAt: -1 }).limit(5).toArray();
  return NextResponse.json(rows.map((r) => ({ message: r.message, createdAt: r.createdAt })));
}
