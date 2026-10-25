const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function updateIndexHtmlProducts(products) {
  try {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    const featured = products.filter(p => p.featuredOnHome);
    const toDisplay = featured.length > 0 ? featured : products.slice(0, 4);

    const cardsHtml = toDisplay.map((p, idx) => {
      const badgeBg = p.accent === 'Red' ? '#D7262E' : 
                      (p.accent === 'Green' ? 'var(--color-leaf-green)' : 
                      (p.accent === 'Blue' ? '#1F4E9C' : 'var(--color-forest-deep)'));
      return `
        <!-- Product ${idx + 1}: ${p.name} -->
        <article class="product-card reveal reveal-scale delay-${(idx % 4) + 1}">
          <div class="product-card-topbar">
            <span class="product-badge" style="background: ${badgeBg};">${p.badge || 'Top Class Quality'}</span>
            <span class="product-category-tag">${p.categoryLabel || p.category}</span>
          </div>
          <div class="product-thumb-wrapper">
            <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='assets/logo.svg'">
          </div>
          <div class="product-body">
            <h3 class="product-title" style="margin-bottom: 2px;">${p.name}</h3>
            <span style="font-size: 0.85rem; color: var(--color-leaf-green); font-weight: 600;">${p.hindiName || ''}</span>
            <p class="product-botanical" style="color: var(--color-text-muted); font-size: 0.85rem; margin-top: 4px;">${p.type || ''}</p>
            <p class="product-desc">${p.description || ''}</p>
            <div class="product-specs-list" style="background: #F9FAF5; border-radius: 8px; padding: 8px 12px; margin-bottom: 16px;">
              <div class="spec-row"><span class="spec-key">Maturity:</span><span class="spec-val">${p.maturity || '-'}</span></div>
              <div class="spec-row"><span class="spec-key">Pack Size:</span><span class="spec-val">${p.packaging || '-'}</span></div>
              ${p.security ? `<div class="spec-row"><span class="spec-key">Security:</span><span class="spec-val" style="color: #D7262E;">${p.security}</span></div>` : ''}
            </div>
            <div class="product-footer">
              <a href="contact.html?product=${encodeURIComponent(p.name)}" class="btn btn-primary">Enquire Now</a>
              <a href="products.html" class="btn btn-outline-forest">All Seeds</a>
            </div>
          </div>
        </article>`;
    }).join('\n');

    const regex = /(<div class="products-grid"[^>]*id="homeFeaturedProductsGrid"[^>]*>)([\s\S]*?)(<\/div>\s*<div style="text-align: center; margin-top: 50px;">)/;
    if (regex.test(indexHtml)) {
      indexHtml = indexHtml.replace(regex, `$1\n${cardsHtml}\n      $3`);
      fs.writeFileSync(indexPath, indexHtml, 'utf8');
      console.log('Successfully updated index.html featured products static HTML');
    }
  } catch (e) {
    console.error('Error updating index.html static products:', e);
  }
}

