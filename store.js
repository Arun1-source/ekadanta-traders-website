import fs from 'node:fs';
import path from 'node:path';

const noopStore = (reason) => ({
  enabled: false,
  reason,
  insert: () => null,
  list: () => [],
  close: () => {},
});

/**
 * SQLite storage for enquiries using Node's built-in `node:sqlite` module (no native build step).
 * Storage problems are logged but never stop an enquiry from being emailed.
 */
export async function createStore({ enabled, dbPath, logger = console }) {
  if (!enabled) return noopStore('disabled by STORE_ENQUIRIES');

  try {
    const { DatabaseSync } = await import('node:sqlite');
    if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    const db = new DatabaseSync(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT NOT NULL,
        phone        TEXT NOT NULL,
        email        TEXT NOT NULL,
        service      TEXT NOT NULL,
        message      TEXT NOT NULL,
        email_status TEXT NOT NULL,
        created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      );
    `);

    const insertStmt = db.prepare(
      'INSERT INTO enquiries (name, phone, email, service, message, email_status) VALUES (?, ?, ?, ?, ?, ?)',
    );
    const listStmt = db.prepare(
      'SELECT id, name, phone, email, service, message, email_status, created_at FROM enquiries ORDER BY id DESC LIMIT ?',
    );

    return {
      enabled: true,
      insert({ name, phone, email, service, message, emailStatus }) {
        const result = insertStmt.run(name, phone, email, service, message, emailStatus);
        return Number(result.lastInsertRowid);
      },
      list(limit = 100) {
        return listStmt.all(Math.min(Math.max(Number(limit) || 100, 1), 500)).map((row) => ({ ...row }));
      },
      close() {
        db.close();
      },
    };
  } catch (err) {
    logger.warn(`[store] Enquiry database unavailable (${err.message}). Emails will still be sent.`);
    return noopStore(err.message);
  }
}
