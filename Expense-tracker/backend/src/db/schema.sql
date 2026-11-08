-- Expense Tracker Pro — SQLite schema
-- Applied automatically and idempotently on every server start.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  monthly_budget REAL NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  amount       REAL NOT NULL CHECK (amount > 0),
  type         TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category     TEXT NOT NULL,
  occurred_on  TEXT NOT NULL DEFAULT (date('now')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, occurred_on);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category);
