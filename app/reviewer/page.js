'use client';
import { useEffect, useState } from 'react';
import { get, post, send, day, money, Form } from '../ui';

const fields = [
  ['title', 'Title', 'text'],
  ['amount', 'Amount per student (₹)', 'number'],
  ['total_budget', 'Total budget (₹)', 'number'],
  ['seats', 'Seats', 'number'],
  ['deadline', 'Deadline', 'date'],
  ['max_income', 'Max family income (optional)', 'number'],
  ['min_cgpa', 'Minimum CGPA (optional)', 'number'],
  ['categories', 'Allowed categories, comma separated (optional)', 'text'],
  ['states', 'Allowed states, comma separated (optional)', 'text'],
  ['courses', 'Allowed courses, comma separated (optional)', 'text'],
  ['gender', 'Gender', 'select', ['any', 'male', 'female', 'other']],
  ['disability_only', 'Only for disability', 'select', ['false', 'true']],
  ['description', 'Description', 'area'],
];

export default function Reviewer() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const [f, setF] = useState({ gender: 'any', disability_only: 'false' });

  const [list, setList] = useState([]);
  const load = () => get('/api/applications', setRows);
  const loadS = () => get('/api/scholarships', setList);
  useEffect(() => { load(); loadS(); }, []);

  async function edit(r) {
    const amount = prompt('New amount', r.amount);
    if (amount === null) return;
    const seats = prompt('New seats', r.seats);
    if (seats === null) return;
    const deadline = prompt('New deadline (YYYY-MM-DD)', day(r.deadline));
    if (deadline === null) return;
    const d = await send('PUT', '/api/scholarships', { scholarship_id: r.scholarship_id, amount, seats, deadline });
    setMsg(d.error || 'Scholarship updated');
    loadS();
  }

  async function del(r) {
    if (!confirm('Delete ' + r.title + '?')) return;
    const d = await send('DELETE', '/api/scholarships', { scholarship_id: r.scholarship_id });
    setMsg(d.error || 'Scholarship deleted');
    loadS();
  }

  async function act(application_id, action) {
    const d = await post('/api/approve', { application_id, action });
    setMsg(d.error || 'Application ' + action + 'd');
    load();
  }

  async function create(e) {
    e.preventDefault();
    setMsg('Saving and generating embedding...');
    const d = await post('/api/scholarships', f);
    setMsg(d.error || 'Scholarship created');
    loadS();
  }

  return (
    <main>
      <h1>Reviewer Dashboard</h1>
      {msg && <div className="msg">{msg}</div>}
      <div className="card">
        <h2>Review queue</h2>
        <table>
          <thead><tr><th>ID</th><th>Student</th><th>CGPA</th><th>Scholarship</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {Array.isArray(rows) && rows.map((r) => (
              <tr key={r.application_id}>
                <td>{r.application_id}</td><td>{r.full_name}</td><td>{r.cgpa}</td><td>{r.title}</td><td>{r.status}</td>
                <td>
                  <button className="ok" onClick={() => act(r.application_id, 'approve')}>Approve</button>{' '}
                  <button className="bad" onClick={() => act(r.application_id, 'reject')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {Array.isArray(rows) && !rows.length && <p className="muted">Queue is empty</p>}
      </div>
      <div className="card">
        <h2>Manage scholarships</h2>
        <table>
          <thead><tr><th>ID</th><th>Title</th><th>Amount</th><th>Seats</th><th>Deadline</th><th>Action</th></tr></thead>
          <tbody>
            {Array.isArray(list) && list.map((r) => (
              <tr key={r.scholarship_id}>
                <td>{r.scholarship_id}</td><td>{r.title}</td><td>{money(r.amount)}</td><td>{r.seats}</td><td>{day(r.deadline)}</td>
                <td>
                  <button className="sec" onClick={() => edit(r)}>Edit</button>{' '}
                  <button className="bad" onClick={() => del(r)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="card" onSubmit={create}>
        <h2>Create scholarship</h2>
        <Form fields={fields} state={f} setState={setF} />
        <button>Create scholarship</button>
      </form>
    </main>
  );
}
