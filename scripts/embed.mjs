import pg from 'pg';
import { pipeline } from '@xenova/transformers';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
const { rows } = await pool.query('SELECT scholarship_id, title, description FROM scholarships');

for (const r of rows) {
  const out = await extractor(r.title + ' ' + r.description, { pooling: 'mean', normalize: true });
  await pool.query(
    'INSERT INTO scholarship_embeddings VALUES ($1, $2::vector) ON CONFLICT (scholarship_id) DO UPDATE SET embedding = EXCLUDED.embedding',
    [r.scholarship_id, '[' + Array.from(out.data).join(',') + ']']
  );
  console.log('embedded', r.scholarship_id, r.title);
}
await pool.end();
