import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Auto-discover all generated pages for multi-page build
function getPageInputs() {
  const inputs = { main: resolve(__dirname, 'index.html') };

  const treatmentsDir = resolve(__dirname, 'pages/treatments');
  const specialtiesDir = resolve(__dirname, 'pages/specialties');

  if (fs.existsSync(treatmentsDir)) {
    fs.readdirSync(treatmentsDir).forEach(f => {
      if (f.endsWith('.html')) {
        inputs[`t_${f.replace('.html','')}`] = resolve(treatmentsDir, f);
      }
    });
  }
  if (fs.existsSync(specialtiesDir)) {
    fs.readdirSync(specialtiesDir).forEach(f => {
      if (f.endsWith('.html')) {
        inputs[`s_${f.replace('.html','')}`] = resolve(specialtiesDir, f);
      }
    });
  }
  return inputs;
}

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: getPageInputs()
    }
  }
});
