'use client';

export default function Nav() {
  async function out() {
    await fetch('/api/logout', { method: 'POST' });
    location.href = '/';
  }
  return (
    <nav>
      <b>🎓 Scholarship Finder</b>
      <button className="sec" onClick={out}>Logout</button>
    </nav>
  );
}
