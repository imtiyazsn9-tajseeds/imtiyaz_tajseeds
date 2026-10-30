# Taj Seeds Agri Sciences — Website Build Brief

**For: Google Antigravity (agent).** Read this whole file, then build the site using the images in `./assets/`. All files are in this folder.

## Goal
Build a responsive, mobile-first product website for **Taj Seeds** (tagline: *"Every Step with Farmer"* / Hindi: *ताज किसानों का हमसफर*). Audience: Indian farmers and seed dealers (many on phones, low bandwidth). Bilingual English + Hindi.

## Brand
- Name: TAJ SEEDS (company: Taj Seeds Agri Sciences)
- Logo: green leaf sprout above "TAJ SEEDS" (visible on every bag image)
- Colors: leaf green (#2E7D32), deep blue (#1F3C88), red (#C62828), maize orange/gold (#F5A623), white background
- Tone: trustworthy, farmer-friendly, simple words

## Products (all assets in `./assets/`)

### Hybrid Maize — "Single Cross Hybrid Maize"
| Product | Image file | Bag color accent |
|---|---|---|
| KING-7244 | 03-king-7244.jpg, 12-king-7244-security-features.jpg | Red |
| KING-7820 | 06-king-7820.jpg | Green |
| KING-3456 PLUS | 07-king-3456-plus.jpg | Purple |
| TAJ-7255 | 04-taj-7255.jpg | Orange/Red |
| TAJ-3532 | 10-taj-3532.jpg | Green |
| TAJ 4055 GOLD | 09-taj-4055-gold.jpg | Green |
| TAJ 4455 GOLD | 11-taj-4455-gold-SCREENSHOT.jpg | Blue |
| TAJ 9055 GOLD | 08-taj-9055-gold.jpg | Magenta/Purple |

### Paddy (Rice)
| Product | Image file | Details |
|---|---|---|
| TAJ BB11 (104) | 02-taj-bb11-104-paddy.jpg | Improved paddy seeds, 6 kg pack, matures in 130–140 days (130-140 दिन में तैयार), thick & heavy grain (मोटा एवं वजनी धान), "Top Class Quality Seeds" |

### Other media
- `01-field-demo-king-7820.jpg` — farmers holding KING-7820 signboards in a field demo (use in Gallery / "Field Trials" section; banner text: "ताज मक्का मिट्टी में शेर, बल्वाई में सवा शेर")
- `05-promo-video.mp4` — promo video (embed on homepage, lazy-load, add poster frame)
- `12-king-7244-security-features.jpg` — annotated bag: **Original Power Seal**, **Hologram Security**, **Authentic Farmer** → use in "Identify Genuine Seeds" section

## Image notes (important)
- Images 03, 04, 06, 07 have **black backgrounds/padding** — crop to the bag or place on a dark card; ideally remove background.
- Image 11 (TAJ 4455 GOLD) is a **phone screenshot** (status bar, nav buttons visible). Crop to the bag only.
- Images 08, 09, 10 have white/light backgrounds with some empty space — crop tightly.
- Generate WebP versions + thumbnails; keep originals. Add `alt` text with product name.

## Pages / Sections
1. **Home** — hero (bag lineup + tagline), promo video, featured products, "Why Taj Seeds", genuine-seed check, contact CTA
2. **Products** — grid with filter (Maize / Paddy), search by name
3. **Product detail** — big image, name, type ("Single Cross Hybrid Maize"), pack info, features, "Enquire / WhatsApp" button
4. **Genuine Seeds** — uses image 12 with the three security callouts
5. **Gallery / Field Trials** — image 01 + video
6. **About** — short company intro (placeholder, to be edited)
7. **Contact** — form + WhatsApp click-to-chat + call button + map placeholder

## Features
- Language toggle EN / हिंदी (Hindi copy for nav, headings, product taglines)
- Sticky WhatsApp + Call buttons on mobile
- Product data in one `products.json` so new items are easy to add
- SEO meta tags, Open Graph image, fast loading (lazy images, WebP)
- Accessible, high-contrast, large tap targets

## Placeholders to leave clearly marked (I will fill in)
`[PHONE]`, `[WHATSAPP]`, `[EMAIL]`, `[ADDRESS]`, `[YIELD / MATURITY / FEATURES per maize variety]` — do **not** invent agronomic claims; only the paddy data above is confirmed.

## Suggested stack
Static site: Next.js or plain HTML/CSS/JS with Tailwind. Deployable to Netlify/Vercel.

## Deliverable
Working site in this workspace, run instructions in README, and a short list of anything you assumed.
