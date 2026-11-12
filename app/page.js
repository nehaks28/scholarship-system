'use client';
import { useState } from 'react';
import { post } from './ui';

export default function Login() {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    const d = await post('/api/login', f);
    if (d.error) return setErr(d.error);
    location.href = '/' + d.role;
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h1>Welcome back</h1>
      <p className="muted">Find scholarships you are eligible for.</p>
      <label>Email</label>
      <input type="email" required onChange={(e) => setF({ ...f, email: e.target.value })} />
      <label>Password</label>
      <input type="password" required onChange={(e) => setF({ ...f, password: e.target.value })} />
      <button style={{ width: '100%' }}>Login</button>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <p className="muted">New student? <a href="/register">Create an account</a></p>
    </form>
  );
}
