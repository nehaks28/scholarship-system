import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { me } from '@/lib/auth';

export async function GET(req, { params }) {
  const u = me(['student']);

  if (!u) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid scholarship ID' }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
        s.scholarship_id,
        s.title,
        s.description,
        s.amount,
        s.total_budget,
        s.seats,
        s.deadline,
        s.is_active,
        c.max_income,
        c.min_cgpa,
        c.allowed_categories,
        c.allowed_states,
        c.allowed_courses,
        c.min_year,
        c.max_year,
        c.gender,
        c.disability_only
      FROM scholarships s
      LEFT JOIN eligibility_criteria c
      ON c.scholarship_id = s.scholarship_id
      WHERE s.scholarship_id = $1`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to load details' }, { status: 500 });
  }
}