import { CONTACT_MAX_PER_HOUR } from '../config.js';
import * as enquiries from '../enquiries.js';
import { parseEnquiry } from '../validators.js';
import { createLimiter } from '../ratelimit.js';
import { route } from '../router.js';
import { HttpError, sendJson, readJsonBody, clientIp } from '../http.js';

const STATUSES = ['new', 'handled'];

// Public: the website's contact form
route('POST', '/api/contact', async ({ request, env, ctx }) => {
  const body = await readJsonBody(request, 16 * 1024);

  // Hidden "website" field: people never fill it in, spam bots do. Pretend it worked.
  if (body.website) return sendJson(200, { success: true });

  const limiter = createLimiter(env.DB, { prefix: 'contact', max: CONTACT_MAX_PER_HOUR, windowMs: 60 * 60 * 1000 });
  const ip = clientIp(request);
  if ((await limiter.check(ip)) > 0) {
    throw new HttpError(429, 'Bahut zyada enquiries bheji gayi hain. Kripya thodi der baad try karein ya hume call karein.');
  }

  const { error, value } = parseEnquiry(body);
  if (error) throw new HttpError(400, error);

  await limiter.hit(ip);
  const enquiry = await enquiries.add(env.DB, value);
  console.log(JSON.stringify({ msg: 'New enquiry', type: enquiry.type }));
  ctx.waitUntil(enquiries.notify(env, enquiry)); // the visitor does not wait for it
  return sendJson(200, { success: true });
}, { public: true });

// Admin: the enquiry inbox
route('GET', '/api/enquiries', async ({ env }) => {
  return sendJson(200, { success: true, enquiries: await enquiries.list(env.DB) });
});

route('POST', '/api/enquiries/status', async ({ request, env }) => {
  const { id, status } = await readJsonBody(request, 1024);
  if (!STATUSES.includes(status) || !(await enquiries.setStatus(env.DB, String(id), status))) throw new HttpError(404, 'Enquiry not found');
  return sendJson(200, { success: true });
});

route('POST', '/api/enquiries/delete', async ({ request, env }) => {
  const { id } = await readJsonBody(request, 1024);
  if (!(await enquiries.remove(env.DB, String(id)))) throw new HttpError(404, 'Enquiry not found');
  return sendJson(200, { success: true });
});
