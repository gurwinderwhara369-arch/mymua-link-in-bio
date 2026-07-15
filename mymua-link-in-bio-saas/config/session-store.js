const { EventEmitter } = require('events');
const path = require('path');
const Database = require('better-sqlite3');

module.exports = function (session) {
  const Store = session.Store || session.session.Store;
  const dbPath = path.resolve(__dirname, '..', 'data', 'sessions.db');

  class BetterSQLiteStore extends Store {
    constructor() {
      super();
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.exec(`CREATE TABLE IF NOT EXISTS sessions (sid TEXT PRIMARY KEY, expired INTEGER, sess TEXT)`);
      this.db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expired)`);
    }

    get(sid, cb) {
      try {
        const row = this.db.prepare('SELECT sess FROM sessions WHERE sid = ? AND expired > ?').get(sid, Date.now());
        cb(null, row ? JSON.parse(row.sess) : null);
      } catch (e) { cb(e); }
    }

    set(sid, sess, cb) {
      try {
        const expired = Date.now() + (sess.cookie && sess.cookie.maxAge || 86400000);
        this.db.prepare('INSERT OR REPLACE INTO sessions (sid, expired, sess) VALUES (?, ?, ?)').run(sid, expired, JSON.stringify(sess));
        cb(null);
      } catch (e) { cb(e); }
    }

    destroy(sid, cb) {
      try {
        this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
        cb(null);
      } catch (e) { cb(e); }
    }

    touch(sid, sess, cb) {
      try {
        const expired = Date.now() + (sess.cookie && sess.cookie.maxAge || 86400000);
        this.db.prepare('UPDATE sessions SET expired = ? WHERE sid = ?').run(expired, sid);
        cb(null);
      } catch (e) { cb(e); }
    }
  }

  return BetterSQLiteStore;
};
