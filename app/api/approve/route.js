import { NextResponse } from 'next/server';
import { pool, mongo, log } from '@/lib/db';
import { me } from '@/lib/auth';

export async function POST(req) {
  const u = me(['reviewer', 'admin']);
  if (!u) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { application_id, action } = await req.json();
  try {
    if (action === 'approve') await pool.query('SELECT sp_approve_application($1,$2)', [application_id, u.id]);
    else await pool.query("UPDATE applications SET status='rejected' WHERE application_id=$1", [application_id]);
    await log(u.id, action, { applicationId: application_id, reason: action === 'reject' ? 'reviewer_decision' : undefined });
    const { rows } = await pool.query('SELECT a.student_id, s.title FROM applications a JOIN scholarships s USING (scholarship_id) WHERE a.application_id=$1', [application_id]);
    try {
      const db = await mongo();
      await db.collection('notifications').insertOne({
        studentId: rows[0].student_id,
        message: `Your application for ${rows[0].title} was ${action === 'approve' ? 'approved' : 'rejected'}`,
        read: false,
        createdAt: new Date(),
      });
    } catch (e) {}
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
