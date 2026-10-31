/** Fixed-window attempt counter kept in D1, so it works across all of Cloudflare's servers. */
export function createLimiter(db, { prefix, max, windowMs }) {
  const keyOf = key => `${prefix}:${key}`;

  return {
    /** Milliseconds the caller must wait, or 0 when another attempt is allowed. */
    async check(key) {
      const row = await db.prepare('SELECT count, reset_at FROM rate_limits WHERE key = ?').bind(keyOf(key)).first();
      return row && row.reset_at > Date.now() && row.count >= max ? row.reset_at - Date.now() : 0;
    },
    async hit(key) {
      const now = Date.now();
      await db.prepare(
        `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
         ON CONFLICT(key) DO UPDATE SET
           count = CASE WHEN reset_at > ?3 THEN count + 1 ELSE 1 END,
           reset_at = CASE WHEN reset_at > ?3 THEN reset_at ELSE ?2 END`
      ).bind(keyOf(key), now + windowMs, now).run();
    },
    async reset(key) {
      await db.prepare('DELETE FROM rate_limits WHERE key = ?').bind(keyOf(key)).run();
    }
  };
}
