/**
* Template Name: EasyFolio
* Template URL: https://bootstrapmade.com/easyfolio-bootstrap-portfolio-template/
* Updated: Feb 21 2025 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

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
  function aosInit() {
    if (typeof AOS === 'undefined') return;
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
   * Init isotope layout and filters
   */
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

  /**
   * Swiper: load bundle when carousel is near viewport (unless vendor already on page).
   */
  let swiperLoading = false;
  function initSwiper() {
    if (typeof Swiper === 'undefined') return;
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      const cfgEl = swiperElement.querySelector(".swiper-config");
      if (!cfgEl) return;
      let config = JSON.parse(cfgEl.innerHTML.trim());

      if (swiperElement.classList.contains("swiper-tab")) {
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
  window.addEventListener('load', function(e) {
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
      const experienceCounter = document.getElementById("counter-experience");
      const projectsCounter = document.getElementById("counter-projects");
      const solutionsCounter = document.getElementById("counter-solutions");
      if (!experienceCounter || !projectsCounter || !solutionsCounter) return;

      const t1 = parseInt(experienceCounter.dataset.target, 10) || 0;
      const t2 = parseInt(projectsCounter.dataset.target, 10) || 0;
      const t3 = parseInt(solutionsCounter.dataset.target, 10) || 0;

      setTimeout(() => animateValue("counter-experience", 0, t1, counterDurationForTarget(t1)), 0);
      setTimeout(() => animateValue("counter-projects", 0, t2, counterDurationForTarget(t2)), 180);
      setTimeout(() => animateValue("counter-solutions", 0, t3, counterDurationForTarget(t3)), 360);

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

document.addEventListener('DOMContentLoaded', () => {
  initPortfolioDisclosurePanels();
  renderTechStackGrid(techStackData);
  initTechStackFilter();
  initSkillMeterAnimation();

  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());
});


})();

