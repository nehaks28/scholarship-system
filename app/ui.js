'use client';

export const get = (url, set) =>
  fetch(url).then((r) => {
    if (r.status === 403) {
      location.href = '/';
      return [];
    }
    return r.json();
  }).then(set);

export const post = (url, body) => fetch(url, { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json());

export const money = (n) => '₹' + Number(n).toLocaleString('en-IN');

export const day = (d) => String(d).slice(0, 10);

export function Table({ rows }) {
  if (!Array.isArray(rows) || !rows.length) return <p className="muted">No data yet</p>;
  const keys = Object.keys(rows[0]);
  return (
    <table>
      <thead><tr>{keys.map((k) => <th key={k}>{k}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{keys.map((k) => <td key={k}>{String(r[k] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  );
}

export function Form({ fields, state, setState }) {
  return (
    <div className="row">
      {fields.map(([k, label, type, options]) => (
        <div key={k} style={type === 'area' ? { gridColumn: '1 / 3' } : {}}>
          <label>{label}</label>
          {type === 'select' ? (
            <select value={state[k] || ''} onChange={(e) => setState({ ...state, [k]: e.target.value })}>
              {options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : type === 'area' ? (
            <textarea rows="3" value={state[k] || ''} onChange={(e) => setState({ ...state, [k]: e.target.value })} />
          ) : (
            <input type={type} value={state[k] || ''} onChange={(e) => setState({ ...state, [k]: e.target.value })} />
          )}
        </div>
      ))}
    </div>
  );
}

export const send = (method, url, body) => fetch(url, { method, body: JSON.stringify(body) }).then((r) => r.json());
