const encoder = new TextEncoder();

const toHex = buffer => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');

export async function sha256Hex(text) {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

export async function hmacHex(secret, message) {
  return toHex(await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(message)));
}

/** Compares two strings without leaking their length or content through timing. */
export async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([sha256Hex(String(a)), sha256Hex(String(b))]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  return diff === 0;
}
