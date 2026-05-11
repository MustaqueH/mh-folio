/**
* Template Name: EasyFolio
* Template URL: https://bootstrapmade.com/easyfolio-bootstrap-portfolio-template/
* Updated: Feb 21 2025 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

import '../css/design-tokens.css';
import '../css/main.css';
import '../css/tailwind.css';
import '../css/design-system.css';

(function() {
  'use strict';

  function isSamePageHashLink(anchor) {
    const href = anchor.getAttribute('href');
    if (!href) return false;
    if (href.startsWith('#')) return true;
    try {
      const u = new URL(href, window.location.href);
      return u.pathname === window.location.pathname && u.hash.length > 1 && u.hash === anchor.hash;
    } catch {
      return false;
    }
  }

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectBody || !selectHeader) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  window.addEventListener('load', toggleScrolled);

  /**
   * In-page hash links: smooth scroll + active state (mobile uses sticky horizontal rail — no overlay)
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', (e) => {
      if (!navmenu.hash) return;
      const target = document.querySelector(navmenu.hash);
      if (!target) return;
      e.preventDefault();

      document.querySelectorAll('.navmenu a.active').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });
      navmenu.classList.add('active');
      if (isSamePageHashLink(navmenu)) {
        navmenu.setAttribute('aria-current', 'page');
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (history.pushState) {
        history.pushState(null, '', navmenu.hash);
      } else {
        location.hash = navmenu.hash;
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);

  /**
   * Animation on scroll (AOS). Must run on DOMContentLoaded (or earlier), not window load:
   * AOS.init() registers window "load" internally; if we call init from a load handler, that
   * inner listener never runs and [data-aos] nodes stay at opacity:0 forever.
   */
  function revealAosFallback() {
    document.querySelectorAll('[data-aos]').forEach(function(el) {
      el.classList.add('aos-animate');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  function aosInit() {
    if (typeof AOS === 'undefined') {
      revealAosFallback();
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    AOS.init({
      duration: reduceMotion ? 0 : 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      disable: reduceMotion,
      startEvent: 'DOMContentLoaded'
    });
    if (typeof AOS.refresh === 'function') {
      AOS.refresh();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aosInit);
  } else {
    aosInit();
  }
  window.addEventListener('load', function() {
    if (typeof AOS === 'undefined') {
      revealAosFallback();
      return;
    }
    if (typeof AOS.refresh === 'function') {
      AOS.refresh();
    }
  });

  /**
   * GLightbox: load CSS/JS when first gallery link is near viewport (index defers; subpages may already load vendor).
   */
  let glightboxLoading = false;
  let glightboxInited = false;
  function initGlightboxWhenReady() {
    if (glightboxInited || typeof GLightbox === 'undefined') return;
    glightboxInited = true;
    GLightbox({ selector: '.glightbox' });
  }
  function injectGlightbox() {
    if (glightboxLoading || glightboxInited) return;
    glightboxLoading = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('assets/vendor/glightbox/css/glightbox.min.css', document.baseURI).href;
    document.head.appendChild(link);
    const s = document.createElement('script');
    s.src = new URL('assets/vendor/glightbox/js/glightbox.min.js', document.baseURI).href;
    s.defer = true;
    s.onload = function() { initGlightboxWhenReady(); };
    document.body.appendChild(s);
  }
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof GLightbox !== 'undefined') {
      initGlightboxWhenReady();
      return;
    }
    const firstGlb = document.querySelector('a.glightbox');
    if (!firstGlb) return;
    const kick = function() {
      if (glightboxInited || typeof GLightbox !== 'undefined') {
        initGlightboxWhenReady();
        return;
      }
      if (!glightboxLoading) injectGlightbox();
    };
    const root = firstGlb.closest('section') || firstGlb.closest('main') || document.body;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function(entries) {
        if (entries.some(function(e) { return e.isIntersecting; })) {
          io.disconnect();
          kick();
        }
      }, { rootMargin: '500px 0px' });
      io.observe(root);
    } else {
      window.addEventListener('load', kick);
    }
    firstGlb.addEventListener('pointerdown', kick, { passive: true, once: true });
  });

  /**
   * Portfolio showcase: equal card heights per visual row after Isotope fitRows layout.
   * Uses top-position clustering (not coarse bucketing) so items are not grouped into the wrong row.
   */
  function equalizeShowcasePortfolioCardHeights(iso) {
    if (!iso || typeof iso.getFilteredItemElements !== 'function') return;
    const container = iso.element;
    const items = iso.getFilteredItemElements();
    items.forEach(function(el) {
      const card = el.querySelector('.portfolio-card');
      if (card) card.style.minHeight = '';
    });
    if (!items.length) return;

    void container.offsetHeight;

    const cRect = container.getBoundingClientRect();
    const rowTol = 12;
    const rowKeys = [];
    const groups = new Map();

    items.forEach(function(el) {
      const card = el.querySelector('.portfolio-card');
      if (!card) return;
      const top = el.getBoundingClientRect().top - cRect.top;
      let key = null;
      for (let i = 0; i < rowKeys.length; i++) {
        if (Math.abs(rowKeys[i] - top) < rowTol) {
          key = rowKeys[i];
          break;
        }
      }
      if (key === null) {
        key = top;
        rowKeys.push(key);
      }
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(card);
    });

    groups.forEach(function(cards) {
      const maxH = Math.max.apply(null, cards.map(function(c) { return c.offsetHeight; }));
      cards.forEach(function(c) {
        c.style.minHeight = maxH + 'px';
      });
    });
  }

  /**
   * Init isotope layout and filters.
   * Wait for full load so vendor scripts (imagesLoaded/Isotope) are available.
   */
  function initIsotopeLayouts() {
    if (typeof imagesLoaded === 'undefined' || typeof Isotope === 'undefined') return;

    document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
      const isoContainer = isotopeItem.querySelector('.isotope-container');
      if (!isoContainer) return;

      const layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
      const filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
      const sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';
      const isShowcasePortfolio = Boolean(isotopeItem.closest('.portfolio-showcase'));

      let initIsotope = null;
      let pendingFilter = null;
      let showcaseResizeTimer = null;

      imagesLoaded(isoContainer, function() {
        const initialFilter = pendingFilter !== null ? pendingFilter : filter;
        const isoOptions = {
          itemSelector: '.isotope-item',
          layoutMode: layout,
          filter: initialFilter,
          sortBy: sort
        };
        if (isShowcasePortfolio) {
          isoOptions.percentPosition = true;
          isoOptions.transitionDuration = '0s';
        }
        initIsotope = new Isotope(isoContainer, isoOptions);
        pendingFilter = null;

        if (isShowcasePortfolio) {
          initIsotope.on('layoutComplete', function onShowcaseLayout() {
            if (initIsotope._portfolioEqualizeInner) {
              initIsotope._portfolioEqualizeInner = false;
              return;
            }
            requestAnimationFrame(function() {
              requestAnimationFrame(function() {
                equalizeShowcasePortfolioCardHeights(initIsotope);
                initIsotope._portfolioEqualizeInner = true;
                initIsotope.layout();
              });
            });
          });

          window.addEventListener('resize', function onShowcaseResize() {
            clearTimeout(showcaseResizeTimer);
            showcaseResizeTimer = setTimeout(function() {
              if (initIsotope) initIsotope.layout();
            }, 200);
          });
        }
      });

      isotopeItem.querySelectorAll('.isotope-filters [data-filter]').forEach(function(filterBtn) {
        filterBtn.addEventListener('click', function() {
          const prev = isotopeItem.querySelector('.isotope-filters .filter-active');
          if (prev) prev.classList.remove('filter-active');
          this.classList.add('filter-active');
          isotopeItem.querySelectorAll('.isotope-filters [data-filter]').forEach(function(b) {
            b.setAttribute('aria-pressed', b.classList.contains('filter-active') ? 'true' : 'false');
          });
          const f = this.getAttribute('data-filter') || '*';
          if (!initIsotope) {
            pendingFilter = f;
            return;
          }
          const arrangeOpts = { filter: f };
          if (isShowcasePortfolio) {
            arrangeOpts.transitionDuration = '0s';
          }
          initIsotope.arrange(arrangeOpts);
        }, false);
      });
    });
  }
  window.addEventListener('load', initIsotopeLayouts);

  /**
   * Swiper: load bundle when carousel is near viewport (unless vendor already on page).
   */
  let swiperLoading = false;
  function initSwiper() {
    if (typeof Swiper === 'undefined') return;
    document.querySelectorAll('.init-swiper').forEach(function(swiperElement) {
      const cfgEl = swiperElement.querySelector('.swiper-config');
      if (!cfgEl) return;
      let config = JSON.parse(cfgEl.innerHTML.trim());

      if (swiperElement.classList.contains('swiper-tab')) {
        if (typeof initSwiperWithCustomPagination === 'function') {
          initSwiperWithCustomPagination(swiperElement, config);
        }
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }
  function injectSwiper() {
    if (typeof Swiper !== 'undefined') {
      initSwiper();
      return;
    }
    if (swiperLoading) return;
    swiperLoading = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('assets/vendor/swiper/swiper-bundle.min.css', document.baseURI).href;
    document.head.appendChild(link);
    const s = document.createElement('script');
    s.src = new URL('assets/vendor/swiper/swiper-bundle.min.js', document.baseURI).href;
    s.defer = true;
    s.onload = function() { initSwiper(); };
    document.body.appendChild(s);
  }
  document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.init-swiper')) return;
    if (typeof Swiper !== 'undefined') {
      initSwiper();
      return;
    }
    const host = document.querySelector('.init-swiper');
    const root = host.closest('section') || host;
    const kick = function() { injectSwiper(); };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function(entries) {
        if (entries.some(function(e) { return e.isIntersecting; })) {
          io.disconnect();
          kick();
        }
      }, { rootMargin: '400px 0px' });
      io.observe(root);
    } else {
      window.addEventListener('load', kick);
    }
  });

  /**
   * FAQ accordion: expanding one question closes all others in the same block.
   * Delegated on .faq-container so the chevron (inside the button) does not double-toggle.
   */
  document.querySelectorAll('.faq-container').forEach((container) => {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn || !container.contains(btn)) return;

      const item = btn.closest('.faq-item');
      if (!item) return;

      const wasOpen = item.classList.contains('faq-active');

      container.querySelectorAll('.faq-item').forEach((faqItem) => {
        faqItem.classList.remove('faq-active');
        const q = faqItem.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('faq-active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function() {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          let sm = parseFloat(scrollMarginTop);
          if (Number.isNaN(sm)) sm = 0;
          window.scrollTo({
            top: section.offsetTop - sm,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
 * Navmenu Scrollspy
 */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      let sectionTop = section.offsetTop;
      let sectionBottom = sectionTop + section.offsetHeight;

      // FIX: Special case for bottom of page (for last section like #contact)
      let atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 5;

      if ((position >= sectionTop && position <= sectionBottom) || (atBottom && navmenulink.hash === '#contact')) {
        document.querySelectorAll('.navmenu a.active').forEach(link => {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        });
        navmenulink.classList.add('active');
        if (isSamePageHashLink(navmenulink)) {
          navmenulink.setAttribute('aria-current', 'page');
        }
      } else {
        navmenulink.classList.remove('active');
        navmenulink.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('load', navmenuScrollspy);
  let scrollRaf = 0;
  function flushScrollHandlers() {
    scrollRaf = 0;
    toggleScrolled();
    toggleScrollTop();
    navmenuScrollspy();
  }
  document.addEventListener('scroll', function() {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(flushScrollHandlers);
  }, { passive: true });


  /** ------------------------
   * ADD-ONS 
   * -------------------------*/

  /**
   * Dark/Light Theme Switch
   */
  
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-switch');
    const body = document.body;
    const sunIcon = document.querySelector('.icon-sun');
    const moonIcon = document.querySelector('.icon-moon');

    const applyTheme = (isDark) => {
      body.classList.toggle('dark-background', isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (e) { /* private mode / blocked storage */ }
      if (sunIcon) sunIcon.style.opacity = isDark ? '0' : '1';
      if (moonIcon) moonIcon.style.opacity = isDark ? '1' : '0';
      if (toggle) toggle.checked = isDark;
    };

    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem('theme');
    } catch (e) { /* ignore */ }
    const useDark = savedTheme !== 'light';
    applyTheme(useDark);

    if (toggle) {
      toggle.addEventListener('change', () => {
        applyTheme(toggle.checked);
      });
    }
  });


  // Number counters animation
  function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      obj.textContent = String(Math.floor(easing * (end - start) + start));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  function counterDurationForTarget(end) {
    return Math.min(3400, Math.max(1600, Math.round(1400 + end * 7)));
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const experienceCounter = document.getElementById('counter-experience');
        const projectsCounter = document.getElementById('counter-projects');
        const solutionsCounter = document.getElementById('counter-solutions');
        if (!experienceCounter || !projectsCounter || !solutionsCounter) return;

        const t1 = parseInt(experienceCounter.dataset.target, 10) || 0;
        const t2 = parseInt(projectsCounter.dataset.target, 10) || 0;
        const t3 = parseInt(solutionsCounter.dataset.target, 10) || 0;

        setTimeout(() => animateValue('counter-experience', 0, t1, counterDurationForTarget(t1)), 0);
        setTimeout(() => animateValue('counter-projects', 0, t2, counterDurationForTarget(t2)), 180);
        setTimeout(() => animateValue('counter-solutions', 0, t3, counterDurationForTarget(t3)), 360);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
      observer.observe(statsSection);
    }
  });

  // Define tech stack data
  const techStackData = [
    { name: 'Azure', icon: 'bi-microsoft', category: 'microsoft' },
    { name: 'Microsoft 365', icon: 'bi-windows', category: 'microsoft' },
    { name: 'PIM/PAM', icon: 'bi-shield-check', category: 'identity' },
    { name: 'Entra ID', icon: 'bi-person-badge', category: 'identity' },
    { name: 'Endpoint Security', icon: 'bi-shield-lock', category: 'security' },
    { name: 'Zero Trust', icon: 'bi-shield-shaded', category: 'security' },
    { name: 'PowerShell', icon: 'bi-terminal', category: 'automation' },
    { name: 'Azure Automation', icon: 'bi-gear', category: 'automation' }
  ];

  // Render tech stack cards
  function renderTechStackGrid(data) {
    const grid = document.getElementById('techStackGrid');
    if (!grid) return;

    grid.innerHTML = '';

    data.forEach(item => {
      const div = document.createElement('div');
      div.className = 'tech-stack-item';
      div.dataset.category = item.category;

      div.innerHTML = `
      <div class="tech-icon-wrapper">
        <i class="bi ${item.icon}"></i>
        <span class="tech-name">${item.name}</span>
      </div>
    `;

      grid.appendChild(div);
    });

    observeTechItems(); // Re-init observer after render
  }

  // Filter logic
  function initTechStackFilter() {
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.dataset.filter;
        const items = document.querySelectorAll('.tech-stack-item');

        items.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.style.display = match ? 'block' : 'none';
        });
      });
    });
  }

  // Animate on scroll
  function observeTechItems() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.tech-stack-item').forEach(item => {
      observer.observe(item);
    });
  }

  /**
 * Skill Meter Animation
 */
  function initSkillMeterAnimation() {
    const skillCards = document.querySelectorAll('.skill-category-card');
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const meterFill = entry.target.querySelector('.meter-fill');
          if (meterFill) {
            meterFill.style.transform = 'translateX(0)';
          }
        }
      });
    }, {
      threshold: 0.2
    });

    skillCards.forEach(card => {
      observer.observe(card);
    });
  }

  /**
 * Animated expand/collapse for disclosure panels (max-height transition).
 * Uses double rAF before measuring so nested grids/cards have laid out; ignores bubbled transitionend
 * from children; blocks re-clicks while animating; resize only reapplies when height is px-locked.
 */
  function initPortfolioDisclosurePanels() {
    document.querySelectorAll('.js-disclosure-animate').forEach((root) => {
      const btn = root.querySelector('.portfolio-disclosure__summary');
      const panel = root.querySelector('.portfolio-disclosure__panel');
      if (!btn || !panel) return;

      const inner = panel.querySelector('.portfolio-disclosure__body');
      const TRANSITION_MS = 520;

      function measureExpandedHeight() {
        const prevMax = panel.style.maxHeight;
        const prevOverflow = panel.style.overflow;
        panel.style.maxHeight = 'none';
        panel.style.overflow = 'visible';
        void panel.offsetHeight;

        let h = panel.scrollHeight;
        if (inner) {
          h = Math.max(h, inner.offsetTop + inner.scrollHeight);
        }

        panel.style.overflow = prevOverflow || '';
        panel.style.maxHeight = prevMax;

        return Math.max(Math.ceil(h), 12);
      }

      let busy = false;
      let resizeTimer;

      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (!root.classList.contains('is-open') || panel.hasAttribute('hidden')) return;
          if (panel.style.maxHeight === 'none' || !panel.style.maxHeight) return;
          panel.style.maxHeight = `${measureExpandedHeight()}px`;
        }, 120);
      });

      function finishOpen() {
        panel.style.maxHeight = 'none';
        busy = false;
      }

      function finishClose() {
        panel.setAttribute('hidden', '');
        panel.style.maxHeight = '';
        panel.style.overflow = '';
        busy = false;
      }

      btn.addEventListener('click', () => {
        if (busy) return;

        const opening = !root.classList.contains('is-open');

        if (opening) {
          busy = true;
          panel.removeAttribute('hidden');
          root.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const targetH = measureExpandedHeight();
              panel.style.overflow = 'hidden';
              panel.style.maxHeight = '0px';
              void panel.offsetHeight;
              panel.style.maxHeight = `${targetH}px`;

              let settled = false;
              const settle = () => {
                if (settled) return;
                settled = true;
                finishOpen();
              };

              const onEnd = (e) => {
                if (e.target !== panel || e.propertyName !== 'max-height') return;
                panel.removeEventListener('transitionend', onEnd);
                settle();
              };
              panel.addEventListener('transitionend', onEnd);
              window.setTimeout(() => {
                panel.removeEventListener('transitionend', onEnd);
                if (root.classList.contains('is-open')) settle();
              }, TRANSITION_MS + 80);
            });
          });
        } else {
          busy = true;
          const startH = measureExpandedHeight();
          panel.style.overflow = 'hidden';
          panel.style.maxHeight = `${startH}px`;
          void panel.offsetHeight;
          panel.style.maxHeight = '0px';
          btn.setAttribute('aria-expanded', 'false');
          root.classList.remove('is-open');

          let settled = false;
          const settle = () => {
            if (settled) return;
            settled = true;
            finishClose();
          };

          const onEnd = (e) => {
            if (e.target !== panel || e.propertyName !== 'max-height') return;
            panel.removeEventListener('transitionend', onEnd);
            settle();
          };
          panel.addEventListener('transitionend', onEnd);
          window.setTimeout(() => {
            panel.removeEventListener('transitionend', onEnd);
            if (!root.classList.contains('is-open')) settle();
          }, TRANSITION_MS + 80);
        }
      });
    });
  }

  function initEndorsementStage() {
    const root = document.querySelector('[data-endorsement-stage]');
    if (!root) return;

    const staging = root.querySelector('[data-endorsement-staging]');
    const viewport = root.querySelector('[data-endorsement-viewport]') || root.querySelector('.endorsement-stage__viewport');
    const slotPrev = root.querySelector('[data-endorsement-slot="prev"]');
    const slotActive = root.querySelector('[data-endorsement-slot="active"]');
    const slotNext = root.querySelector('[data-endorsement-slot="next"]');
    const prevBtn = root.querySelector('[data-endorsement-prev]');
    const nextBtn = root.querySelector('[data-endorsement-next]');
    const curEl = root.querySelector('[data-endorsement-current]');
    const totalEl = root.querySelector('[data-endorsement-total]');

    if (!staging || !viewport || !slotPrev || !slotActive || !slotNext) return;

    const articles = Array.from(root.querySelectorAll('[data-endorsement-article]')).sort(
      (a, b) =>
        Number(a.getAttribute('data-endorsement-index')) -
      Number(b.getAttribute('data-endorsement-index'))
    );
    const N = articles.length;
    if (N === 0) return;

    if (totalEl) totalEl.textContent = String(N);

    const mqDesktop = window.matchMedia('(min-width: 992px)');
    const mqTablet = window.matchMedia('(min-width: 768px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const rowEl =
      root.querySelector('[data-endorsement-row]') || root.querySelector('.endorsement-stage__row');

    const TRANS_MS = 520;
    const TRANSFORM_TIMING = `${TRANS_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    const OPACITY_TIMING = `${Math.round(TRANS_MS * 0.92)}ms cubic-bezier(0.22, 1, 0.36, 1)`;

    let current = 0;
    let animating = false;
    /** @type {{ x: number; y: number } | null} */
    let touchTracking = null;
    /** @type {{ x: number; y: number } | null} */
    let swipeStart = null;
    let wheelTick = 0;

    function layoutMode() {
      if (mqDesktop.matches) return 'desktop';
      if (mqTablet.matches) return 'tablet';
      return 'mobile';
    }

    function visibleSlotCount() {
      const mode = layoutMode();
      if (mode === 'mobile') return 1;
      if (mode === 'tablet') return Math.min(2, N);
      return Math.min(3, N);
    }

    function visibleSlots() {
      const vis = visibleSlotCount();
      if (vis >= 3) return [slotPrev, slotActive, slotNext];
      if (vis === 2) return [slotPrev, slotActive];
      return [slotActive];
    }

    function captureVisibleArticles() {
      return visibleSlots()
        .map((s) => s.querySelector('[data-endorsement-article]'))
        .filter(Boolean);
    }

    /** @param {HTMLElement | null} slotEl */
    function slotScaleFor(slotEl) {
      if (!slotEl) return 1;
      const mode = layoutMode();
      if (mode === 'mobile') return 1;
      if (mode === 'tablet') {
        return slotEl.classList.contains('endorsement-stage__slot--active') ? 1.04 : 0.96;
      }
      return slotEl.classList.contains('endorsement-stage__slot--active') ? 1.05 : 0.95;
    }

    function clearAriaCurrent() {
      articles.forEach((a) => a.removeAttribute('aria-current'));
    }

    function placeArticles() {
      const vis = visibleSlotCount();
      const prevIdx = (current - 1 + N) % N;
      const nextIdx = (current + 1) % N;

      [slotPrev, slotActive, slotNext].forEach((s) => {
        while (s.firstChild) s.removeChild(s.firstChild);
      });
      while (staging.firstChild) staging.removeChild(staging.firstChild);

      clearAriaCurrent();

      const placeInSlot = (slot, article) => {
        if (!article) return;
        slot.appendChild(article);
      };

      if (vis >= 3) {
        placeInSlot(slotPrev, articles[prevIdx]);
        placeInSlot(slotActive, articles[current]);
        placeInSlot(slotNext, articles[nextIdx]);
        articles[current].setAttribute('aria-current', 'true');
      } else if (vis === 2) {
        placeInSlot(slotPrev, articles[prevIdx]);
        placeInSlot(slotActive, articles[current]);
        articles[current].setAttribute('aria-current', 'true');
      } else {
        placeInSlot(slotActive, articles[current]);
        articles[current].setAttribute('aria-current', 'true');
      }

      articles.forEach((a) => {
        if (!slotPrev.contains(a) && !slotActive.contains(a) && !slotNext.contains(a)) {
          staging.appendChild(a);
        }
      });

      if (curEl) curEl.textContent = String(current + 1);

      staging.setAttribute('aria-hidden', 'true');
    }

    /**
   * @param {number} delta -1 previous, +1 next
   * @param {Map<Element, DOMRect>} rects
   * @param {Map<Element, HTMLElement | null>} slotBeforeMap
   */
    /**
     * FLIP + subtle opacity for entering cards; CSS card `transition` on transform is disabled via
     * `.endorsement-stage--animating` so motion isn’t fighting inline FLIP.
     */
    function runPlacementAnimation(delta, rects, slotBeforeMap) {
      const afterEls = captureVisibleArticles();
      const enterNudge = Math.min(72, Math.max(52, window.innerWidth * 0.07));

      root.classList.add('endorsement-stage--animating');

      afterEls.forEach((el) => {
        el.style.willChange = 'transform, opacity';
        const slotAfter = el.closest('[data-endorsement-slot]');
        const s1 = slotScaleFor(slotAfter);

        if (rects.has(el)) {
          const r0 = rects.get(el);
          const r1 = el.getBoundingClientRect();
          const cx0 = r0.left + r0.width / 2;
          const cy0 = r0.top + r0.height / 2;
          const cx1 = r1.left + r1.width / 2;
          const cy1 = r1.top + r1.height / 2;
          const dx = cx0 - cx1;
          const dy = cy0 - cy1;
          const slotBefore = slotBeforeMap.get(el);
          const s0 = slotBefore ? slotScaleFor(slotBefore) : s1;
          el.style.transition = 'none';
          el.style.opacity = '1';
          el.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${s0})`;
        } else {
          const off = delta > 0 ? enterNudge : -enterNudge;
          el.style.transition = 'none';
          el.style.opacity = '0.86';
          el.style.transform = `translate3d(${off}px, 0, 0) scale(${Math.min(s1, 0.94)})`;
        }
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          afterEls.forEach((el) => {
            const slotAfter = el.closest('[data-endorsement-slot]');
            const s1 = slotScaleFor(slotAfter);
            el.style.transition = `transform ${TRANSFORM_TIMING}, opacity ${OPACITY_TIMING}`;
            el.style.transform = `translate3d(0, 0, 0) scale(${s1})`;
            el.style.opacity = '1';
          });
        });
      });

      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        afterEls.forEach((el) => {
          el.style.transition = '';
          el.style.transform = '';
          el.style.opacity = '';
          el.style.willChange = '';
        });
        root.classList.remove('endorsement-stage--animating');
        animating = false;
      };

      let pending = afterEls.length;
      /** @type {Set<Element>} */
      const ended = new Set();
      const onTransitionEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        const el = ev.currentTarget;
        if (!(el instanceof HTMLElement) || ended.has(el)) return;
        ended.add(el);
        pending -= 1;
        if (pending <= 0) cleanup();
      };

      afterEls.forEach((el) => {
        el.addEventListener('transitionend', onTransitionEnd);
      });

      window.setTimeout(() => {
        afterEls.forEach((el) => el.removeEventListener('transitionend', onTransitionEnd));
        cleanup();
      }, TRANS_MS + 160);
    }

    function rotate(delta) {
      if (animating) return;

      if (reducedMotion.matches) {
        current = (current + delta + N) % N;
        placeArticles();
        return;
      }

      animating = true;

      const beforeEls = captureVisibleArticles();
      /** @type {Map<Element, DOMRect>} */
      const rects = new Map(beforeEls.map((el) => [el, el.getBoundingClientRect()]));
      /** @type {Map<Element, HTMLElement | null>} */
      const slotBeforeMap = new Map(
        beforeEls.map((el) => [el, el.closest('[data-endorsement-slot]')])
      );

      current = (current + delta + N) % N;
      placeArticles();
      runPlacementAnimation(delta, rects, slotBeforeMap);
    }

    function resetSwipeRow() {
      if (rowEl) rowEl.style.transform = '';
      root.classList.remove('endorsement-stage--dragging');
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        animating = false;
        resetSwipeRow();
        placeArticles();
      }, 120);
    });

    mqDesktop.addEventListener('change', () => {
      animating = false;
      resetSwipeRow();
      placeArticles();
    });
    mqTablet.addEventListener('change', () => {
      animating = false;
      resetSwipeRow();
      placeArticles();
    });

    prevBtn?.addEventListener('click', () => rotate(-1));
    nextBtn?.addEventListener('click', () => rotate(1));

    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        rotate(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        rotate(1);
      }
    });

    viewport.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1 || animating) return;
        const t = e.touches[0];
        touchTracking = { x: t.clientX, y: t.clientY };
        swipeStart = { x: t.clientX, y: t.clientY };
      },
      { passive: true }
    );

    viewport.addEventListener(
      'touchmove',
      (e) => {
        if (!touchTracking || !swipeStart || e.touches.length !== 1 || animating) return;
        const t = e.touches[0];
        const fromStartX = t.clientX - swipeStart.x;
        const fromStartY = t.clientY - swipeStart.y;
        if (Math.abs(fromStartX) > 10 && Math.abs(fromStartX) > Math.abs(fromStartY) * 1.12) {
          e.preventDefault();
          root.classList.add('endorsement-stage--dragging');
          if (!reducedMotion.matches && rowEl) {
            const rubber = Math.max(-56, Math.min(56, fromStartX * 0.22));
            rowEl.style.transform = `translate3d(${rubber}px, 0, 0)`;
          }
        }
      },
      { passive: false }
    );

    viewport.addEventListener(
      'touchend',
      (e) => {
        if (!touchTracking || !swipeStart) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - swipeStart.x;
        const dy = t.clientY - swipeStart.y;
        touchTracking = null;
        swipeStart = null;
        const threshold = Math.min(72, Math.max(48, window.innerWidth * 0.07));
        resetSwipeRow();
        if (animating) return;
        if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 0.85) return;
        if (dx < 0) rotate(1);
        else rotate(-1);
      },
      { passive: true }
    );

    viewport.addEventListener('touchcancel', () => {
      touchTracking = null;
      swipeStart = null;
      resetSwipeRow();
    });

    /** Horizontal trackpad / mouse wheel slide */
    viewport.addEventListener(
      'wheel',
      (e) => {
        if (animating || reducedMotion.matches) return;
        const ax = Math.abs(e.deltaX);
        const ay = Math.abs(e.deltaY);
        if (ax < 16 || ax < ay * 1.05) return;
        e.preventDefault();
        const now = performance.now();
        if (now - wheelTick < 540) return;
        wheelTick = now;
        rotate(e.deltaX > 0 ? 1 : -1);
      },
      { passive: false }
    );

    placeArticles();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.add('endorsement-stage--ready'));
    });

    window.setTimeout(() => {
      root.classList.add('endorsement-stage--intro-complete');
    }, 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initPortfolioDisclosurePanels();
    renderTechStackGrid(techStackData);
    initTechStackFilter();
    initSkillMeterAnimation();
    initEndorsementStage();

    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = String(new Date().getFullYear());
  });


})();

