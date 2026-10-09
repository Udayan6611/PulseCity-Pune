import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory for persistent SQLite database
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pulse.db');
console.log(`[PulseCity DB] Initializing SQLite database at: ${dbPath}`);

export const db = new DatabaseSync(dbPath);

// Initialize schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS citizen_reports (
      id TEXT PRIMARY KEY,
      city_id TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address_approx TEXT,
      timestamp TEXT NOT NULL,
      photo_data TEXT,
      audio_data TEXT,
      audio_transcript TEXT,
      moderation_status TEXT NOT NULL DEFAULT 'unverified',
      upvotes INTEGER NOT NULL DEFAULT 0,
      downvotes INTEGER NOT NULL DEFAULT 0,
      duplicate_of_id TEXT
    );

    CREATE TABLE IF NOT EXISTS report_votes (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      voter_ip TEXT NOT NULL,
      vote_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(report_id, voter_ip)
    );

    CREATE INDEX IF NOT EXISTS idx_reports_city ON citizen_reports(city_id);
    CREATE INDEX IF NOT EXISTS idx_reports_time ON citizen_reports(timestamp);
  `);

  console.log('[PulseCity DB] Schema tables verified and ready.');
}
