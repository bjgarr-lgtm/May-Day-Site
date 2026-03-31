CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  submission_type TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject_name TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_type_created
ON form_submissions (submission_type, created_at DESC);
