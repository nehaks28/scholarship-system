import { NextResponse } from 'next/server';
import { pool, log } from '@/lib/db';
import { me } from '@/lib/auth';
import { embed } from '@/lib/embed';

const list = (s) => (s && s.trim() ? s.split(',').map((x) => x.trim()) : null);
const num = (s) => (s === undefined || s === '' ? null : s);

export async function POST(req) {
  const u = me(['reviewer', 'admin']);
  if (!u) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const b = await req.json();
  const c = await pool.connect();
  let id;
  try {
    await c.query('BEGIN');
    const p = await c.query('SELECT provider_id FROM providers WHERE user_id=$1', [u.id]);
    const r = await c.query(
      'INSERT INTO scholarships(provider_id,title,description,amount,total_budget,seats,deadline) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING scholarship_id',
      [p.rows[0]?.provider_id || 1, b.title, b.description, b.amount, b.total_budget, b.seats, b.deadline]
    );
    id = r.rows[0].scholarship_id;
    await c.query(
      'INSERT INTO eligibility_criteria(scholarship_id,max_income,min_cgpa,allowed_categories,allowed_states,allowed_courses,gender,disability_only) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [id, num(b.max_income), num(b.min_cgpa), list(b.categories), list(b.states), list(b.courses), b.gender === 'any' ? null : b.gender, b.disability_only === 'true']
    );
    await c.query('COMMIT');
  } catch (e) {
    await c.query('ROLLBACK');
    return NextResponse.json({ error: e.message }, { status: 400 });
  } finally {
    c.release();
  }
  try {
    const v = await embed(b.title + ' ' + b.description);
    await pool.query('INSERT INTO scholarship_embeddings VALUES ($1, $2::vector)', [id, v]);
  } catch (e) {}
  await log(u.id, 'create_scholarship', { scholarshipId: id });
  return NextResponse.json({ ok: true, id });
}

export async function GET() {
  if (!me(['reviewer', 'admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { rows } = await pool.query('SELECT scholarship_id, title, amount, total_budget, seats, deadline FROM scholarships ORDER BY scholarship_id');
  return NextResponse.json(rows);
}

export async function PUT(req) {
  const u = me(['reviewer', 'admin']);
  if (!u) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const b = await req.json();
  try {
    await pool.query('UPDATE scholarships SET amount=$1, seats=$2, deadline=$3 WHERE scholarship_id=$4', [b.amount, b.seats, b.deadline, b.scholarship_id]);
    await log(u.id, 'update_scholarship', { scholarshipId: b.scholarship_id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  const u = me(['reviewer', 'admin']);
  if (!u) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const b = await req.json();
  try {
    await pool.query('DELETE FROM scholarships WHERE scholarship_id=$1', [b.scholarship_id]);
    await log(u.id, 'delete_scholarship', { scholarshipId: b.scholarship_id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
