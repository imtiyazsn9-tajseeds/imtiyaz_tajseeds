'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

// The server reads its config from the environment when first loaded, so point it at a throwaway site.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'taj-test-'));
fs.mkdirSync(path.join(tmp, 'data'), { recursive: true });
fs.mkdirSync(path.join(tmp, 'assets', 'products'), { recursive: true });
fs.writeFileSync(path.join(tmp, 'index.html'), '<h1>home</h1>');
fs.writeFileSync(path.join(tmp, '.secret'), 'hidden');
process.env.PUBLIC_DIR = tmp;
process.env.ADMIN_ID = 'tajseeds';
process.env.ADMIN_PASSWORD = 'test-password';

const { createServer } = require('../server');

const PRODUCT = { id: 'p1', name: 'P1', category: 'maize', image: 'assets/products/p1.png' };
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
const asDataUrl = (buf, type) => `data:${type};base64,${buf.toString('base64')}`;

let server;
let base;
let cookie;

test.before(async () => {
  server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

const json = (method, url, body, withCookie = true) => fetch(base + url, {
  method,
  headers: { 'Content-Type': 'application/json', ...(withCookie && cookie ? { Cookie: cookie } : {}) },
  body: body === undefined ? undefined : JSON.stringify(body)
});

test('static files', async () => {
  assert.strictEqual(await (await fetch(`${base}/`)).text(), '<h1>home</h1>');
  assert.strictEqual((await fetch(`${base}/missing.html`)).status, 404);
  assert.strictEqual((await fetch(`${base}/.secret`)).status, 404, 'dotfiles are hidden');
  assert.strictEqual((await fetch(`${base}/..%2fserver%2fconfig.js`)).status, 404, 'no path traversal');
  assert.strictEqual((await fetch(`${base}/%2e%2e/%2e%2e/etc/passwd`)).status, 404);
});

test('mutating endpoints require login', async () => {
  assert.strictEqual((await json('PUT', '/api/content', { products: [PRODUCT] })).status, 401);
  assert.strictEqual((await json('POST', '/api/upload-image', {})).status, 401);
  assert.strictEqual((await fetch(`${base}/api/images`)).status, 401);
});

test('login works only with the right credentials', async () => {
  assert.strictEqual((await json('POST', '/api/login', { id: 'tajseeds', password: 'nope' }, false)).status, 401);

  const res = await json('POST', '/api/login', { id: 'Taj Seeds', password: 'test-password' }, false);
  assert.strictEqual(res.status, 200);
  const setCookie = res.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  cookie = setCookie.split(';')[0];

  const session = await (await json('GET', '/api/session')).json();
  assert.strictEqual(session.authenticated, true);
});

test('saving content validates before writing', async () => {
  const bad = await json('PUT', '/api/content', { products: [{ name: 'no id' }] });
  assert.strictEqual(bad.status, 400);
  assert.ok(!fs.existsSync(path.join(tmp, 'data', 'products.json')), 'nothing written on invalid input');

  const dupes = await json('PUT', '/api/content', { products: [PRODUCT, PRODUCT] });
  assert.strictEqual(dupes.status, 400);

  const ok = await json('PUT', '/api/content', { products: [PRODUCT] });
  assert.strictEqual(ok.status, 200);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(tmp, 'data', 'products.json'), 'utf8')), [PRODUCT]);

  assert.strictEqual((await json('PUT', '/api/content', {})).status, 400);
});

test('image upload checks type, signature and content', async () => {
  const upload = body => json('POST', '/api/upload-image', body);

  const ok = await upload({ filename: 'my photo.png', data: asDataUrl(PNG, 'image/png') });
  assert.strictEqual(ok.status, 200);
  const { imagePath } = await ok.json();
  assert.match(imagePath, /^assets\/products\/my_photo-\d+\.png$/);
  assert.ok(fs.existsSync(path.join(tmp, imagePath)));

  assert.strictEqual((await upload({ filename: 'x.exe', data: asDataUrl(PNG, 'image/png') })).status, 400);
  assert.strictEqual((await upload({ filename: 'fake.png', data: asDataUrl(Buffer.from('<html>'), 'image/png') })).status, 400);

  const evilSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  assert.strictEqual((await upload({ filename: 'evil.svg', data: asDataUrl(evilSvg, 'image/svg+xml') })).status, 400);

  const goodSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>');
  assert.strictEqual((await upload({ filename: 'good.svg', data: asDataUrl(goodSvg, 'image/svg+xml') })).status, 200);
});

test('JSON endpoints reject other content types', async () => {
  const res = await fetch(`${base}/api/content`, { method: 'PUT', headers: { 'Content-Type': 'text/plain', Cookie: cookie }, body: '{}' });
  assert.strictEqual(res.status, 415);
});

test('logout ends the session', async () => {
  await json('POST', '/api/logout', {});
  assert.strictEqual((await json('PUT', '/api/content', { products: [PRODUCT] })).status, 401);
});

test('too many wrong passwords are rate limited', async () => {
  let last;
  for (let i = 0; i < 6; i++) last = await json('POST', '/api/login', { id: 'tajseeds', password: `bad${i}` }, false);
  assert.strictEqual(last.status, 429);
  // Even the right password is refused while locked out
  assert.strictEqual((await json('POST', '/api/login', { id: 'tajseeds', password: 'test-password' }, false)).status, 429);
});
