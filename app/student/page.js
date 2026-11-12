
'use client';

import { useEffect, useState } from 'react';
import { get, post, Table, money, day } from '../ui';

export default function Student() {
  const [el, setEl] = useState([]);
  const [rec, setRec] = useState([]);
  const [apps, setApps] = useState([]);
  const [notes, setNotes] = useState([]);
  const [q, setQ] = useState('');
  const [found, setFound] = useState(null);
  const [msg, setMsg] = useState('');
  const [detail, setDetail] = useState(null);
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(false);

  // Load dashboard information
  const load = () => {
    get('/api/eligibility', setEl);
    get('/api/recommend', setRec);
    get('/api/applications', setApps);
    get('/api/notifications', setNotes);
  };

  useEffect(() => {
    load();
  }, []);

  // Load scholarship details
  async function openDetails(id) {
    setMsg('');
    setDetail(null);
    setStatement('');
    setLoading(true);

    try {
      const response = await fetch('/api/scholarship/' + id);
      const data = await response.json();

      if (!response.ok) {
        setMsg(data.error || 'Unable to load details');
      } else {
        setDetail(data);
      }
    } catch (error) {
      console.error('Details error:', error);
      setMsg('Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  }

  // Button click handler
  function showDetails(id) {
    openDetails(id);
  }

  // Submit scholarship application
  async function apply(id) {
    const d = await post('/api/apply', {
      scholarship_id: id,
      statement
    });

    if (d.ok) {
      setMsg('Application submitted successfully!');
      setDetail(null);
      setStatement('');
      load();
    } else {
      setMsg(d.error || 'Application could not be submitted');
    }
  }

  // Check eligibility for selected scholarship
  const selectedEligibility = detail
    ? el.find(
        (r) =>
          Number(r.scholarship_id) ===
          Number(detail.scholarship_id)
      )
    : null;

  // Check whether student already applied
  const alreadyApplied = detail
    ? apps.some((a) => a.title === detail.title)
    : false;

  return (
    <main>
      <h1>Student Dashboard</h1>

      {msg && <div className="msg">{msg}</div>}

      {/* Notifications */}
      <div className="card">
        <h2>Notifications</h2>

        {Array.isArray(notes) && notes.length ? (
          notes.map((n, i) => (
            <p key={i}>🔔 {n.message}</p>
          ))
        ) : (
          <p className="muted">No notifications</p>
        )}
      </div>

      {/* Search scholarships */}
      <div className="card">
        <h2>Search scholarships</h2>

        <div className="bar">
          <input
            placeholder="e.g. robotics, research, nursing"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <button
            type="button"
            onClick={() =>
              get(
                '/api/search?q=' + encodeURIComponent(q),
                setFound
              )
            }
          >
            Search
          </button>
        </div>

        {Array.isArray(found) && (
          found.length ? (
            <div className="grid">
              {found.map((r) => (
                <div className="card" key={r.scholarship_id}>
                  <b>{r.title}</b>
                  <p>
                    {money(r.amount)} · Deadline {day(r.deadline)}
                  </p>

                  <button
                    type="button"
                    onClick={() => showDetails(r.scholarship_id)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No matches</p>
          )
        )}
      </div>

      {/* Recommendations */}
      <h2>Recommended for you</h2>

      <div className="grid" style={{ marginBottom: 18 }}>
        {Array.isArray(rec) && rec.map((r) => (
          <div className="card" key={r.scholarship_id || r.title}>
            <b>{r.title}</b>

            <p>
              {money(r.amount)} · Deadline {day(r.deadline)}
            </p>

            <span className="tag ok">
              Match {(Number(r.similarity) * 100).toFixed(0)}%
            </span>

            {' '}

            <span className="tag">
              Score {r.score}
            </span>

            {r.scholarship_id && (
              <p>
                <button
                  type="button"
                  onClick={() => showDetails(r.scholarship_id)}
                >
                  View Details
                </button>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Eligibility check */}
      <h2>Eligibility check</h2>

      <div className="grid" style={{ marginBottom: 18 }}>
        {Array.isArray(el) && el.map((r) => (
          <div className="card" key={r.scholarship_id}>
            <b>{r.title}</b>

            <p>
              {money(r.amount)} · Deadline {day(r.deadline)}
            </p>

            {r.eligible ? (
              <span className="tag ok">Eligible</span>
            ) : (
              <span className="tag bad">Not eligible</span>
            )}

            {!r.eligible && (
              <p className="muted">
                {r.failed_reasons.join(', ')}
              </p>
            )}

            <p>
              <button
                type="button"
                onClick={() => showDetails(r.scholarship_id)}
              >
                View Details
              </button>
            </p>

            {r.eligible && (
              apps.some((a) => a.title === r.title) ? (
                <span className="tag">Applied</span>
              ) : (
                <button
                  type="button"
                  onClick={() => openDetails(r.scholarship_id)}
                >
                  Apply
                </button>
              )
            )}
          </div>
        ))}
      </div>

      {/* Loading message */}
      {loading && (
        <p>Loading scholarship details...</p>
      )}

      {/* Scholarship details */}
      {detail && (
        <div className="card">
          <h2>Scholarship Details</h2>

          <h3>{detail.title}</h3>

          <p>{detail.description}</p>

          <p>
            <b>Amount:</b> {money(detail.amount)}
          </p>

          <p>
            <b>Deadline:</b> {day(detail.deadline)}
          </p>

          <p>
            <b>Available seats:</b> {detail.seats}
          </p>

          <p>
            <b>Minimum CGPA:</b>{' '}
            {detail.min_cgpa ?? 'Not specified'}
          </p>

          <p>
            <b>Maximum family income:</b>{' '}
            {detail.max_income ?? 'Not specified'}
          </p>

          <p>
            <b>Allowed categories:</b>{' '}
            {detail.allowed_categories?.join(', ') || 'All'}
          </p>

          <p>
            <b>Allowed states:</b>{' '}
            {detail.allowed_states?.join(', ') || 'All'}
          </p>

          <p>
            <b>Allowed courses:</b>{' '}
            {detail.allowed_courses?.join(', ') || 'All'}
          </p>

          {selectedEligibility?.eligible ? (
            alreadyApplied ? (
              <p>
                <span className="tag">
                  Already applied
                </span>
              </p>
            ) : (
              <>
                <h3>Application Statement</h3>

                <textarea
                  rows="4"
                  placeholder="Explain why you are applying..."
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => apply(detail.scholarship_id)}
                >
                  Submit Application
                </button>
              </>
            )
          ) : (
            <p className="tag bad">
              {selectedEligibility
                ? 'Not eligible: ' +
                  selectedEligibility.failed_reasons.join(', ')
                : 'Eligibility information unavailable'}
            </p>
          )}

          <p>
            <button
              className="sec"
              type="button"
              onClick={() => setDetail(null)}
            >
              Close Details
            </button>
          </p>
        </div>
      )}

      {/* My applications */}
      <div className="card">
        <h2>My applications</h2>
        <Table rows={apps} />
      </div>
    </main>
  );
}
