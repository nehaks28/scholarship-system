# NoSQL and vector design

## MongoDB data model (database `scholarship_logs`)
| Collection | Purpose | Example document | Index |
|---|---|---|---|
| audit_logs | Every login, apply, approve, reject and scholarship change | `{ userId, action, scholarshipId, applicationId, reason, timestamp }` | `{userId:1, timestamp:-1}` |
| notifications | Messages shown to students | `{ studentId, message, read, createdAt }` | `{studentId:1, read:1}` |
| scholarship_rules | Extra flexible rules per scholarship | `{ scholarshipId, rules:[{field,op,value}], requiredDocs:[] }` | `{scholarshipId:1}` unique |
| document_meta | Metadata of uploaded documents | `{ applicationId, type, file, uploadedAt }` | `{applicationId:1}` |

Why MongoDB: these records differ in shape (a reject log has a reason, an apply log has a scholarshipId), are written constantly, and are never joined. Documents and aggregation pipelines fit better than fixed tables.

## Aggregation pipelines (`db/mongo/aggregations.js`)
- Events grouped by action (used on the admin dashboard)
- Rejections grouped by reason
- Activity per day
- Unread notifications per student

Run: `docker exec -i mongo mongosh < db/mongo/aggregations.js`

## Vector search design
| Question | Answer |
|---|---|
| What data is converted into embeddings? | Scholarship `title + description`; at request time, the student's `interests + course` |
| Which model? | all-MiniLM-L6-v2 (384 dimensions, normalized) run locally with @xenova/transformers |
| How are vectors stored? | `scholarship_embeddings.embedding vector(384)` in PostgreSQL using pgvector, with an HNSW index |
| Similarity metric? | Cosine distance (`<=>`); similarity = 1 − distance |
| How are results retrieved? | Hybrid: first `fn_eligibility_check` keeps only eligible scholarship IDs, then the vector query orders those by similarity, top 10 |

Metadata: `scholarship_id` links each vector to the scholarship row, so SQL filters and joins work in the same query.

Final ranking score: `0.6 × similarity + 0.2 × deadline urgency + 0.2 × (amount / highest amount)`, where urgency = max(0, 1 − days_left / 90).

Embeddings are created by `npm run embed` (all scholarships) and automatically when a reviewer creates a scholarship. The `student_embeddings` table is reserved for future caching; currently the student text is embedded on each request.
