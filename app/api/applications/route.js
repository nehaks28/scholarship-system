import { NextResponse } from 'next/server';
import { pool, sid } from '@/lib/db';
import { me } from '@/lib/auth';

export async function GET() {
  const u = me();
  if (!u) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (u.role === 'student') {
    const { rows } = await pool.query('SELECT title, status, applied_at, awarded FROM v_student_dashboard WHERE student_id=$1 ORDER BY applied_at DESC', [await sid(u.id)]);
    return NextResponse.json(rows);
  }
  const { rows } = await pool.query(
    "SELECT a.application_id, st.full_name, st.cgpa, s.title, a.status FROM applications a JOIN students st USING (student_id) JOIN scholarships s USING (scholarship_id) WHERE a.status IN ('submitted','under_review') ORDER BY a.applied_at"
  );
  return NextResponse.json(rows);
}
