import fs from 'node:fs';
import path from 'node:path';

const noopStore = (reason) => ({
  enabled: false,
  reason,
  insert: () => null,
  list: () => [],
  createReview: () => null,
  listReviews: () => [],
  setReviewStatus: () => null,
  close: () => {},
});

/**
 * SQLite storage for enquiries and customer reviews.
 * Storage problems are logged but never stop enquiries/reviews from working.
 */
export async function createStore({ enabled, dbPath, logger = console }) {
  if (!enabled) return noopStore('disabled by STORE_ENQUIRIES');

  try {
    const { DatabaseSync } = await import('node:sqlite');

    if (dbPath !== ':memory:') {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

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
        rating     REAL NOT NULL CHECK(rating >= 0.5 AND rating <= 5),
        message    TEXT NOT NULL,
        status     TEXT NOT NULL DEFAULT 'pending'
                   CHECK(status IN ('pending', 'approved', 'rejected')),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      );
    `);

    const insertStmt = db.prepare(
      'INSERT INTO enquiries (name, phone, email, service, message, email_status) VALUES (?, ?, ?, ?, ?, ?)',
    );

    const listStmt = db.prepare(
      'SELECT id, name, phone, email, service, message, email_status, created_at FROM enquiries ORDER BY id DESC LIMIT ?',
    );

    const insertReviewStmt = db.prepare(
      'INSERT INTO reviews (name, rating, message, status) VALUES (?, ?, ?, ?)',
    );

    const listReviewsStmt = db.prepare(
      `SELECT id, name, rating, message, status, created_at
       FROM reviews
       ORDER BY id DESC
       LIMIT ?`,
    );

    const listApprovedReviewsStmt = db.prepare(
      `SELECT id, name, rating, message, created_at
       FROM reviews
       WHERE status = 'approved'
       ORDER BY id DESC
       LIMIT ?`,
    );

    const updateReviewStatusStmt = db.prepare(
      `UPDATE reviews
       SET status = ?
       WHERE id = ?`,
    );

    return {
      enabled: true,

      insert({ name, phone, email, service, message, emailStatus }) {
        const result = insertStmt.run(
          name,
          phone,
          email,
          service,
          message,
          emailStatus,
        );

        return Number(result.lastInsertRowid);
      },

      list(limit = 100) {
        return listStmt
          .all(Math.min(Math.max(Number(limit) || 100, 1), 500))
          .map((row) => ({ ...row }));
      },

      createReview({ name, rating, message }) {
        const result = insertReviewStmt.run(
          name,
          rating,
          message,
          'pending',
        );

        return Number(result.lastInsertRowid);
      },

      listReviews({ approvedOnly = false, limit = 100 } = {}) {
        const safeLimit = Math.min(
          Math.max(Number(limit) || 100, 1),
          500,
        );

        const rows = approvedOnly
          ? listApprovedReviewsStmt.all(safeLimit)
          : listReviewsStmt.all(safeLimit);

        return rows.map((row) => ({ ...row }));
      },

      setReviewStatus(id, status) {
        const result = updateReviewStatusStmt.run(status, Number(id));
        return result.changes > 0;
      },

      close() {
        db.close();
      },
    };
  } catch (err) {
    logger.warn(
      `[store] Database unavailable (${err.message}). Emails will still be sent.`,
    );

    return noopStore(err.message);
  }
}
