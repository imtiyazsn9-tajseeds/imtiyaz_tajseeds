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
├── server/                  # Node.js backend (no dependencies)
│   ├── index.js             # Starts the HTTP server
│   ├── config.js            # Settings from environment variables
│   ├── router.js            # API routes (protected by login unless marked public)
│   ├── routes/              # session.js (login), images.js (photos), content.js (save data)
│   ├── auth.js              # Sessions, password check, login rate limit
│   ├── static.js            # Serves /public safely (no path traversal, hides dotfiles)
│   ├── storage.js           # Writes the JSON data files and photos
│   ├── images.js            # Checks uploaded photos (type, size, file signature)
│   ├── validators.js        # Checks products / gallery / settings before saving
│   └── http.js              # Shared request/response helpers
│
├── public/                  # Everything the browser can open
│   ├── *.html               # index, products, gallery, quality, about, contact, admin
│   ├── data/                # products.json, gallery.json, site-config.json (single source of truth)
│   ├── css/                 # style.css, pages.css, admin.css
│   ├── js/
│   │   ├── data.js          # Loads the JSON files
│   │   ├── layout.js        # Shared top bar, header, mobile menu, footer, WhatsApp button
│   │   ├── main.js, products.js, gallery.js, home-products.js, contact.js, site-config.js
│   │   └── admin/           # Admin panel modules (api, auth, products, gallery, settings, ...)
│   └── assets/              # logo, favicon, products/, gallery/, ...
│
├── storage/                 # (created at runtime, git-ignored) enquiries.json and backups/
├── tests/server.test.js     # Automated checks for login, uploads, saving, file serving
├── scripts/                 # One-off import helpers
├── docs/                    # Editing guide
├── package.json
└── .env.example
```

---

## 🚀 Running the Website

Requires Node.js 18 or newer. There is nothing to install.

```bash
npm start          # http://localhost:8080
npm run dev        # same, restarts when server files change
npm test           # runs the automated server tests
```

Settings come from environment variables (see `.env.example`):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | Port to listen on |
| `ADMIN_ID` | `tajseeds` | Admin login ID (spaces/case are ignored, so "Taj Seeds" works) |
| `ADMIN_PASSWORD` | `0099` | Admin password. **Set your own before going online.** |
| `TRUST_PROXY` | `0` | Set to `1` behind nginx/Cloudflare |
| `NOTIFY_WEBHOOK_URL` | (empty) | Optional. Every new enquiry is also POSTed here as JSON (Formspree, Zapier, Make, ...) |
| `PRIVATE_DIR` | `./storage` | Enquiries and backups. Never served to browsers. |

Example: `ADMIN_PASSWORD=my-secret npm start`

> The pages load their data with `fetch`, so open the site through the server
> (not by double-clicking the HTML files).

---

## 🔐 Admin Panel

Open `/admin.html` and sign in. Login is checked by the server; the browser only
receives a secure session cookie. After 5 wrong passwords a visitor is locked out for 15 minutes.

- **Home Page Seeds / All Seeds Catalog:** add, edit, delete products, upload photos, choose which seeds show on the home page.
- **Gallery Photos:** add, edit, delete gallery photos and sections.
- **Contact & Info:** phone numbers, email, address, tagline, WhatsApp number. These are used for every call/WhatsApp link on the site.
- **Enquiries:** messages sent through the website's contact form (with Call / WhatsApp buttons and a New/Handled mark).
- **Backups:** every save keeps the previous version; restore any of them with one click.
- Photos are shrunk to 1200px WebP before upload; unused photos can be deleted from the photo picker.
- Changes are applied on the page first. Click **Save Changes** to publish them to the website.

---

## 🛠️ Editing Content & Code

- **Products, gallery, contact details:** use the admin panel. It writes `public/data/*.json`, which every page reads.
- **Header / footer / mobile menu:** edit `public/js/layout.js` once; all pages update.
- **Logo:** replace `public/assets/logo.png` (transparent PNG) and `public/assets/favicon.png`.
- **Hero image:** replace `public/assets/hero-field.jpg`.
- **Contact form endpoint:** in `public/contact.html`, change the form `action` to your Formspree (or similar) URL.