function updateGalleryJs(gallery) {
  try {
    const galleryJsPath = path.join(PUBLIC_DIR, 'js', 'gallery.js');
    if (!fs.existsSync(galleryJsPath)) return;
    let content = fs.readFileSync(galleryJsPath, 'utf8');
    const regex = /(const GALLERY_DATA\s*=\s*)\[[\s\S]*?\n\];/;
    if (regex.test(content)) {
      content = content.replace(regex, `$1${JSON.stringify(gallery, null, 2)};`);
      fs.writeFileSync(galleryJsPath, content, 'utf8');
      console.log('Successfully updated js/gallery.js GALLERY_DATA');
    }
  } catch (e) {
    console.error('Error updating js/gallery.js:', e);
  }
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // --- API ROUTE: LIST EXISTING PRODUCT IMAGES ---
  if (req.url === '/api/list-images' && req.method === 'GET') {
    try {
      const dir = path.join(PUBLIC_DIR, 'assets', 'products');
      const files = fs.readdirSync(dir).filter(f => /\.(png|jpe?g|webp|svg)$/i.test(f));
      const list = files.map(f => ({
        filename: f,
        path: `assets/products/${f}`
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, images: list }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // --- API ROUTE: LIST GALLERY IMAGES ---
  if (req.url.startsWith('/api/list-gallery-images') && req.method === 'GET') {
    try {
      const galleryDir = path.join(PUBLIC_DIR, 'assets', 'gallery');
      const productsDir = path.join(PUBLIC_DIR, 'assets', 'products');
      let list = [];
      if (fs.existsSync(galleryDir)) {
        const files = fs.readdirSync(galleryDir).filter(f => /\.(png|jpe?g|webp|svg)$/i.test(f));
        list = list.concat(files.map(f => ({
          filename: f,
          path: `assets/gallery/${f}`
        })));
      }
      if (fs.existsSync(productsDir)) {
        const pFiles = fs.readdirSync(productsDir).filter(f => /\.(png|jpe?g|webp|svg)$/i.test(f));
        list = list.concat(pFiles.map(f => ({
          filename: f,
          path: `assets/products/${f}`
        })));
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, images: list }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // --- API ROUTE: UPLOAD NEW IMAGE (PRODUCT OR GALLERY) ---
  if (req.url === '/api/upload-image' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.data || !payload.filename) {
          throw new Error('Filename and image data are required');
        }

        // Clean filename and remove unsafe characters
        const originalName = path.basename(payload.filename).replace(/[^a-zA-Z0-9.-]/g, '_');
        const ext = path.extname(originalName) || '.png';
        const baseName = path.basename(originalName, ext);
        const finalName = `${baseName}-${Date.now()}${ext}`;

        // Strip data:image/...;base64,
        const base64Data = payload.data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const folder = (payload.folder === 'gallery') ? 'gallery' : 'products';
        const destDir = path.join(PUBLIC_DIR, 'assets', folder);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        const destPath = path.join(destDir, finalName);
        fs.writeFileSync(destPath, buffer);

        const imagePath = `assets/${folder}/${finalName}`;
        console.log(`Image uploaded successfully: ${imagePath} (${buffer.length} bytes)`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          filename: finalName,
          imagePath: imagePath,
          message: 'Image uploaded successfully!'
        }));
      } catch (err) {
        console.error('Upload error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- API ROUTE: SAVE PRODUCTS, CONFIG & GALLERY FROM ADMIN PANEL ---
  if (req.url === '/api/save-data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);

        // 1. Save products if provided
        if (payload.products && Array.isArray(payload.products)) {
          // Save products.json
          fs.writeFileSync(path.join(PUBLIC_DIR, 'products.json'), JSON.stringify(payload.products, null, 2), 'utf8');

          // Save js/products-data.js
          const productsJsContent = `/**
 * TAJ SEEDS AGRI SCIENCES (PVT. LTD.)
 * Authentic Product Catalog Data Store
 * Tagline: "Every Step with Farmer" / "ताज किसानों का हमसफर"
 * Auto-saved from Admin Panel on ${new Date().toISOString()}
 */

const TAJ_PRODUCTS = ${JSON.stringify(payload.products, null, 2)};
`;
          fs.writeFileSync(path.join(PUBLIC_DIR, 'js', 'products-data.js'), productsJsContent, 'utf8');

          // Update index.html static featured products
          updateIndexHtmlProducts(payload.products);
        }

        // 2. Save site config if provided
        if (payload.config) {
          const configJsContent = `/**
 * TAJ SEEDS AGRI SCIENCES (PVT. LTD.)
 * MASTER SITE CONFIGURATION
 * Auto-saved from Admin Panel on ${new Date().toISOString()}
 */

const SITE_CONFIG = ${JSON.stringify(payload.config, null, 2)};

// Auto-sync function to update elements across any page automatically
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-bind="phone1"]').forEach(el => {
    el.textContent = SITE_CONFIG.company.phone1;
    if (el.tagName === 'A') el.href = \`tel:\${SITE_CONFIG.company.phone1Raw}\`;
  });

  document.querySelectorAll('[data-bind="phone2"]').forEach(el => {
    el.textContent = SITE_CONFIG.company.phone2;
    if (el.tagName === 'A') el.href = \`tel:\${SITE_CONFIG.company.phone2Raw}\`;
  });

  document.querySelectorAll('[data-bind="email"]').forEach(el => {
    el.textContent = SITE_CONFIG.company.email;
    if (el.tagName === 'A') el.href = \`mailto:\${SITE_CONFIG.company.email}\`;
  });

  document.querySelectorAll('[data-bind="address"]').forEach(el => {
    el.textContent = SITE_CONFIG.company.address.full;
  });

  document.querySelectorAll('[data-bind="tagline"]').forEach(el => {
    el.textContent = \`"\${SITE_CONFIG.company.tagline}"\`;
  });

  const floatingWa = document.querySelector('.floating-whatsapp');
  if (floatingWa) {
    floatingWa.href = \`https://wa.me/\${SITE_CONFIG.company.whatsapp}?text=\${encodeURIComponent(SITE_CONFIG.company.whatsappMessage)}\`;
  }
});
`;
          fs.writeFileSync(path.join(PUBLIC_DIR, 'js', 'site-config.js'), configJsContent, 'utf8');
        }

        // 3. Save gallery if provided
        if (payload.gallery && Array.isArray(payload.gallery)) {
          // Save gallery.json
          fs.writeFileSync(path.join(PUBLIC_DIR, 'gallery.json'), JSON.stringify(payload.gallery, null, 2), 'utf8');

          // Update js/gallery.js
          updateGalleryJs(payload.gallery);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Settings & products saved successfully!' }));
      } catch (err) {
        console.error('Save error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- STATIC FILE SERVING ---
  let reqUrl = req.url.split('?')[0].split('#')[0];
  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>404 Not Found - Taj Seeds</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 60px;">
          <h1 style="color: #1F5733;">404 - Page Not Found</h1>
          <p>The requested file <code>${reqUrl}</code> could not be found.</p>
          <a href="/index.html" style="color: #2E9E44; font-weight: bold;">Back to Taj Seeds Home</a>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(` Taj Seeds Agri Sciences Website Server Running!    `);
  console.log(` Local URL:   http://localhost:${PORT}/            `);
  console.log(` Admin URL:   http://localhost:${PORT}/admin.html   `);
  console.log(` Network URL: http://127.0.0.1:${PORT}/            `);
  console.log(`====================================================`);
});
