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
Taj-Seeds/
│
├── index.html                  # 1. Home Page (Hero, Stats, Journey Timeline, Mission, Objectives, Previews)
├── about.html                  # 2. About Us Page (Heritage, 1980 Kishanganj to Medchal, Values, Leadership)
├── products.html               # 3. Products Page (Filter tabs, live search, quick view modal, specs)
├── gallery.html                # 4. 3D Interactive Gallery (Tilt cards, dynamic glare, category filter, Lightbox)
├── quality.html                # 5. Quality & Infrastructure (5-step process pipeline, QC lab, storage, counters)
├── contact.html                # 6. Contact Page (Validated inquiry form, Medchal address, phones, map, FAQs)
│
├── css/
│   ├── style.css               # Core design tokens, typography, sticky header, mobile drawer, footer, modals
│   └── pages.css               # Specific page layouts, hero parallax, timeline, tilt cards, process steps
│
├── js/
│   ├── main.js                 # Sticky header, mobile navigation, scroll-reveal observer, animated counters
│   ├── products-data.js        # Centralized product catalog array (easy to add/edit products!)
│   ├── products.js             # Live category filtering, search debounce, quick-view modal logic
│   ├── gallery.js              # 3D interactive tilt engine, glare lighting, touch fallback, lightbox modal
│   └── contact.js              # Client-side form validation, Indian phone number check, submit handler
│
└── assets/
    ├── favicon.svg             # Sprout & grain vector favicon
    ├── logo.svg                # Vector brand logo (Red TAJ, Blue SEEDS, green shoot crest)
    ├── logo.png                # Drop-in placeholder for your actual logo image
    ├── hero-field.svg          # High-resolution lush maize field vector illustration
    ├── hero-field.jpg          # Drop-in placeholder for your actual hero field photo
    └── gallery/
        ├── warehouse.svg       # Medchal Central Logistics & Warehouse Facility
        ├── processing-plant.svg# Air-Screen & Gravity Separation Plant
        ├── seed-bags.svg       # Taj 9555 & Taj Gold seed bag packaging
        ├── farm-field.svg      # High-yield hybrid maize demonstration field
        ├── packaging.svg       # Automated robotic packaging and batch coding
        ├── lab-testing.svg     # Quality testing & germination laboratory
        ├── sorghum-field.svg   # High-sugar sweet sorghum & bajra trials
        └── vegetable-nursery.svg# Research nursery (Tomato, Chili, Okra)
