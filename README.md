# MediCare+ — Healthcare Website (Multi-Page)

A modern healthcare website with **dedicated pages for every treatment and specialty**, mega-menu navigation, and Formspree integration on all forms.

## ✨ What's inside

- **1 home page** with hero, specialties, hospitals, testimonials, FAQ, contact
- **12 specialty pages** (Proctology, Laparoscopy, Gynaecology, ENT, Urology, Vascular, Aesthetics, Orthopedics, Ophthalmology, Fertility, Weight Loss, Dermatology)
- **67 treatment detail pages** — each with overview, symptoms, causes, procedure, benefits, recovery, cost, related treatments and a dedicated booking form
- **Mega-menu spec-bar** under the header — hover any specialty to see all its treatments, click any one to go to its full page
- **All forms** submit to Formspree (`xvzlpngn`) with a unique `form_source` so you can identify which page generated the lead

## 🚀 Quick Start

```bash
npm install
npm run dev
```

The site opens at **http://localhost:3000** with hot reload. The `dev` script auto-generates all treatment & specialty pages from data before starting the server.

## 📋 Available Scripts

| Command | What it does |
|---------|--------------|
| `npm run generate` | Regenerate all treatment & specialty pages from `data/treatments.js` |
| `npm run dev` | Generate pages + start dev server with hot reload |
| `npm start` | Same as `npm run dev` |
| `npm run build` | Generate pages + build optimized static files into `dist/` |
| `npm run preview` | Preview the production build |

## 📁 Project Structure

```
medicare-plus/
├── index.html                    # Home page
├── styles.css                    # Shared stylesheet
├── script.js                     # Shared JS (forms, menus, modal)
├── data/
│   └── treatments.js             # ALL content lives here
├── pages/
│   ├── treatments/               # 67 generated treatment pages
│   │   ├── piles.html
│   │   ├── hernia.html
│   │   ├── ivf.html
│   │   └── ... (64 more)
│   └── specialties/              # 12 generated specialty pages
│       ├── proctology.html
│       ├── gynaecology.html
│       └── ... (10 more)
├── build-pages.js                # Page generator
├── swap-specbar.js               # Updates spec-bar in index.html
├── vite.config.js
├── package.json
└── README.md
```

## ✏️ Editing Content

**All treatment data is in one file:** `data/treatments.js`

To edit any treatment's information (symptoms, causes, procedure, benefits, cost, etc.), update the relevant entry in that file, then run:

```bash
npm run generate
```

All affected pages are regenerated. To add a new treatment:

1. Add a new entry to the `treatments` object in `data/treatments.js`
2. Add its slug to the relevant specialty's `treatments` array
3. Run `npm run generate`

## 📨 Formspree Forms

All forms post to `https://formspree.io/f/xvzlpngn`. Each form sends a `form_source` field identifying its origin:

- `Hero Form` — homepage hero sidebar
- `Modal Form` — popup modal (every "Book Free Appointment" button)
- `Contact Section` — large form before footer on homepage
- `Footer Newsletter` — email signup
- `Treatment Page: <name>` — sidebar form on each treatment page
- `Specialty Page: <name>` — sidebar form on each specialty page

Treatment-page forms also send `treatment` and `specialty` fields automatically, so you know exactly which procedure the lead is interested in.

## 🌐 Deploy

After `npm run build`, the `dist/` folder is ready for any static host:

- **Vercel:** `vercel --prod`
- **Netlify:** drag-drop the `dist/` folder
- **GitHub Pages:** push `dist/` contents to `gh-pages` branch
- **Cloudflare Pages:** connect repo, set build command `npm run build`, output `dist`

## 🎨 Tech

- **Vite 5** — fast dev server + multi-page build
- Vanilla HTML/CSS/JS (no framework)
- Custom Node.js page generator (no templating engine — just clean string templates)
- Google Fonts: Fraunces + Plus Jakarta Sans
