CREATE TABLE IF NOT EXISTS hunt_stop_settings (
  setting_key TEXT PRIMARY KEY,
  route_slug TEXT NOT NULL,
  stop_id TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 0,
  ticket_value INTEGER NOT NULL DEFAULT 0,
  validation_mode TEXT NOT NULL DEFAULT 'manual',
  volunteer_code TEXT,
  proof_answer TEXT,
  reveal_next_in_ui INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hunt_ticket_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_key TEXT NOT NULL,
  event_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  route_slug TEXT,
  stop_id TEXT,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_hunt_ticket_player_event
ON hunt_ticket_ledger (player_key, event_key);
