'use strict';

// Runs the real Worker (with a throwaway local database) through `wrangler dev` and talks to it over HTTP.
const test = require('node:test');
const assert = require('node:assert');
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const wrangler = path.join(root, 'node_modules', '.bin', 'wrangler');
const persist = fs.mkdtempSync(path.join(os.tmpdir(), 'taj-worker-'));
const VARS = ['--var', 'ADMIN_ID:tajseeds', '--var', 'ADMIN_PASSWORD:test-password', '--var', 'SESSION_SECRET:test-secret'];

const PRODUCT = { id: 'p1', name: 'P1', category: 'maize', image: 'assets/products/p1.png' };
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32, 7)]);
const asDataUrl = (buf, type) => `data:${type};base64,${buf.toString('base64')}`;

let dev;
let base;
let cookie;

const freePort = () => new Promise(resolve => {
  const s = net.createServer().listen(0, '127.0.0.1', () => {
    const { port } = s.address();
    s.close(() => resolve(port));
  });
});

test.before(async () => {
  execFileSync(wrangler, ['d1', 'migrations', 'apply', 'tajseeds', '--local', '--persist-to', persist], { cwd: root, stdio: 'ignore' });
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  dev = spawn(wrangler, ['dev', '--ip', '127.0.0.1', '--port', String(port), '--persist-to', persist, ...VARS], { cwd: root, stdio: 'ignore' });

  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(`${base}/api/session`)).ok) return;
    } catch (e) {
      // not up yet
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('wrangler dev did not start');
}, { timeout: 90000 });

test.after(() => {
  if (dev) dev.kill();
  fs.rmSync(persist, { recursive: true, force: true });
});

const json = (method, url, body, withCookie = true) => fetch(base + url, {
  method,
  headers: { 'Content-Type': 'application/json', ...(withCookie && cookie ? { Cookie: cookie } : {}) },
  body: body === undefined ? undefined : JSON.stringify(body)
});

test('site files and shipped data are served', async () => {
  assert.match(await (await fetch(`${base}/`)).text(), /<html/i);
  assert.strictEqual((await fetch(`${base}/products.html`)).status, 200);
  assert.strictEqual((await fetch(`${base}/missing.html`)).status, 404);
  assert.strictEqual((await fetch(`${base}/api/nothing`)).status, 404);

  const res = await fetch(`${base}/data/products.json`);
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(await res.json()), 'falls back to the file that shipped with the site');
  assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
});

test('mutating endpoints require login', async () => {
  assert.strictEqual((await json('PUT', '/api/content', { products: [PRODUCT] })).status, 401);
  assert.strictEqual((await json('POST', '/api/upload-image', {})).status, 401);
  assert.strictEqual((await fetch(`${base}/api/images`)).status, 401);
  assert.strictEqual((await fetch(`${base}/api/backups`)).status, 401);
});

test('login works only with the right credentials', async () => {
  assert.strictEqual((await json('POST', '/api/login', { id: 'tajseeds', password: 'nope' }, false)).status, 401);

  const res = await json('POST', '/api/login', { id: 'Taj Seeds', password: 'test-password' }, false);
  assert.strictEqual(res.status, 200);
  const setCookie = res.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  cookie = setCookie.split(';')[0];

  assert.strictEqual((await (await json('GET', '/api/session')).json()).authenticated, true);

  const forged = cookie.replace(/\.[0-9a-f]+$/, '.' + '0'.repeat(64));
  const bad = await fetch(`${base}/api/session`, { headers: { Cookie: forged } });
  assert.strictEqual((await bad.json()).authenticated, false, 'a tampered cookie is rejected');
});

test('saving content validates before writing and shows up on the site', async () => {
  assert.strictEqual((await json('PUT', '/api/content', { products: [{ name: 'no id' }] })).status, 400);
  assert.strictEqual((await json('PUT', '/api/content', { products: [PRODUCT, PRODUCT] })).status, 400);
  assert.strictEqual((await json('PUT', '/api/content', {})).status, 400);

  assert.strictEqual((await json('PUT', '/api/content', { products: [PRODUCT] })).status, 200);
  assert.deepStrictEqual(await (await fetch(`${base}/data/products.json`)).json(), [PRODUCT]);
});

test('JSON endpoints reject other content types', async () => {
  const res = await fetch(`${base}/api/content`, { method: 'PUT', headers: { 'Content-Type': 'text/plain', Cookie: cookie }, body: '{}' });
  assert.strictEqual(res.status, 415);
});

test('image upload checks type, signature and content, and serves what it stores', async () => {
  const upload = body => json('POST', '/api/upload-image', body);

  const ok = await upload({ filename: 'my photo.png', data: asDataUrl(PNG, 'image/png') });
  assert.strictEqual(ok.status, 200);
  const { imagePath } = await ok.json();
  assert.match(imagePath, /^uploads\/products\/my_photo-\d+\.png$/);

  const served = await fetch(`${base}/${imagePath}`);
  assert.strictEqual(served.status, 200);
  assert.strictEqual(served.headers.get('content-type'), 'image/png');
  assert.match(served.headers.get('cache-control'), /immutable/);
  assert.ok(Buffer.from(await served.arrayBuffer()).equals(PNG), 'bytes survive the database round trip');

  assert.strictEqual((await upload({ filename: 'x.exe', data: asDataUrl(PNG, 'image/png') })).status, 400);
  assert.strictEqual((await upload({ filename: 'fake.png', data: asDataUrl(Buffer.from('<html>'), 'image/png') })).status, 400);
  assert.strictEqual((await upload({ filename: 'big.png', data: asDataUrl(Buffer.concat([PNG, Buffer.alloc(1024 * 1024)]), 'image/png') })).status, 413);

  const evilSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  assert.strictEqual((await upload({ filename: 'evil.svg', data: asDataUrl(evilSvg, 'image/svg+xml') })).status, 400);
  const goodSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>');
  assert.strictEqual((await upload({ filename: 'good.svg', data: asDataUrl(goodSvg, 'image/svg+xml') })).status, 200);
});

