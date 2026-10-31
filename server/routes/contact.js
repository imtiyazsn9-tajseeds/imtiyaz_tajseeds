'use strict';

const config = require('../config');
const enquiries = require('../enquiries');
const { parseEnquiry } = require('../validators');
const { createLimiter } = require('../ratelimit');
const { route } = require('../router');
const { HttpError, sendJson, readJsonBody, clientIp } = require('../http');

const limiter = createLimiter({ max: config.CONTACT_MAX_PER_HOUR, windowMs: 60 * 60 * 1000 });
const STATUSES = ['new', 'handled'];

// Public: the website's contact form
route('POST', '/api/contact', async (req, res) => {
  const body = await readJsonBody(req, 16 * 1024);

  // Hidden "website" field: people never fill it in, spam bots do. Pretend it worked.
  if (body.website) return sendJson(res, 200, { success: true });

  const ip = clientIp(req);
  if (limiter.check(ip) > 0) {
    throw new HttpError(429, 'Bahut zyada enquiries bheji gayi hain. Kripya thodi der baad try karein ya hume call karein.');
  }

  const { error, value } = parseEnquiry(body);
  if (error) throw new HttpError(400, error);

  limiter.hit(ip);
  const enquiry = enquiries.add(value);
  console.log(`New enquiry from ${enquiry.name} (${enquiry.type})`);
  enquiries.notify(enquiry); // runs in the background; the visitor does not wait for it
  sendJson(res, 200, { success: true });
}, { public: true });

// Admin: the enquiry inbox
route('GET', '/api/enquiries', async (req, res) => {
  sendJson(res, 200, { success: true, enquiries: enquiries.list() });
});

route('POST', '/api/enquiries/status', async (req, res) => {
  const { id, status } = await readJsonBody(req, 1024);
  if (!STATUSES.includes(status) || !enquiries.setStatus(id, status)) throw new HttpError(404, 'Enquiry not found');
  sendJson(res, 200, { success: true });
});

route('POST', '/api/enquiries/delete', async (req, res) => {
  const { id } = await readJsonBody(req, 1024);
  if (!enquiries.remove(id)) throw new HttpError(404, 'Enquiry not found');
  sendJson(res, 200, { success: true });
});
