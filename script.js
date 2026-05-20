/* ===========================================================
   MediCare+ — site interactions
   - Formspree AJAX submission for ALL forms
   - Modal open/close
   - Sticky header shadow
   - Scroll reveal
   =========================================================== */

(function () {
  'use strict';

  /* ---------- Sticky header ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Modal ---------- */
  const modal = document.getElementById('bookModal');
  const openers = document.querySelectorAll('[data-open-modal]');
  const closers = document.querySelectorAll('[data-close-modal]');

  const openModal = () => {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openers.forEach(b => b.addEventListener('click', openModal));
  closers.forEach(b => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
  });

  /* ---------- Mobile nav (hamburger toggles main-nav) ---------- */
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('.main-nav');
  const mobileNavMq = window.matchMedia('(max-width: 980px)');

  const closeMobileNav = () => {
    if (!nav) return;
    nav.classList.remove('is-open');
    hamburger?.classList.remove('is-open');
    hamburger?.setAttribute('aria-expanded', 'false');
  };

  if (hamburger && nav) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      const open = nav.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (mobileNavMq.matches) closeMobileNav();
      });
    });

    document.addEventListener('click', e => {
      if (!mobileNavMq.matches || !nav.classList.contains('is-open')) return;
      if (hamburger.contains(e.target) || nav.contains(e.target)) return;
      closeMobileNav();
    });
  }

  /* ---------- Smooth scroll close-modal-on-anchor ---------- */
  if (modal) {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        if (modal.classList.contains('is-open')) closeModal();
      });
    });
  }

  /* ---------- Formspree AJAX submission ---------- */
  const allForms = document.querySelectorAll('form[action*="formspree.io"]');

  allForms.forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const status = form.querySelector('.form-status');
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      // disable while sending
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending…';
        submitBtn.style.opacity = '0.75';
      }
      if (status) {
        status.className = 'form-status';
        status.textContent = '';
      }

      try {
        const data = new FormData(form);

        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          if (status) {
            status.className = 'form-status success';
            status.textContent = '✓ Thanks! Our care coordinator will call you shortly.';
          }
          form.reset();

          // if it's the modal form, close after a moment
          if (form.dataset.form === 'modal') {
            setTimeout(closeModal, 1800);
          }
        } else {
          const json = await res.json().catch(() => ({}));
          if (status) {
            status.className = 'form-status error';
            status.textContent = json.errors
              ? json.errors.map(x => x.message).join(', ')
              : 'Something went wrong. Please try again.';
          }
        }
      } catch (err) {
        if (status) {
          status.className = 'form-status error';
          status.textContent = 'Network error. Please check your connection and try again.';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.style.opacity = '';
        }
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(
    '.section-head, .t-card, .spec-card, .hosp-card, .t-card2, .why-step, .faq-item, .stat'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small stagger inside groups
          setTimeout(() => entry.target.classList.add('in'), (i % 6) * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Phone input — digits only ---------- */
  document.querySelectorAll('input[type="tel"]').forEach(inp => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(0, 10);
    });
  });

  /* ---------- Specialty mega-menu bar ---------- */
  const specBar = document.getElementById('specBar');
  if (specBar) {
    const items = specBar.querySelectorAll('.spec-bar__item');
    const list = specBar.querySelector('.spec-bar__list');
    const inner = specBar.querySelector('.spec-bar__inner');
    const scrollBtns = specBar.querySelectorAll('.spec-bar__scroll');
    const mobileSpecMq = window.matchMedia('(max-width: 980px)');
    const desktopSpecMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    let ignoreSpecOutsideClick = false;
    let desktopLeaveTimer = null;

    const isMobileSpec = () => mobileSpecMq.matches;
    const isDesktopSpec = () => desktopSpecMq.matches && !mobileSpecMq.matches;

    items.forEach(item => {
      const menu = item.querySelector('.megamenu');
      if (menu) item._megamenuEl = menu;
    });

    const getMenu = item => item._megamenuEl;

    const clearMegamenuPosition = menu => {
      if (!menu) return;
      menu.style.position = '';
      menu.style.top = '';
      menu.style.left = '';
      menu.style.right = '';
      menu.style.width = '';
      menu.style.maxWidth = '';
      menu.style.zIndex = '';
    };

    const portalMenu = item => {
      const menu = getMenu(item);
      if (!menu || menu.parentElement === document.body) return;
      menu._home = { parent: item, next: menu.nextSibling };
      document.body.appendChild(menu);
    };

    const restoreMenu = item => {
      const menu = getMenu(item);
      if (!menu?._home || menu.parentElement !== document.body) return;
      const { parent, next } = menu._home;
      if (next && next.parentNode === parent) parent.insertBefore(menu, next);
      else parent.appendChild(menu);
    };

    const clearDesktopHover = () => {
      clearTimeout(desktopLeaveTimer);
      items.forEach(i => {
        i.classList.remove('is-hover');
        clearMegamenuPosition(getMenu(i));
      });
    };

    const syncSpecBarOpenState = () => {
      const anyOpen = [...items].some(i => i.classList.contains('is-open'));
      specBar.classList.toggle('has-open-menu', anyOpen && isMobileSpec());
    };

    const closeAllSpecMenus = () => {
      clearDesktopHover();
      items.forEach(i => {
        i.classList.remove('is-open');
        i.querySelector('.spec-bar__btn')?.setAttribute('aria-expanded', 'false');
        const menu = getMenu(i);
        if (menu) {
          menu.classList.remove('is-open');
          restoreMenu(i);
          clearMegamenuPosition(menu);
        }
      });
      specBar.classList.remove('has-open-menu');
    };

    const positionMegamenu = item => {
      const btn = item.querySelector('.spec-bar__btn');
      const menu = getMenu(item);
      if (!btn || !menu) return;

      if (isMobileSpec()) portalMenu(item);
      else restoreMenu(item);

      const rect = btn.getBoundingClientRect();
      const pad = 12;
      const viewportW = window.innerWidth;

      menu.style.position = 'fixed';
      menu.style.top = `${rect.bottom}px`;
      menu.style.zIndex = isMobileSpec() ? '300' : '110';

      if (isMobileSpec()) {
        const useFullWidth = menu.classList.contains('megamenu--double');
        if (useFullWidth) {
          menu.style.left = `${pad}px`;
          menu.style.right = `${pad}px`;
          menu.style.width = 'auto';
          menu.style.maxWidth = 'none';
        } else {
          menu.style.right = 'auto';
          menu.style.width = 'auto';
          menu.style.maxWidth = `${viewportW - pad * 2}px`;
          let left = rect.left;
          const menuWidth = menu.offsetWidth || menu.getBoundingClientRect().width;
          if (left + menuWidth > viewportW - pad) {
            left = Math.max(pad, viewportW - menuWidth - pad);
          }
          menu.style.left = `${left}px`;
        }
        return;
      }

      menu.style.width = '';
      menu.style.maxWidth = '';
      let left = rect.left;
      const menuWidth = menu.offsetWidth || menu.getBoundingClientRect().width;
      if (left + menuWidth > viewportW - pad) {
        left = Math.max(pad, viewportW - menuWidth - pad);
      }
      menu.style.left = `${left}px`;
      menu.style.right = 'auto';
    };

    const openDesktopMenu = item => {
      clearTimeout(desktopLeaveTimer);
      items.forEach(i => i.classList.remove('is-hover'));
      item.classList.add('is-hover');
      positionMegamenu(item);
    };

    const scheduleDesktopClose = () => {
      clearTimeout(desktopLeaveTimer);
      desktopLeaveTimer = setTimeout(clearDesktopHover, 120);
    };

    const repositionOpenMenu = () => {
      const hovered = specBar.querySelector('.spec-bar__item.is-hover');
      if (hovered) positionMegamenu(hovered);
      const open = specBar.querySelector('.spec-bar__item.is-open');
      if (open) positionMegamenu(open);
    };

    items.forEach(item => {
      const btn = item.querySelector('.spec-bar__btn');
      const menu = getMenu(item);
      if (!btn) return;
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-expanded', 'false');

      item.addEventListener('mouseenter', () => {
        if (isDesktopSpec()) openDesktopMenu(item);
      });
      item.addEventListener('mouseleave', () => {
        if (isDesktopSpec()) scheduleDesktopClose();
      });

      if (menu) {
        menu.addEventListener('mouseenter', () => {
          if (isDesktopSpec()) openDesktopMenu(item);
        });
        menu.addEventListener('mouseleave', () => {
          if (isDesktopSpec()) scheduleDesktopClose();
        });
      }

      btn.addEventListener('click', e => {
        if (isDesktopSpec()) return;

        e.preventDefault();
        e.stopPropagation();
        ignoreSpecOutsideClick = true;

        const wasOpen = item.classList.contains('is-open');
        closeAllSpecMenus();

        if (!wasOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          getMenu(item)?.classList.add('is-open');
          requestAnimationFrame(() => {
            positionMegamenu(item);
            syncSpecBarOpenState();
          });
        }

        setTimeout(() => { ignoreSpecOutsideClick = false; }, 0);
      });
    });

    document.addEventListener('click', e => {
      if (ignoreSpecOutsideClick || isDesktopSpec()) return;
      if (specBar.contains(e.target) || e.target.closest('.megamenu.is-open')) return;
      closeAllSpecMenus();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAllSpecMenus();
    });

    specBar.querySelectorAll('.megamenu__col a').forEach(a => {
      a.addEventListener('click', () => {
        if (isDesktopSpec()) clearDesktopHover();
        else closeAllSpecMenus();
      });
    });

    const onModeChange = () => closeAllSpecMenus();
    mobileSpecMq.addEventListener('change', onModeChange);
    desktopSpecMq.addEventListener('change', onModeChange);

    window.addEventListener('resize', repositionOpenMenu);
    window.addEventListener('scroll', repositionOpenMenu, { passive: true, capture: true });

    // horizontal scroll arrows — show only when content overflows
    const checkOverflow = () => {
      if (!list || !inner) return;
      if (list.scrollWidth > list.clientWidth + 4) {
        inner.classList.add('has-overflow');
      } else {
        inner.classList.remove('has-overflow');
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    scrollBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const dir = btn.dataset.dir === 'left' ? -1 : 1;
        list?.scrollBy({ left: dir * 240, behavior: 'smooth' });
      });
    });
  }

  /* ---------- Expand all treatments (homepage) — 3 rows collapsed by default ---------- */
  const expandTreatmentsBtn = document.querySelector('[data-expand-treatments]');
  const treatmentGrid = document.getElementById('treatmentGrid');
  const COLLAPSED_ROWS = 3;

  if (expandTreatmentsBtn && treatmentGrid) {
    let expanded = false;

    const getGridColumnCount = grid => {
      const cols = getComputedStyle(grid).gridTemplateColumns;
      if (!cols || cols === 'none') return 1;
      return cols.split(' ').filter(c => c.trim()).length;
    };

    const applyCollapsed = () => {
      const cards = treatmentGrid.querySelectorAll('.t-card');
      const limit = getGridColumnCount(treatmentGrid) * COLLAPSED_ROWS;
      cards.forEach((card, i) => {
        card.classList.toggle('t-card--hidden', !expanded && i >= limit);
      });
      treatmentGrid.classList.toggle('treatment-grid--collapsed', !expanded);
      expandTreatmentsBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      expandTreatmentsBtn.textContent = expanded
        ? 'Show fewer treatments ↑'
        : 'View all 50+ treatments →';
    };

    expandTreatmentsBtn.addEventListener('click', () => {
      expanded = !expanded;
      applyCollapsed();
      if (expanded) {
        expandTreatmentsBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    window.addEventListener('resize', applyCollapsed);
    applyCollapsed();
  }

  /* ---------- Stat counter (subtle) ---------- */
  const stats = document.querySelectorAll('.stat__num[data-count]');
  if ('IntersectionObserver' in window && stats.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.textContent.replace(/^[\d.,KkMm]+/i, '');
        let cur = 0;
        const dur = 1400;
        const start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          cur = Math.floor(eased * target);
          el.textContent = formatNum(cur) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = formatBigNum(target) + suffix;
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    stats.forEach(s => obs.observe(s));
  }

  function formatNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }
  function formatBigNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }

})();
