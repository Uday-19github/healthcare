// ============================================================
// G-1 Health Care — Page Generator
// Generates a static HTML file for each treatment & specialty
// from data/treatments.js
// ============================================================

import { treatments, specialties, cities } from './data/treatments.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BRAND = 'G-1 Health Care';
const CONTACT_PHONE_1 = '8417050679';
const CONTACT_PHONE_2 = '9773504471';
const CONTACT_PHONE_TEL_1 = 'tel:+918417050679';
const CONTACT_PHONE_TEL_2 = 'tel:+919773504471';
const CONTACT_EMAIL = 'gonehealthcare1@gmail.com';

function buildLogo(prefix = '', footer = false) {
  const footerClass = footer ? ' logo--footer' : '';
  return `<a href="${prefix}index.html" class="logo${footerClass}" aria-label="${BRAND} home">
      <img src="${prefix}assets/logo.png" alt="" class="logo__img" width="140" height="52" aria-hidden="true" />
      <div class="logo__text">
        <span class="logo__name"><span class="logo__health">G-1 HEALTH</span> <span class="logo__care">CARE</span></span>
        <span class="logo__tag">Care. Compassion. Commitment.</span>
      </div>
    </a>`;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build directories
const treatmentsDir = path.join(__dirname, 'pages', 'treatments');
const specialtiesDir = path.join(__dirname, 'pages', 'specialties');
fs.mkdirSync(treatmentsDir, { recursive: true });
fs.mkdirSync(specialtiesDir, { recursive: true });

// Reusable HTML chunks
const FORMSPREE = 'https://formspree.io/f/xvzlpngn';

const FAVICON_LINKS = `
<link rel="icon" type="image/png" href="${'../../'}assets/logo.png" />
<link rel="icon" type="image/png" sizes="32x32" href="${'../../'}assets/logo.png" />
<link rel="apple-touch-icon" sizes="180x180" href="${'../../'}assets/logo.png" />`;

const cityOptions = cities.map(c => `<option>${c}</option>`).join('');
const allTreatmentOptions = Object.values(treatments)
  .map(t => `<option value="${t.name}">${t.name}</option>`)
  .join('');

// Build the spec-bar (mega menu) shared across all pages
function buildSpecBar(currentPath = '') {
  const isHome = currentPath === '';
  const prefix = isHome ? '' : '../../';

  let bar = `<nav class="spec-bar" id="specBar" aria-label="Specialties">
  <div class="container spec-bar__inner">
    <ul class="spec-bar__list">`;

  Object.values(specialties).forEach(spec => {
    const specTreatments = spec.treatments
      .map(slug => treatments[slug])
      .filter(Boolean);

    const cols = chunk(specTreatments, Math.ceil(specTreatments.length / 2));
    const isDouble = cols.length > 1 && specTreatments.length > 5;

    bar += `
      <li class="spec-bar__item">
        <button type="button" class="spec-bar__btn" aria-expanded="false">${spec.name} <span class="caret"></span></button>
        <div class="megamenu ${isDouble ? 'megamenu--double' : 'megamenu--single'}">`;

    if (isDouble) {
      cols.forEach((col, i) => {
        bar += `
          <div class="megamenu__col">
            <h6>${spec.name}${cols.length > 1 ? ` — Part ${i+1}` : ''}</h6>`;
        col.forEach(t => {
          bar += `<a href="${prefix}pages/treatments/${t.slug}.html">${t.name}</a>`;
        });
        bar += `
            <a href="${prefix}pages/specialties/${spec.slug}.html" class="view-all">View all →</a>
          </div>`;
      });
    } else {
      bar += `
          <div class="megamenu__col">
            <h6>${spec.name}</h6>`;
      specTreatments.forEach(t => {
        bar += `<a href="${prefix}pages/treatments/${t.slug}.html">${t.name}</a>`;
      });
      bar += `
            <a href="${prefix}pages/specialties/${spec.slug}.html" class="view-all">View all ${spec.name} →</a>
          </div>`;
    }

    bar += `
        </div>
      </li>`;
  });

  bar += `
    </ul>
    <button class="spec-bar__scroll spec-bar__scroll--left" aria-label="Scroll left" data-dir="left">‹</button>
    <button class="spec-bar__scroll spec-bar__scroll--right" aria-label="Scroll right" data-dir="right">›</button>
  </div>
</nav>`;
  return bar;
}

// Build header
function buildHeader(prefix = '') {
  return `<div class="top-strip">
  <div class="container top-strip__inner">
    <span class="ts-pill">🏥 NABH Accredited Hospitals</span>
    <span class="ts-text">Cashless Insurance · No-Cost EMI · Free Pickup &amp; Drop</span>
<a class="ts-call" href="${CONTACT_PHONE_TEL_1}">📞${CONTACT_PHONE_1}</a><a class="ts-call" href="${CONTACT_PHONE_TEL_2}">${CONTACT_PHONE_2}</a>
  </div>
</div>

<header class="site-header" id="siteHeader">
  <div class="container header__inner">
    ${buildLogo(prefix)}

    <nav class="main-nav">
      <a href="${prefix}index.html#specialities">Specialities</a>
      <a href="${prefix}index.html#hospitals">Hospitals</a>
      <a href="${prefix}index.html#why">Why Us</a>
      <a href="${prefix}index.html#reviews">Reviews</a>
      <a href="${prefix}index.html#faq">FAQs</a>
      <a href="${prefix}index.html#contact">Contact</a>
    </nav>

    <div class="header-cta">
      <a href="${CONTACT_PHONE_TEL_1}" class="header-call" aria-label="Call us">
        <span class="dot"></span> Call Us
      </a>
      <button class="btn btn--primary" data-open-modal>Book Free Appointment</button>
      <button type="button" class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>`;
}

// Build appointment modal
function buildModal() {
  return `<div class="modal" id="bookModal" aria-hidden="true">
  <div class="modal__backdrop" data-close-modal></div>
  <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <button class="modal__close" data-close-modal aria-label="Close">×</button>
    <div class="modal__head">
      <span class="form-card__badge">FREE</span>
      <h3 id="modalTitle">Book Your Free Consultation</h3>
      <p>Our care coordinator will call you within 5 minutes</p>
    </div>
    <form class="appt-form" action="${FORMSPREE}" method="POST" data-form="modal">
      <div class="field">
        <label for="m_name">Patient Name</label>
        <input id="m_name" name="name" type="text" required placeholder="Enter your full name" />
      </div>
      <div class="field-row">
        <div class="field">
          <label for="m_phone">Mobile Number</label>
          <div class="phone-input">
            <span>+91</span>
            <input id="m_phone" name="phone" type="tel" pattern="[0-9]{10}" maxlength="10" required placeholder="10-digit mobile" />
          </div>
        </div>
        <div class="field">
          <label for="m_city">City</label>
          <select id="m_city" name="city" required>
            <option value="">Select City</option>
            ${cityOptions}
          </select>
        </div>
      </div>
      <div class="field">
        <label for="m_disease">Treatment / Disease</label>
        <select id="m_disease" name="disease" required>
          <option value="">Select Disease</option>
          ${allTreatmentOptions}
        </select>
      </div>
      <input type="hidden" name="_subject" value="New Lead from ${BRAND} Modal" />
      <input type="hidden" name="form_source" value="Modal Form" />
      <button type="submit" class="btn btn--primary btn--block btn--lg">Book FREE Appointment</button>
      <p class="form-card__note">No booking fees · Calls within 5 minutes</p>
      <div class="form-status" role="status" aria-live="polite"></div>
    </form>
  </div>
</div>

<div class="mobile-cta">
  <a href="${CONTACT_PHONE_TEL_1}" class="mobile-cta__call">📞 Call</a>
  <button class="mobile-cta__book btn btn--primary" data-open-modal>Book Free Appointment</button>
</div>`;
}

// Build footer
function buildFooter(prefix = '') {
  const home = `${prefix}index.html`;
  const specs = Object.values(specialties);

  return `<footer class="footer">
  <div class="container footer__grid">
    <div class="footer__brand">
      ${buildLogo(prefix, true)}
      <p>Pioneering surgical healthcare across India. Advanced laser &amp; laparoscopic techniques, evidence-based care, and a team that treats you like family.</p>
      <ul class="footer__contact">
        <li><span>📞</span> <a href="${CONTACT_PHONE_TEL_1}">${CONTACT_PHONE_1}</a><span aria-hidden="true">/</span><a href="${CONTACT_PHONE_TEL_2}">${CONTACT_PHONE_2}</a></li>
        <li><span>✉️</span> <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></li>
      </ul>
      <div class="footer__social">
        <a href="#" aria-label="Facebook">f</a>
        <a href="#" aria-label="Instagram">ig</a>
        <a href="#" aria-label="LinkedIn">in</a>
        <a href="#" aria-label="YouTube">▶</a>
      </div>
    </div>

    <div class="footer__col">
      <h5>Quick Links</h5>
      <a href="${home}#specialities">Specialities</a>
      <a href="${home}#hospitals">Hospitals</a>
      <a href="${home}#why">Why Us</a>
      <a href="${home}#reviews">Reviews</a>
      <a href="${home}#faq">FAQs</a>
      <a href="${home}#contact">Contact</a>
    </div>

    <div class="footer__col">
      <h5>Specialties</h5>
      ${specs.slice(0, 6).map(s =>
        `<a href="${prefix}pages/specialties/${s.slug}.html">${s.name}</a>`
      ).join('')}
    </div>

    <div class="footer__col">
      <h5>More Specialties</h5>
      ${specs.slice(6).map(s =>
        `<a href="${prefix}pages/specialties/${s.slug}.html">${s.name}</a>`
      ).join('')}
    </div>

    <div class="footer__col">
      <h5>For Patients</h5>
      <a href="${home}#contact">Book Appointment</a>
      <a href="${home}#faq">Patient FAQs</a>
      <a href="${home}#hospitals">Find a Hospital</a>
      <a href="${home}#reviews">Patient Stories</a>
      <a href="${CONTACT_PHONE_TEL_1}">Call Helpline</a>
    </div>
  </div>

  <nav class="footer__nav" aria-label="Footer navigation">
    <div class="container footer__nav-inner">
      <a href="${home}#specialities">Specialities</a>
      <a href="${home}#hospitals">Hospitals</a>
      <a href="${home}#why">Why Us</a>
      <a href="${home}#reviews">Reviews</a>
      <a href="${home}#faq">FAQs</a>
      <a href="${home}#contact">Contact</a>
      <button type="button" class="footer__nav-cta" data-open-modal>Book Free Appointment</button>
    </div>
  </nav>

  <div class="footer__bottom">
    <div class="container footer__bottom-inner">
      <span>© 2026 ${BRAND}. All rights reserved.</span>
      <div>
        <a href="#">Terms &amp; Conditions</a>
        <a href="#">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>`;
}

// Build a treatment page
function buildTreatmentPage(t) {
  const spec = specialties[t.specialty];
  const relatedTreatments = spec.treatments
    .filter(slug => slug !== t.slug)
    .slice(0, 4)
    .map(slug => treatments[slug])
    .filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${t.title} | ${BRAND}</title>
<meta name="description" content="${t.overview.slice(0, 160)}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
${FAVICON_LINKS}
<link rel="stylesheet" href="../../styles.css" />
</head>
<body>

<div class="bg-glow bg-glow--1" aria-hidden="true"></div>
<div class="bg-glow bg-glow--2" aria-hidden="true"></div>
<div class="bg-glow bg-glow--3" aria-hidden="true"></div>

${buildHeader('../../')}
${buildSpecBar('treatments')}

<!-- ============== BREADCRUMB ============== -->
<div class="breadcrumb">
  <div class="container">
    <a href="../../index.html">Home</a>
    <span>›</span>
    <a href="../specialties/${spec.slug}.html">${spec.name}</a>
    <span>›</span>
    <span class="current">${t.name}</span>
  </div>
</div>

<!-- ============== TREATMENT HERO ============== -->
<section class="t-hero" style="--spec-color: ${spec.color}">
  <div class="container t-hero__grid">
    <div class="t-hero__copy">
      <span class="t-hero__breadcrumb-tag">${spec.icon} ${spec.name}</span>
      <h1>${t.title}</h1>
      <p class="t-hero__overview">${t.overview}</p>

      <div class="t-hero__meta">
        <div class="t-meta-item">
          <span class="t-meta-icon">⏱️</span>
          <div>
            <span class="t-meta-label">Procedure Time</span>
            <span class="t-meta-value">15–60 min</span>
          </div>
        </div>
        <div class="t-meta-item">
          <span class="t-meta-icon">🏥</span>
          <div>
            <span class="t-meta-label">Hospital Stay</span>
            <span class="t-meta-value">Daycare</span>
          </div>
        </div>
        <div class="t-meta-item">
          <span class="t-meta-icon">🔄</span>
          <div>
            <span class="t-meta-label">Recovery</span>
            <span class="t-meta-value">Quick</span>
          </div>
        </div>
      </div>

      <div class="t-hero__ctas">
        <button class="btn btn--primary btn--lg" data-open-modal>Book Free Consultation →</button>
        <a href="${CONTACT_PHONE_TEL_1}" class="btn btn--ghost btn--lg">📞 Call Now</a>
      </div>
    </div>

    <!-- INLINE FORM -->
    <aside class="hero__form-card t-hero__form-card">
      <div class="form-card__head">
        <span class="form-card__badge">FREE</span>
        <h3>Get Treatment Details</h3>
        <p>Speak with our ${spec.name} expert</p>
      </div>
      <form class="appt-form" action="${FORMSPREE}" method="POST" data-form="treatment-${t.slug}">
        <div class="field">
          <label for="th_name">Patient Name</label>
          <input id="th_name" name="name" type="text" required placeholder="Enter your full name" />
        </div>
        <div class="field-row">
          <div class="field">
            <label for="th_phone">Mobile Number</label>
            <div class="phone-input">
              <span>+91</span>
              <input id="th_phone" name="phone" type="tel" pattern="[0-9]{10}" maxlength="10" required placeholder="10-digit mobile" />
            </div>
          </div>
          <div class="field">
            <label for="th_city">City</label>
            <select id="th_city" name="city" required>
              <option value="">Select City</option>
              ${cityOptions}
            </select>
          </div>
        </div>
        <input type="hidden" name="treatment" value="${t.name}" />
        <input type="hidden" name="specialty" value="${spec.name}" />
        <input type="hidden" name="_subject" value="New Lead — ${t.name}" />
        <input type="hidden" name="form_source" value="Treatment Page: ${t.name}" />
        <button type="submit" class="btn btn--primary btn--block btn--lg">Book FREE Appointment</button>
        <p class="form-card__note">No booking fees · Free consultation</p>
        <div class="form-status" role="status" aria-live="polite"></div>
      </form>
    </aside>
  </div>
</section>

<!-- ============== TREATMENT CONTENT ============== -->
<section class="t-content">
  <div class="container t-content__grid">
    <div class="t-content__main">

      ${t.symptoms.length ? `
      <div class="t-section" id="symptoms">
        <span class="eyebrow"><span class="eyebrow__dot"></span> Symptoms</span>
        <h2>Symptoms of ${t.name}</h2>
        <p class="t-section__intro">If you experience any of the following symptoms, consult a specialist promptly:</p>
        <ul class="t-list">
          ${t.symptoms.map(s => `<li><span class="t-list__bullet">⊕</span>${s}</li>`).join('')}
        </ul>
      </div>` : ''}

      ${t.causes.length ? `
      <div class="t-section" id="causes">
        <span class="eyebrow"><span class="eyebrow__dot"></span> Causes</span>
        <h2>What Causes It?</h2>
        <p class="t-section__intro">Understanding the underlying causes helps in prevention and treatment:</p>
        <ul class="t-list">
          ${t.causes.map(c => `<li><span class="t-list__bullet">⊕</span>${c}</li>`).join('')}
        </ul>
      </div>` : ''}

      <div class="t-section" id="procedure">
        <span class="eyebrow"><span class="eyebrow__dot"></span> Procedure</span>
        <h2>How the Procedure Works</h2>
        <p>${t.procedure}</p>
      </div>

      <div class="t-section" id="benefits">
        <span class="eyebrow"><span class="eyebrow__dot"></span> Benefits</span>
        <h2>Benefits of Choosing ${BRAND}</h2>
        <div class="benefits-grid">
          ${t.benefits.map((b, i) => `
            <div class="benefit-card">
              <span class="benefit-card__num">${(i+1).toString().padStart(2, '0')}</span>
              <p>${b}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="t-section" id="recovery">
        <span class="eyebrow"><span class="eyebrow__dot"></span> Recovery</span>
        <h2>Recovery &amp; Aftercare</h2>
        <p>${t.recovery}</p>
      </div>

      <div class="t-section t-section--cta">
        <h3>Ready to take the next step?</h3>
        <p>Speak with our ${spec.name} expert today — free consultation, no obligation.</p>
        <button class="btn btn--primary btn--lg" data-open-modal>Book Free Consultation →</button>
      </div>

    </div>

    <!-- SIDEBAR -->
    <aside class="t-sidebar">
      <div class="t-sidebar__card">
        <h4>Why ${BRAND} for ${t.name}?</h4>
        <ul>
          <li>✓ Expert ${spec.name} surgeons</li>
          <li>✓ NABH-accredited hospitals</li>
          <li>✓ USFDA-approved techniques</li>
          <li>✓ Cashless insurance support</li>
          <li>✓ EMI &amp; payment support</li>
          <li>✓ Free pickup &amp; drop</li>
          <li>✓ Post-surgery follow-up</li>
        </ul>
      </div>

      <div class="t-sidebar__card t-sidebar__card--dark">
        <h4>Quick Stats</h4>
        <div class="t-stat"><span class="t-stat__num">30K+</span><span>Happy Patients</span></div>
        <div class="t-stat"><span class="t-stat__num">100+</span><span>Expert Surgeons</span></div>
        <div class="t-stat"><span class="t-stat__num">30+</span><span>Cities Across India</span></div>
        <div class="t-stat"><span class="t-stat__num">95%+</span><span>Success Rate</span></div>
      </div>

      <div class="t-sidebar__cta">
        <h4>Need help deciding?</h4>
        <p>Talk to our care coordinator — free, no obligation.</p>
        <a href="${CONTACT_PHONE_TEL_1}" class="btn btn--primary btn--block">📞 Call ${CONTACT_PHONE_1}<span aria-hidden="true">/</span>${CONTACT_PHONE_2}</a>
      </div>
    </aside>
  </div>
</section>

<!-- RELATED TREATMENTS -->
${relatedTreatments.length ? `
<section class="related">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow"><span class="eyebrow__dot"></span> Related Treatments</span>
      <h2>Other ${spec.name} <em>treatments</em></h2>
    </div>
    <div class="related-grid">
      ${relatedTreatments.map(r => `
        <a href="${r.slug}.html" class="related-card">
          <div class="related-card__icon">${r.icon}</div>
          <h4>${r.name}</h4>
          <p>${r.overview.slice(0, 100)}...</p>
          <span class="related-card__link">Learn more →</span>
        </a>
      `).join('')}
    </div>
  </div>
</section>` : ''}

${buildFooter('../../')}
${buildModal()}

<script src="/script.js" defer></script>
</body>
</html>`;
}

// Build a specialty page (lists all treatments under it)
function buildSpecialtyPage(spec) {
  const specTreatments = spec.treatments
    .map(slug => treatments[slug])
    .filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${spec.name} Treatments | ${BRAND}</title>
<meta name="description" content="${spec.description}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="../../styles.css" />
</head>
<body>

<div class="bg-glow bg-glow--1" aria-hidden="true"></div>
<div class="bg-glow bg-glow--2" aria-hidden="true"></div>
<div class="bg-glow bg-glow--3" aria-hidden="true"></div>

${buildHeader('../../')}
${buildSpecBar('specialties')}

<div class="breadcrumb">
  <div class="container">
    <a href="../../index.html">Home</a>
    <span>›</span>
    <span class="current">${spec.name}</span>
  </div>
</div>

<!-- SPECIALTY HERO -->
<section class="spec-hero" style="--spec-color: ${spec.color}">
  <div class="container spec-hero__grid">
    <div class="spec-hero__copy">
      <span class="spec-hero__icon-wrap">${spec.icon}</span>
      <h1>${spec.name}</h1>
      <p class="spec-hero__tagline">${spec.tagline}</p>
      <p class="spec-hero__desc">${spec.description}</p>
      <div class="spec-hero__ctas">
        <button class="btn btn--primary btn--lg" data-open-modal>Book Free Consultation →</button>
        <a href="${CONTACT_PHONE_TEL_1}" class="btn btn--ghost btn--lg">📞 Call Expert</a>
      </div>
    </div>
    <aside class="hero__form-card t-hero__form-card">
      <div class="form-card__head">
        <span class="form-card__badge">FREE</span>
        <h3>Speak to a ${spec.name} Expert</h3>
        <p>Our specialist will call you back</p>
      </div>
      <form class="appt-form" action="${FORMSPREE}" method="POST" data-form="specialty-${spec.slug}">
        <div class="field">
          <label for="sh_name">Patient Name</label>
          <input id="sh_name" name="name" type="text" required placeholder="Full name" />
        </div>
        <div class="field-row">
          <div class="field">
            <label for="sh_phone">Mobile</label>
            <div class="phone-input">
              <span>+91</span>
              <input id="sh_phone" name="phone" type="tel" pattern="[0-9]{10}" maxlength="10" required placeholder="10-digit mobile" />
            </div>
          </div>
          <div class="field">
            <label for="sh_city">City</label>
            <select id="sh_city" name="city" required>
              <option value="">Select City</option>
              ${cityOptions}
            </select>
          </div>
        </div>
        <div class="field">
          <label for="sh_treat">Treatment</label>
          <select id="sh_treat" name="treatment" required>
            <option value="">Select Treatment</option>
            ${specTreatments.map(t => `<option value="${t.name}">${t.name}</option>`).join('')}
          </select>
        </div>
        <input type="hidden" name="specialty" value="${spec.name}" />
        <input type="hidden" name="_subject" value="New Lead — ${spec.name}" />
        <input type="hidden" name="form_source" value="Specialty Page: ${spec.name}" />
        <button type="submit" class="btn btn--primary btn--block btn--lg">Book FREE Appointment</button>
        <div class="form-status" role="status" aria-live="polite"></div>
      </form>
    </aside>
  </div>
</section>

<!-- ALL TREATMENTS UNDER THIS SPECIALTY -->
<section class="spec-treatments">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow"><span class="eyebrow__dot"></span> Treatments</span>
      <h2>${spec.name} <em>treatments we offer</em></h2>
      <p>Click any treatment for detailed information, recovery guidance, and to book a free consultation.</p>
    </div>

    <div class="spec-treat-grid">
      ${specTreatments.map(t => `
        <a href="../treatments/${t.slug}.html" class="spec-treat-card">
          <div class="spec-treat-card__icon">${t.icon}</div>
          <h3>${t.name}</h3>
          <p>${t.overview.slice(0, 130)}...</p>
          <span class="spec-treat-card__link">Learn more →</span>
        </a>
      `).join('')}
    </div>
  </div>
</section>

<!-- WHY US -->
<section class="why">
  <div class="container why__grid">
    <div class="why__intro">
      <span class="eyebrow"><span class="eyebrow__dot"></span> Why ${BRAND}</span>
      <h2>${spec.name} care, <em>done right.</em></h2>
      <p>Specialist surgeons, modern hospitals and a dedicated coordinator — every step of the way.</p>
      <button class="btn btn--primary" data-open-modal>Book Free Appointment</button>
    </div>
    <div class="why__steps">
      <div class="why-step">
        <span class="why-step__num">01</span>
        <h3>Expert ${spec.name} surgeons</h3>
        <p>Senior consultants with decades of experience, exclusively dedicated to ${spec.name.toLowerCase()}.</p>
      </div>
      <div class="why-step">
        <span class="why-step__num">02</span>
        <h3>Modern technology</h3>
        <p>USFDA-approved techniques and equipment for safer, faster procedures.</p>
      </div>
      <div class="why-step">
        <span class="why-step__num">03</span>
        <h3>Hassle-free experience</h3>
        <p>Insurance paperwork, free pickup &amp; drop, admission–discharge — all handled.</p>
      </div>
      <div class="why-step">
        <span class="why-step__num">04</span>
        <h3>Post-surgery care</h3>
        <p>Follow-up consultations, recovery guidance and a 24×7 helpline.</p>
      </div>
    </div>
  </div>
</section>

${buildFooter('../../')}
${buildModal()}

<script src="/script.js" defer></script>
</body>
</html>`;
}

// Homepage treatment cards (featured slugs match index.html grid)
const FEATURED_TREATMENT_ORDER = [
  'piles', 'fistula', 'fissure', 'gallstone', 'kidney-stones', 'cataract', 'lasik', 'hernia',
  'circumcision', 'prostate-enlargement', 'ivf', 'iui', 'fess', 'tonsillectomy', 'tympanoplasty',
  'gynecomastia', 'liposuction', 'varicose-veins', 'knee-replacement', 'hip-replacement',
  'hysterectomy', 'vaginoplasty', 'hymenoplasty'
];

function buildTreatmentCard(t, prefix = '') {
  const spec = specialties[t.specialty];
  const label = t.name.replace(/\s+Treatment$/i, '').replace(/\s+Surgery$/i, '');
  const tag = (t.benefits && t.benefits[0])
    ? t.benefits[0].split('—')[0].trim().slice(0, 36)
    : (spec?.tagline || 'Learn more').slice(0, 36);
  return `<a href="${prefix}pages/treatments/${t.slug}.html" class="t-card"><div class="t-card__icon">${t.icon}</div><h4>${label}</h4><span>${tag}</span></a>`;
}

function buildFullTreatmentGrid(prefix = '') {
  const featuredSet = new Set(FEATURED_TREATMENT_ORDER);
  const cards = [];
  FEATURED_TREATMENT_ORDER.forEach(slug => {
    if (treatments[slug]) cards.push(buildTreatmentCard(treatments[slug], prefix));
  });
  Object.values(treatments)
    .filter(t => !featuredSet.has(t.slug))
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(t => cards.push(buildTreatmentCard(t, prefix)));
  return cards.join('\n      ');
}

// Helpers
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// =================== GENERATE ===================
console.log('🏗️  Generating pages...\n');

let count = 0;
Object.values(treatments).forEach(t => {
  const html = buildTreatmentPage(t);
  fs.writeFileSync(path.join(treatmentsDir, `${t.slug}.html`), html);
  count++;
});
console.log(`✅ Generated ${count} treatment pages in /pages/treatments/`);

count = 0;
Object.values(specialties).forEach(s => {
  const html = buildSpecialtyPage(s);
  fs.writeFileSync(path.join(specialtiesDir, `${s.slug}.html`), html);
  count++;
});
console.log(`✅ Generated ${count} specialty pages in /pages/specialties/`);

// Also output the spec-bar HTML for use in index.html
const indexSpecBar = buildSpecBar('');
fs.writeFileSync(path.join(__dirname, '.spec-bar-snippet.html'), indexSpecBar);
console.log('✅ Generated spec-bar snippet for homepage');

const treatmentGrid = buildFullTreatmentGrid('');
fs.writeFileSync(path.join(__dirname, '.treatment-grid-snippet.html'), treatmentGrid);
console.log('✅ Generated treatment grid snippet for homepage');

console.log('\n🎉 Done!');