```

---

## 🚀 Key Features

1. **Shared Sticky Header & Mobile Drawer:**
   - Smooth backdrop blur and soft drop shadow on scroll.
   - Company logo + text: `"Taj Seeds Agri Sciences"`.
   - Desktop nav with active page indicator & animated underline hover.
   - Phone link (`+91 9949003498`) and green CTA button.
   - Touch-friendly mobile hamburger menu and animated drawer.

2. **Home Page (`index.html`):**
   - Full-screen hero with gradient overlay, headline, tagline, and dual CTAs.
   - 4-item stats strip (45+ Years Legacy, 15+ States, 50,000+ Farmers, 98%+ Quality).
   - **"Our Journey"** timeline:
     - **1980:** Founder Mr. Abdus Salam opens *'Janta Beej Bhandar'* in Kishanganj, Bihar.
     - **2015:** Md. Naushad establishes *'Taj Seeds'* in honor of brother Md. Mumtaj.
     - **Today:** Modern Head Office and central warehouse in Medchal, Hyderabad.
   - **"Our Mission"** quote banner.
   - **Aim & Core Objectives** (4 animated cards with icons: High-Quality Seeds, R&D, Economic Growth, Sustainable Agriculture).
   - Featured products, gallery preview, and Dealership CTA banner.

3. **Products Catalog (`products.html`):**
   - Category filter tabs: **All Hybrids**, **Maize / Corn**, **Sorghum / Jowar**, **Vegetables**.
   - Real-time search filter by product name, botanical name, or trait.
   - Product cards with specifications (Maturity days, Yield potential, Suitable soil/season).
   - "Enquire Now" pre-fills the Contact form with the selected product.
   - "Quick View" modal popup.
   - Easily editable via `js/products-data.js`.

4. **3D Interactive Gallery (`gallery.html`):**
   - **Perspective 3D Tilt:** Follows cursor position with realistic depth and dynamic glare/shine reflection.
   - **Touch Device Fallback:** Automatically switches to clean touch scale on mobile phones and tablets.
   - **Lightbox Modal:** Full-screen zoom, image captions, previous/next buttons, plus keyboard arrow navigation (`←` / `→`) and `ESC` to close.
   - Category filters: All, Farm, Plant, Warehouse, Packaging.

5. **Quality & Infrastructure (`quality.html`):**
   - Animated statistics counters (Years of Legacy, Farmers Empowered, States Covered, Annual MT).
   - **5-Step Process Pipeline:** Seed Production & Roguing → Conditioning & Processing → Quality Testing → Protective Packing → Delivery.
   - Photographic features with detailed captions: Seed Cleaning, Grading, QC Laboratory, and Medchal Warehouse.

6. **Contact Page (`contact.html`):**
   - Form fields: Full Name, Phone, Email, State/District, Enquiry Type, Message.
   - Real-time client-side validation with Indian phone number regex.
   - Pre-fills from Product Quick Enquire clicks (`?product=...`).
   - Placeholder endpoint configured for **tajseeds15@gmail.com**.
   - Side card with complete registered address:
     > **Taj Seeds Agri Sciences**  
     > Plot No. 57 & 58, Flat No. 03, Kurish Homes, Uma Nagar, MRR Colony,  
     > Medchal Village, Medchal Mandal, Medchal-Malkajgiri Dist., Pin 501401, Telangana.  
     > **Phone:** +91 9949003498, +91 9113409962  
     > **Email:** tajseeds15@gmail.com
   - Embedded Google Map of Medchal, Hyderabad.
   - Frequently Asked Questions (FAQ) for dealers and farmers.

7. **Floating WhatsApp Button:**
   - Present on all 6 pages at bottom-right (`wa.me/919949003498`).
   - One-click direct chat with pre-filled greeting.

---

## 🛠️ How to Replace Images & Text

### 1. Replacing Logo:
Place your transparent PNG logo at `assets/logo.png`.  
The HTML automatically falls back to `assets/logo.svg` if `logo.png` is absent or still being uploaded!

### 2. Replacing Hero Background Image:
Place your real photo at `assets/hero-field.jpg`. The CSS seamlessly prioritizes `hero-field.jpg` and falls back to `assets/hero-field.svg`.

### 3. Adding or Editing Products:
Open `js/products-data.js` and add or modify any item in the `TAJ_PRODUCTS` array. Each product has:
```javascript
{
  id: "taj-9555",
  name: "Taj 9555 Hybrid Maize",
  category: "maize", // 'maize' | 'sorghum' | 'vegetables'
  categoryLabel: "Maize / Corn",
  badge: "Top Seller",
  botanical: "Zea mays L.",
  description: "High-yielding single cross hybrid maize...",
  maturity: "105 - 110 Days",
  yield: "38 - 42 Qtl / Acre",
  suitability: "Kharif & Rabi (All Soils)",
  packaging: "4 kg & 10 kg bags",
  image: "assets/gallery/seed-bags.svg"
}
```

### 4. Modifying Contact Form Endpoint:
In `contact.html`, change the form action:
```html
<form id="contactForm" action="https://formspree.io/f/YOUR_ENDPOINT_HERE" method="POST">
```
Submissions are formatted to deliver directly to `tajseeds15@gmail.com`.

---

## 🌐 Opening the Website

Simply double-click `index.html` in your browser, or serve it using any lightweight static web server:
- Python: `python -m http.server 8000`
- VS Code: Right-click `index.html` &rarr; "Open with Live Server"
- Node: `npx serve`
