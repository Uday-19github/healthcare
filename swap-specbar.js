// Replace the old spec-bar block in index.html with the generated one
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const indexPath = path.join(__dirname, 'index.html');
const snippetPath = path.join(__dirname, '.spec-bar-snippet.html');

let html = fs.readFileSync(indexPath, 'utf8');
const snippet = fs.readFileSync(snippetPath, 'utf8');

// Find from "<!-- ============== SPECIALTY BAR" to "<!-- ============== HERO"
const startMarker = '<!-- ============== SPECIALTY BAR (mega-menu) ============== -->';
const endMarker = '<!-- ============== HERO ============== -->';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find spec-bar markers in index.html');
  process.exit(1);
}

const before = html.slice(0, startIdx);
const after = html.slice(endIdx);

const newBlock = `<!-- ============== SPECIALTY BAR (mega-menu) ============== -->
${snippet}

`;

fs.writeFileSync(indexPath, before + newBlock + after);
console.log('✅ Updated index.html with new spec-bar (linking to all pages)');

// Clean up the snippet file
fs.unlinkSync(snippetPath);
