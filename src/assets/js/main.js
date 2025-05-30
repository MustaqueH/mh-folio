/**
* Template Name: EasyFolio
* Template URL: https://bootstrapmade.com/easyfolio-bootstrap-portfolio-template/
* Updated: Feb 21 2025 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToggle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToggle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToggle();
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
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
 * Animate the skills items on reveal
 */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.progress-bar').forEach(bar => {
      new Waypoint({
        element: bar,
        offset: '90%',
        handler: () => {
          const pct = parseInt(bar.getAttribute('aria-valuenow'), 10);
          const num = bar.nextElementSibling;
          let count = 0;
          const step = Math.max(Math.floor(1200 / pct), 20);

          // Assign threshold class
          if (pct < 50) bar.classList.add('low');
          else if (pct <= 80) bar.classList.add('medium');
          else bar.classList.add('high');

          // Trigger bar width animation
          bar.style.width = pct + '%';
          bar.classList.add('active');

          // Animate numeric counter
          const interval = setInterval(() => {
            if (count < pct) {
              count++;
              num.textContent = count + '%';
            } else {
              clearInterval(interval);
            }
          }, step);
        }
      });
    });
  });



  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
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
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
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
      document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
      navmenulink.classList.add('active');
    } else {
      navmenulink.classList.remove('active');
    }
  });
}

window.addEventListener('load', navmenuScrollspy);
document.addEventListener('scroll', navmenuScrollspy);


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
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    sunIcon.style.opacity = isDark ? '0' : '1';
    moonIcon.style.opacity = isDark ? '1' : '0';
  };

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    toggle.checked = true;
  }
  applyTheme(toggle.checked);

  toggle.addEventListener('change', () => {
    applyTheme(toggle.checked);
  });
});


// Number counters animation
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // Using easeOutExpo for smoother animation
    const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    obj.innerText = Math.floor(easing * (end - start) + start);
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Get the target values from the HTML data attributes
      const experienceCounter = document.getElementById("counter-experience");
      const projectsCounter = document.getElementById("counter-projects");
      const solutionsCounter = document.getElementById("counter-solutions");

      // Stagger the animations slightly for visual interest
      setTimeout(() => animateValue("counter-experience", 0, parseInt(experienceCounter.dataset.target), 2000), 0);
      setTimeout(() => animateValue("counter-projects", 0, parseInt(projectsCounter.dataset.target), 2000), 200);
      setTimeout(() => animateValue("counter-solutions", 0, parseInt(solutionsCounter.dataset.target), 2000), 400);
      
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    observer.observe(statsSection);
  }
});

// Animate progress bars on scroll into view
document.addEventListener('DOMContentLoaded', () => {
  const skillBoxes = document.querySelectorAll('.skill-box');

  function animateSkills() {
    skillBoxes.forEach(box => {
      const progressBar = box.querySelector('.progress-bar');
      const progressNumber = box.querySelector('.progress-number');
      const progressValue = parseInt(box.dataset.progress, 10);
      const progressContainer = box.querySelector('.progress');

      if (box.getBoundingClientRect().top < window.innerHeight * 0.9 && !box.classList.contains('animated')) {
        box.classList.add('animated');
        let start = 0;
        const duration = 1200; // animation duration ms
        const stepTime = 15;   // ms

        function step() {
          start += (progressValue / duration) * stepTime;
          if (start > progressValue) start = progressValue;
          progressBar.style.width = `${start}%`;
          progressContainer.setAttribute('aria-valuenow', Math.floor(start));
          progressNumber.textContent = `${Math.floor(start)}%`;
          if (start < progressValue) {
            requestAnimationFrame(step);
          }
        }
        step();
      }
    });
  }

  window.addEventListener('scroll', animateSkills);
  animateSkills(); // initial check on load
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

document.addEventListener('DOMContentLoaded', () => {
  renderTechStackGrid(techStackData);
  initTechStackFilter();
  initSkillMeterAnimation();
});


})();

