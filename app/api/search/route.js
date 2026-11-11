import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { me } from '@/lib/auth';

export async function GET(req) {
  if (!me()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const q = new URL(req.url).searchParams.get('q') || '';
  const { rows } = await pool.query(
    "SELECT scholarship_id, title, amount, deadline, ts_rank(search_tsv, query) AS rank FROM scholarships, plainto_tsquery('english', $1) query WHERE search_tsv @@ query ORDER BY rank DESC",
    [q]
  );
  return NextResponse.json(rows);
}
