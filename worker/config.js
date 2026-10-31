export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const CONTACT_MAX_PER_HOUR = 5;
export const BACKUPS_TO_KEEP = 40;
export const ENQUIRIES_TO_KEEP = 2000;

export const MAX_JSON_BYTES = 2 * 1024 * 1024;
// Photos are shrunk in the browser first (about 20-200 KB); this is only a safety cap.
// Larger files would also exceed the free plan's 10 ms CPU limit when decoded.
export const MAX_UPLOAD_BYTES = 1024 * 1024;
export const MAX_STORED_IMAGES = 400;
