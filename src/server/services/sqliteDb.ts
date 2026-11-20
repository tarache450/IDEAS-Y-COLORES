import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

let dbInstance: DatabaseSync | null = null;

/**
 * Opens and initializes the SQLite database stored outside public/ and dist/.
 * Schema mirrors the production PHP 8.3 SQLite/MySQL tables.
 */
export function getSqliteDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'ideas_y_colores.sqlite');
  const db = new DatabaseSync(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      service TEXT NOT NULL,
      space_type TEXT,
      estimated_area TEXT,
      desired_timeline TEXT,
      location TEXT NOT NULL,
      metros_cuadrados REAL,
      message TEXT,
      priority TEXT NOT NULL DEFAULT 'STANDARD',
      status TEXT NOT NULL DEFAULT 'new',
      source TEXT NOT NULL DEFAULT 'website_quote_wizard',
      budget_estimate REAL,
      internal_notes TEXT,
      ip_hash TEXT NOT NULL,
      user_agent TEXT,
      whatsapp_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);

    CREATE TABLE IF NOT EXISTS lead_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id TEXT NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);

    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      actor TEXT NOT NULL,
      target_id TEXT,
      detail TEXT,
      created_at TEXT NOT NULL
    );
  `);

  dbInstance = db;
  return db;
}

export function getLeadsCount(): number {
  const db = getSqliteDb();
  const row = db.prepare('SELECT COUNT(*) as total FROM leads').get() as { total?: number } | undefined;
  return Number(row?.total || 0);
}
