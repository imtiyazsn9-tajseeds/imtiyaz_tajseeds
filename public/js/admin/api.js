/** All communication with the server. Nothing else in the admin panel calls fetch(). */

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let unauthorizedHandler = () => {};

/** Called when the server says the session has expired. */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

async function request(method, url, body, { silent401 = false } = {}) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // non-JSON error page; handled below
  }

  if (!res.ok || !data || data.success === false) {
    if (res.status === 401 && !silent401) unauthorizedHandler();
    throw new ApiError(res.status, (data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

async function readData(name) {
  const res = await fetch(`data/${name}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new ApiError(res.status, `Could not load ${name}`);
  return res.json();
}

export const api = {
  async hasSession() {
    try {
      return (await request('GET', '/api/session', undefined, { silent401: true })).authenticated;
    } catch (e) {
      return false;
    }
  },
  login: (id, password) => request('POST', '/api/login', { id, password }, { silent401: true }),
  logout: () => request('POST', '/api/logout', {}),

  async loadContent() {
    const [products, gallery, config] = await Promise.all([
      readData('products'), readData('gallery'), readData('site-config')
    ]);
    return { products, gallery, config };
  },
  async versions() {
    return (await request('GET', '/api/versions')).versions;
  },
  saveContent: payload => request('PUT', '/api/content', payload),

  async listEnquiries() {
    return (await request('GET', '/api/enquiries')).enquiries;
  },
  setEnquiryStatus: (id, status) => request('POST', '/api/enquiries/status', { id, status }),
  deleteEnquiry: id => request('POST', '/api/enquiries/delete', { id }),

  async listBackups() {
    return (await request('GET', '/api/backups')).backups;
  },
  restoreBackup: file => request('POST', '/api/backups/restore', { file }),

  async listImages(scope) {
    return (await request('GET', `/api/images?scope=${encodeURIComponent(scope)}`)).images;
  },
  deleteImage: path => request('POST', '/api/images/delete', { path }),
  uploadImage: ({ filename, data, folder }) => request('POST', '/api/upload-image', { filename, data, folder })
};
