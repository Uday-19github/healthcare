// Inject full treatment grid into index.html
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const indexPath = path.join(__dirname, 'index.html');
const snippetPath = path.join(__dirname, '.treatment-grid-snippet.html');

let html = fs.readFileSync(indexPath, 'utf8');
const snippet = fs.readFileSync(snippetPath, 'utf8');

const startMarker = '<!-- TREATMENT_GRID -->';
const endMarker = '<!-- /TREATMENT_GRID -->';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find treatment grid markers in index.html');
  process.exit(1);
}

const before = html.slice(0, startIdx);
const after = html.slice(endIdx + endMarker.length);

const block = `<!-- TREATMENT_GRID -->
    <div id="treatmentGrid" class="treatment-grid treatment-grid--collapsed">
      ${snippet}
    </div>
    <!-- /TREATMENT_GRID -->`;

fs.writeFileSync(indexPath, before + block + after);
console.log('✅ Updated index.html with collapsible treatment grid');

fs.unlinkSync(snippetPath);
