CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(120) UNIQUE NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('student','reviewer','admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE providers (
  provider_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(user_id) ON DELETE SET NULL,
  name VARCHAR(120) NOT NULL UNIQUE,
  type VARCHAR(20) CHECK (type IN ('government','private','ngo','university'))
);

CREATE TABLE students (
  student_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL CHECK (dob < CURRENT_DATE),
  gender VARCHAR(10) CHECK (gender IN ('male','female','other')),
  category VARCHAR(10) CHECK (category IN ('GEN','OBC','SC','ST','EWS')),
  state VARCHAR(50) NOT NULL,
  annual_family_income NUMERIC(12,2) NOT NULL CHECK (annual_family_income >= 0),
  disability BOOLEAN DEFAULT FALSE,
  course VARCHAR(80) NOT NULL,
  year_of_study INT CHECK (year_of_study BETWEEN 1 AND 6),
  cgpa NUMERIC(4,2) CHECK (cgpa BETWEEN 0 AND 10),
  interests TEXT
);

CREATE TABLE academic_records (
  record_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 12),
  sgpa NUMERIC(4,2) NOT NULL CHECK (sgpa BETWEEN 0 AND 10),
  UNIQUE (student_id, semester)
);

CREATE TABLE scholarships (
  scholarship_id SERIAL PRIMARY KEY,
  provider_id INT NOT NULL REFERENCES providers(provider_id),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  total_budget NUMERIC(12,2) NOT NULL CHECK (total_budget >= 0),
  seats INT NOT NULL CHECK (seats >= 0),
  deadline DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  search_tsv tsvector GENERATED ALWAYS AS
    (to_tsvector('english', title || ' ' || description)) STORED
);

CREATE TABLE eligibility_criteria (
  scholarship_id INT PRIMARY KEY REFERENCES scholarships(scholarship_id) ON DELETE CASCADE,
  max_income NUMERIC(12,2),
  min_cgpa NUMERIC(4,2),
  allowed_categories TEXT[],
  allowed_states TEXT[],
  allowed_courses TEXT[],
  min_year INT, max_year INT,
  gender VARCHAR(10),
  disability_only BOOLEAN DEFAULT FALSE,
  CHECK (min_year IS NULL OR max_year IS NULL OR min_year <= max_year)
);

CREATE TABLE applications (
  application_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  scholarship_id INT NOT NULL REFERENCES scholarships(scholarship_id),
  status VARCHAR(12) NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','under_review','approved','rejected','withdrawn')),
  statement TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, scholarship_id)
);

CREATE TABLE application_status_history (
  history_id SERIAL PRIMARY KEY,
  application_id INT NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
  old_status VARCHAR(12),
  new_status VARCHAR(12) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  application_id INT UNIQUE NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
  reviewer_id INT NOT NULL REFERENCES users(user_id),
  score INT CHECK (score BETWEEN 0 AND 100),
  comments TEXT,
  reviewed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE awards (
  award_id SERIAL PRIMARY KEY,
  application_id INT UNIQUE NOT NULL REFERENCES applications(application_id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  awarded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scholarship_embeddings (
  scholarship_id INT PRIMARY KEY REFERENCES scholarships(scholarship_id) ON DELETE CASCADE,
  embedding vector(384) NOT NULL
);
CREATE TABLE student_embeddings (
  student_id INT PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
  embedding vector(384) NOT NULL
);

CREATE INDEX idx_app_student ON applications(student_id);
CREATE INDEX idx_sch_deadline ON scholarships(deadline);
CREATE INDEX idx_sch_tsv ON scholarships USING gin(search_tsv);
CREATE INDEX idx_sch_emb ON scholarship_embeddings USING hnsw (embedding vector_cosine_ops);

ALTER TABLE students ADD COLUMN phone VARCHAR(15) CHECK (phone ~ '^[0-9]{10,15}$');
CREATE TABLE tmp_demo (id INT);
DROP TABLE tmp_demo;