test('saving keeps a backup of the previous version and can restore it', async () => {
  assert.strictEqual((await json('PUT', '/api/content', { products: [{ ...PRODUCT, name: 'Version Two' }] })).status, 200);

  const { backups } = await (await json('GET', '/api/backups')).json();
  const backup = backups.find(b => b.doc === 'products');
  assert.match(backup.summary, /1 products/);

  assert.strictEqual((await json('POST', '/api/backups/restore', { file: '../../etc/passwd' })).status, 404);
  assert.strictEqual((await json('POST', '/api/backups/restore', { file: '99999' })).status, 404);
  assert.strictEqual((await json('POST', '/api/backups/restore', { file: backup.file })).status, 200);
  assert.strictEqual((await (await fetch(`${base}/data/products.json`)).json())[0].name, 'P1');
});

test('saving over someone else\'s newer save is refused', async () => {
  const { versions } = await (await json('GET', '/api/versions')).json();
  assert.strictEqual((await json('PUT', '/api/content', { products: [{ ...PRODUCT, name: 'Changed' }], base: versions })).status, 200);
  // `versions` is now out of date, as if another admin had saved in the meantime
  assert.strictEqual((await json('PUT', '/api/content', { products: [{ ...PRODUCT, name: 'Overwrite' }], base: versions })).status, 409);
});

test('images in use cannot be deleted, unused ones can, shipped ones never', async () => {
  const up = await (await json('POST', '/api/upload-image', { filename: 'spare.png', data: asDataUrl(PNG, 'image/png') })).json();
  const { images } = await (await json('GET', '/api/images?scope=products')).json();
  const spare = images.find(i => i.path === up.imagePath);
  assert.deepStrictEqual([spare.inUse, spare.deletable], [false, true]);
  assert.ok(images.some(i => i.path.startsWith('assets/products/') && i.deletable === false), 'shipped photos are listed');

  // Showing it on the site makes it "in use"
  assert.strictEqual((await json('PUT', '/api/content', { products: [{ ...PRODUCT, image: up.imagePath }] })).status, 200);
  assert.strictEqual((await json('POST', '/api/images/delete', { path: up.imagePath })).status, 409);
  assert.strictEqual((await json('PUT', '/api/content', { products: [PRODUCT] })).status, 200);

  assert.strictEqual((await json('POST', '/api/images/delete', { path: up.imagePath })).status, 200);
  assert.strictEqual((await fetch(`${base}/${up.imagePath}`)).status, 404);
  assert.strictEqual((await json('POST', '/api/images/delete', { path: '../index.html' })).status, 404);
  assert.strictEqual((await json('POST', '/api/images/delete', { path: 'assets/products/KING-7820.webp' })).status, 404);
});

test('contact form saves enquiries for the admin and blocks bad input', async () => {
  const enquiry = { name: 'Ramesh Patel', phone: '98765 43210', location: 'Medchal', type: 'Dealership', message: 'Need dealership details please' };
  const post = body => json('POST', '/api/contact', body, false);

  assert.strictEqual((await post({ ...enquiry, phone: '12345' })).status, 400);
  assert.strictEqual((await post({ ...enquiry, message: 'short' })).status, 400);
  assert.strictEqual((await post({ ...enquiry, email: 'not-an-email' })).status, 400);

  assert.strictEqual((await post({ ...enquiry, website: 'http://spam' })).status, 200, 'bots are told it worked');
  assert.strictEqual((await post(enquiry)).status, 200);

  // Visitors cannot read the inbox, the admin can
  assert.strictEqual((await json('GET', '/api/enquiries', undefined, false)).status, 401);
  const { enquiries } = await (await json('GET', '/api/enquiries')).json();
  assert.strictEqual(enquiries.length, 1, 'spam trap entry is not stored');
  assert.strictEqual(enquiries[0].name, 'Ramesh Patel');
  assert.strictEqual(enquiries[0].status, 'new');

  assert.strictEqual((await json('POST', '/api/enquiries/status', { id: enquiries[0].id, status: 'handled' })).status, 200);
  assert.strictEqual((await (await json('GET', '/api/enquiries')).json()).enquiries[0].status, 'handled');
  assert.strictEqual((await json('POST', '/api/enquiries/delete', { id: enquiries[0].id })).status, 200);
});

test('contact form is rate limited per visitor', async () => {
  const enquiry = { name: 'Spam Bot', phone: '9876543210', message: 'Buy cheap things now' };
  let last;
  for (let i = 0; i < 6; i++) last = await json('POST', '/api/contact', enquiry, false);
  assert.strictEqual(last.status, 429);
});

test('logout ends the session', async () => {
  const res = await json('POST', '/api/logout', {});
  const cleared = res.headers.get('set-cookie').split(';')[0];
  const session = await fetch(`${base}/api/session`, { headers: { Cookie: cleared } });
  assert.strictEqual((await session.json()).authenticated, false);
});

test('too many wrong passwords are rate limited', async () => {
  let last;
  for (let i = 0; i < 6; i++) last = await json('POST', '/api/login', { id: 'tajseeds', password: `bad${i}` }, false);
  assert.strictEqual(last.status, 429);
  // Even the right password is refused while locked out
  assert.strictEqual((await json('POST', '/api/login', { id: 'tajseeds', password: 'test-password' }, false)).status, 429);
});
