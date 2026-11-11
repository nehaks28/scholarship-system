import { NextResponse } from 'next/server';
import { pool, sid } from '@/lib/db';
import { me } from '@/lib/auth';
import { embed } from '@/lib/embed';

export async function GET() {
  const u = me(['student']);
  if (!u) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = await sid(u.id);
  const st = (await pool.query('SELECT interests, course FROM students WHERE student_id=$1', [id])).rows[0];
  const ids = (await pool.query('SELECT scholarship_id FROM fn_eligibility_check($1) WHERE eligible', [id])).rows.map((r) => r.scholarship_id);
  if (!ids.length) return NextResponse.json([]);
  const v = await embed(`${st.interests || ''} ${st.course}`);
  const { rows } = await pool.query(
    'SELECT s.scholarship_id, s.title, s.amount, s.deadline, 1 - (e.embedding <=> $1::vector) AS similarity FROM scholarship_embeddings e JOIN scholarships s USING (scholarship_id) WHERE s.scholarship_id = ANY($2) ORDER BY e.embedding <=> $1::vector LIMIT 10',
    [v, ids]
  );
  const max = Math.max(...rows.map((r) => +r.amount), 1);
  const out = rows
    .map((r) => {
      const days = (new Date(r.deadline) - Date.now()) / 864e5;
      const score = 0.6 * r.similarity + 0.2 * Math.max(0, 1 - days / 90) + 0.2 * (+r.amount / max);
      return { title: r.title, amount: r.amount, deadline: r.deadline, similarity: r.similarity.toFixed(3), score: score.toFixed(3) };
    })
    .sort((a, b) => b.score - a.score);
  return NextResponse.json(out);
}
