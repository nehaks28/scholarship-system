'use client';
import { useEffect, useState } from 'react';
import { get, Table } from '../ui';

export default function Admin() {
  const [d, setD] = useState({});
  useEffect(() => { get('/api/stats', setD); }, []);
  const s = Array.isArray(d.scholarships) ? d.scholarships : [];
  const apps = s.reduce((a, r) => a + Number(r.total_apps), 0);
  const approved = s.reduce((a, r) => a + Number(r.approved), 0);

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <div className="grid" style={{ marginBottom: 18 }}>
        <div className="card"><div className="stat">{s.length}</div>Scholarships</div>
        <div className="card"><div className="stat">{apps}</div>Applications</div>
        <div className="card"><div className="stat">{approved}</div>Approved</div>
      </div>
      <div className="card">
        <h2>Scholarship statistics (PostgreSQL view)</h2>
        <Table rows={d.scholarships} />
      </div>
      <div className="card">
        <h2>Activity (MongoDB aggregation)</h2>
        <Table rows={d.activity} />
      </div>
    </main>
  );
}
