'use client';
import { useState } from 'react';
import { post, Form } from '../ui';

const fields = [
  ['full_name', 'Full name', 'text'],
  ['email', 'Email', 'email'],
  ['password', 'Password', 'password'],
  ['dob', 'Date of birth', 'date'],
  ['gender', 'Gender', 'select', ['male', 'female', 'other']],
  ['category', 'Category', 'select', ['GEN', 'OBC', 'SC', 'ST', 'EWS']],
  ['state', 'State', 'select', ['Karnataka', 'Tamil Nadu', 'Kerala', 'Maharashtra', 'Andhra Pradesh', 'Telangana', 'Delhi', 'Other']],
  ['course', 'Course', 'select', ['B.Tech CSE', 'B.Tech ECE', 'BCA', 'MBBS', 'B.Sc Nursing']],
  ['year', 'Year of study', 'select', ['1', '2', '3', '4']],
  ['cgpa', 'CGPA (0-10)', 'number'],
  ['income', 'Annual family income (₹)', 'number'],
  ['disability', 'Disability', 'select', ['false', 'true']],
  ['interests', 'Interests (e.g. robotics, AI, healthcare research)', 'area'],
];

const start = { gender: 'male', category: 'GEN', state: 'Karnataka', course: 'B.Tech CSE', year: '1', disability: 'false' };

export default function Register() {
  const [f, setF] = useState(start);
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    const d = await post('/api/register', f);
    if (d.error) return setMsg(d.error);
    location.href = '/';
  }

  return (
    <form className="card form" style={{ maxWidth: 700 }} onSubmit={submit}>
      <h1>Student Registration</h1>
      <Form fields={fields} state={f} setState={setF} />
      <button>Create account</button>
      {msg && <p style={{ color: 'red' }}>{msg}</p>}
      <p className="muted"><a href="/">Back to login</a></p>
    </form>
  );
}
