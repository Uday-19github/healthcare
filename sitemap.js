import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://gonehealthcare.in';

function walkDir(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walkDir(full));
    else files.push(full);
  }
  return files;
}

function toLoc(urlPath) {
  const clean = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  return `${BASE_URL}${clean}`;
}

function buildSitemapXml(urls) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urlEntries = urls
    .sort()
    .map((u) => {
      return `  <url>\n    <loc>${u}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
}

function main() {
  const distDir = path.join(__dirname, 'dist');

  // Ensure dist exists (should, but be safe)
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  const urls = new Set();

  // Home
  urls.add(toLoc('/'));

  const candidates = [
    path.join(__dirname, 'pages', 'treatments'),
    path.join(__dirname, 'pages', 'specialties'),
  ];

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    const htmlFiles = walkDir(dir).filter((f) => f.endsWith('.html'));
    for (const filePath of htmlFiles) {
      const rel = path.relative(__dirname, filePath).replace(/\\/g, '/');
      // Match build URL paths (Vite copies these as /pages/.../*.html)
      urls.add(toLoc(`/${rel}`));
    }
  }

  const xml = buildSitemapXml(Array.from(urls));
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml);
  console.log(`✅ sitemap.xml generated with ${urls.size} URLs`);
}

main();

