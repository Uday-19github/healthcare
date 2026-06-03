import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FORBIDDEN_PATTERNS = [
  /\bnoindex\b(?![\w-])/i,
  /\bnofollow\b/i,
  /x-robots-tag\s*:/i,
  /robots\s*disallow/i,
  /disallow\s*:\s*/i,
  /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i,
  /<meta\s+name=["']robots["'][^>]*content=["'][^"']*nofollow/i,
];

function walk(dir) {
  let out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out = out.concat(walk(full));
    else out.push(full);
  }
  return out;
}

function shouldScan(filePath) {
  return (
    filePath.endsWith('.html') ||
    filePath.endsWith('.js') ||
    filePath.endsWith('.ts') ||
    filePath.endsWith('.css') ||
    filePath.endsWith('.json') ||
    filePath.endsWith('.txt') ||
    filePath.endsWith('.toml')
  );
}

function main() {
  const candidates = walk(__dirname)
    .filter((f) => shouldScan(f))
    .filter((f) => !f.endsWith('seo-audit-check.js'));

  const hits = [];
  for (const file of candidates) {
    const rel = path.relative(__dirname, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');

    for (const pat of FORBIDDEN_PATTERNS) {
      const m = content.match(pat);
      if (m) {
        hits.push({ file: rel, match: m[0] });
        break;
      }
    }
  }

  if (hits.length) {
console.error('❌ SEO indexing blockers found (build will fail):');
    console.error('Note: skipping this self-file to avoid false positives from tool text.');
    for (const h of hits) {
      console.error(`- ${h.file}: ${h.match}`);
    }
    process.exit(1);
  }

  console.log('✅ No indexing blocker patterns found.');
}

main();

