# Smart Scholarship Eligibility and Recommendation System

DBMS Level 3 Project. A web app that checks which scholarships a student is eligible for, explains why the student fails the others, and recommends the best matches using semantic search.

## Tech stack
- Next.js 14 (frontend and API route handlers)
- PostgreSQL 16 with pgvector (relational data, triggers, transactions, full-text search, vector search)
- MongoDB 7 (audit logs, notifications, flexible rules, aggregation)
- Embeddings: all-MiniLM-L6-v2 (384 dimensions) via @xenova/transformers, cosine similarity
- Auth: bcrypt password hashes, JWT in an httpOnly cookie, roles student / reviewer / admin

## Prerequisites
Docker Desktop, Node.js 20.6 or newer, Git.

## Setup
```bash
git clone https://github.com/nehaks28/scholarship-system.git
cd scholarship-system
npm install
cp .env.example .env.local
```
Edit `.env.local` and set a long random `JWT_SECRET`.

Start the databases:
```bash
docker run --name pg -e POSTGRES_PASSWORD=pass -p 5432:5432 -d pgvector/pgvector:pg16
docker run --name mongo -p 27017:27017 -d mongo:7
```

Create the PostgreSQL database and load the SQL in this order:
```bash
docker exec -it pg psql -U postgres -c "CREATE DATABASE scholarship_db;"
docker cp db pg:/db
docker exec -it pg psql -U postgres -d scholarship_db -v ON_ERROR_STOP=1 -f /db/01_schema.sql
docker exec -it pg psql -U postgres -d scholarship_db -v ON_ERROR_STOP=1 -f /db/02_logic.sql
docker exec -it pg psql -U postgres -d scholarship_db -v ON_ERROR_STOP=1 -f /db/03_seed.sql
```

Load MongoDB and generate the embeddings:
```bash
docker exec -i mongo mongosh < db/mongo/setup.js
npm run embed
```

## Run
```bash
npm run dev
```
Open http://localhost:3000

## Demo logins
| Role | Email | Password |
|---|---|---|
| Admin | admin@scholarship.edu | Admin@2026 |
| Reviewer (National Scholarship Portal) | reviewer1@scholarship.edu | Review1@2026 |
| Reviewer (Tata Education Trust) | reviewer2@scholarship.edu | Review2@2026 |
| Student | student1@test.com ... student30@test.com | Password@123 |

## Folder structure
- `app/` pages and API route handlers
- `lib/` database connections, auth, embeddings
- `db/` SQL scripts, `db/mongo/` MongoDB scripts
- `scripts/embed.mjs` creates scholarship embeddings
- `docs/` documentation, test cases and screenshots

## Team
- Member A: PostgreSQL schema, functions, triggers, transaction, views, authentication, student pages
- Member B: MongoDB, embeddings and recommendations, reviewer and admin pages, search

See `docs/` for the ER diagram, schema, data dictionary, architecture, queries and test results.
