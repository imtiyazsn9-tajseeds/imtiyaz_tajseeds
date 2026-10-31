'use strict';

/** Fixed-window attempt counter, kept in memory (resets when the server restarts). */
function createLimiter({ max, windowMs }) {
  const entries = new Map(); // key -> { count, resetAt }

  const live = key => {
    const entry = entries.get(key);
    return entry && entry.resetAt > Date.now() ? entry : null;
  };

  return {
    /** Milliseconds the caller must wait, or 0 when another attempt is allowed. */
    check(key) {
      const entry = live(key);
      return entry && entry.count >= max ? entry.resetAt - Date.now() : 0;
    },
    hit(key) {
      const entry = live(key);
      if (entry) entry.count += 1;
      else entries.set(key, { count: 1, resetAt: Date.now() + windowMs });
    },
    reset(key) {
      entries.delete(key);
    }
  };
}

module.exports = { createLimiter };
