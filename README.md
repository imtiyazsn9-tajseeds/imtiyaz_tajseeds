# Taj Seeds Agri Sciences (Pvt. Ltd.)
### Tagline: *"Every Step with Farmer"*

A complete, production-ready, multi-page corporate website built for **Taj Seeds Agri Sciences**, an Indian seeds company founded in 1980 by Mr. Abdus Salam and expanded by Md. Naushad in honor of Md. Mumtaj.

---

## 🌾 Brand & Design System

- **Brand Colors:**
  - **Leaf Green:** `#2E9E44`
  - **Deep Forest Green:** `#1F5733`
  - **TAJ Red (Accent):** `#D7262E`
  - **SEEDS Blue (Accent):** `#1F4E9C`
  - **Cream / Off-White Background:** `#F7F9F2`
  - **Harvest Gold:** `#E5A93C`
- **Typography:**
  - **Headings:** `"Playfair Display"` (matches the brand's serif elegance)
  - **Body:** `"Poppins"` & `"Inter"` (clean, legible, modern)
  - **Tagline:** Italic Serif (*"Every Step with Farmer"*)
- **Theme & Mood:** Trustworthy, agricultural, premium, farmer-friendly, and clean with subtle leaf motifs and green dividers.

---

## 📂 Project Structure

```
imtiyaz_tajseeds/
├── worker/                  # Cloudflare Worker backend (no runtime dependencies)
│   ├── index.js             # Entry point: /api, /data and /uploads, everything else is static
│   ├── router.js            # API routes (protected by login unless marked public)
│   ├── routes/              # session.js (login), content.js (save), images.js, contact.js, backups.js
│   ├── auth.js              # Signed-cookie sessions and password check
│   ├── ratelimit.js         # Login / contact-form attempt limits (stored in D1)
│   ├── documents.js         # Products / gallery / settings: read, save, backups, restore
│   ├── enquiries.js         # Contact-form inbox
│   ├── images.js            # Checks and stores uploaded photos
│   ├── validators.js        # Checks products / gallery / settings before saving
│   └── static-images.js     # Generated list of the photos shipped in public/assets
│
├── migrations/              # D1 database tables
├── public/                  # Static site, served free and unlimited by Cloudflare
│   ├── *.html               # index, products, gallery, quality, about, contact, admin
│   ├── data/                # Starting copy of products / gallery / settings (used until the first admin save)
│   ├── css/, js/, assets/   # styles, scripts (js/admin/ = admin panel modules), logo and photos
│   ├── _headers, _redirects # security headers and "/" -> index.html
│
├── tests/worker.test.js     # Runs the real Worker locally and checks login, uploads, saving, backups...
├── scripts/                 # build-image-manifest.js and one-off import helpers
├── wrangler.jsonc           # Cloudflare configuration
└── .dev.vars.example        # Local login settings
```

---

## 🚀 Running Locally

Requires Node.js 20 or newer.

```bash
npm install        # once
cp .dev.vars.example .dev.vars    # once, then set ADMIN_PASSWORD
npm start          # http://localhost:8080 (local database, nothing touches the live site)
npm test           # starts the Worker locally and runs the automated checks
```

> Open the site through the server (not by double-clicking the HTML files).

---

## ☁️ Deploying to Cloudflare (free plan)

Everything runs on Cloudflare's free plan: static files and photos in the Worker's assets, content / enquiries /
backups / uploaded photos in one **D1** database. No credit card feature (R2, KV, paid plan) is used.

One-time setup:

```bash
npx wrangler login
npx wrangler d1 create tajseeds        # copy the printed database_id into wrangler.jsonc
npm run db:remote                      # creates the tables
npx wrangler secret put ADMIN_PASSWORD # your admin password
npx wrangler secret put SESSION_SECRET # any long random text
```

Then deploy (and again after every code change):

```bash
npm run deploy
```

Optional secrets: `ADMIN_ID` (default `tajseeds`), `NOTIFY_WEBHOOK_URL` (every enquiry is also POSTed there as JSON, e.g. Formspree/Zapier).
If `ADMIN_PASSWORD` is not set, admin login is disabled on purpose.

### Staying inside the free limits

| Limit (free plan) | What uses it | Typical use |
|---|---|---|
| 100,000 Worker requests / day | Only `/api/*`, `/data/*` and `/uploads/*`. Pages, CSS, JS and shipped photos are free and unlimited. Data is cached in the browser for 30 s. | A visitor's page view is about 2 to 3 requests, so roughly 30,000 page views a day |
| 5 million D1 reads / 100,000 writes per day | A page view reads 2 to 3 rows; a save writes about 10 rows | Far below |
| 5 GB D1 storage | Photos are shrunk to under 1 MB (usually 20 to 200 KB) and capped at 400; enquiries capped at 2,000; 40 backups per section | Well under 100 MB |
| 10 ms CPU per request | Small JSON work only; uploads over 1 MB are refused | Fine |

When a free limit is reached Cloudflare blocks the request until midnight UTC. It never charges the free plan.
Pages and photos that ship with the site keep working even then.

---

## 🔐 Admin Panel

Open `/admin.html` and sign in. Login is checked by the Worker; the browser only
receives a signed session cookie (valid 8 hours). After 5 wrong passwords a visitor is locked out for 15 minutes.

- **Home Page Seeds / All Seeds Catalog:** add, edit, delete products, upload photos, choose which seeds show on the home page.
- **Gallery Photos:** add, edit, delete gallery photos and sections.
- **Contact & Info:** phone numbers, email, address, tagline, WhatsApp number. These are used for every call/WhatsApp link on the site.
- **Enquiries:** messages sent through the website's contact form (with Call / WhatsApp buttons and a New/Handled mark).
- **Backups:** every save keeps the previous version; restore any of them with one click.
- Photos are shrunk to 1200px WebP before upload (max 1 MB). Photos uploaded from the panel can be deleted when unused; the photos that ship in `public/assets` can only be removed from the code.
- Changes are applied on the page first. Click **Save Changes** to publish them to the website.

---

## 🛠️ Editing Content & Code

- **Products, gallery, contact details:** use the admin panel. Saves go to the database and every page reads them. `public/data/*.json` is only the starting copy; once the admin has saved, the database wins.
- **Header / footer / mobile menu:** edit `public/js/layout.js` once; all pages update.
- **Logo:** replace `public/assets/logo.png` (transparent PNG) and `public/assets/favicon.png`.
- **Hero image:** replace `public/assets/hero-field.jpg`.
- **New photos added to `public/assets/products` or `gallery`:** run `npm run build` (done automatically by `npm run deploy`) so the admin photo picker lists them.
