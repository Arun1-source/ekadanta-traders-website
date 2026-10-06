import fs from 'node:fs';
import path from 'node:path';

const noopStore = (reason) => ({
  enabled: false,
  reason,
  insert: () => null,
  list: () => [],
  insertReview: () => null,
  listReviews: () => [],
  updateReviewStatus: () => false,
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
  

      CREATE TABLE IF NOT EXISTS reviews (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        message    TEXT NOT NULL,
        status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      );
    `);

    const insertStmt = db.prepare(
      'INSERT INTO enquiries (name, phone, email, service, message, email_status) VALUES (?, ?, ?, ?, ?, ?)',
    );
    const listStmt = db.prepare(
      'SELECT id, name, phone, email, service, message, email_status, created_at FROM enquiries ORDER BY id DESC LIMIT ?',
    );
    const insertReviewStmt = db.prepare(
      'INSERT INTO reviews (name, rating, message) VALUES (?, ?, ?)',
    );
    const listReviewsStmt = db.prepare(
      'SELECT id, name, rating, message, status, created_at, updated_at FROM reviews ORDER BY id DESC LIMIT ?',
    );
    const listApprovedReviewsStmt = db.prepare(
      "SELECT id, name, rating, message, status, created_at FROM reviews WHERE status = 'approved' ORDER BY id DESC LIMIT ?",
    );
    const updateReviewStmt = db.prepare(
      "UPDATE reviews SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ? AND status != ?",
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
      insertReview({ name, rating, message }) {
        const result = insertReviewStmt.run(name, rating, message);
        return Number(result.lastInsertRowid);
      },
      listReviews(limit = 500, status = '') {
        const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
        const rows = status === 'approved' ? listApprovedReviewsStmt.all(safeLimit) : listReviewsStmt.all(safeLimit);
        return rows.map((row) => ({ ...row }));
      },
      updateReviewStatus(id, status) {
        const result = updateReviewStmt.run(status, Number(id), status);
        return Number(result.changes) > 0;
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
