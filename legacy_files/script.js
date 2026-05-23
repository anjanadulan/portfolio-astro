// Main portfolio interactions: theme, mobile menu, typewriter, tilt, skills, reveals, navbar.

const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let scrollIdleTimer = null;

function setTheme(theme) {
  const isLight = theme === 'light';
  root.classList.toggle('light', isLight);
  root.classList.toggle('dark', !isLight);
  localStorage.setItem('theme', isLight ? 'light' : 'dark');

  const toggle = document.getElementById('theme-toggle');
  toggle?.classList.toggle('light-mode', isLight);
  toggle?.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  setTheme(savedTheme || 'dark');
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    setTheme(root.classList.contains('light') ? 'dark' : 'light');
  });
}

function initMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const willOpen = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMenu();
  });
}

const typewriterTexts = [
  'a Software Engineer',
  'a Frontend Developer',
  'an IoT Builder',
  'a Java Developer',
  'a UI/UX Designer',
  'a Problem Solver'
];

let typeState = { textIndex: 0, charIndex: 0, deleting: false };

function typewriterStep() {
  const target = document.getElementById('typewriter');
  if (!target) return;

  const phrase = typewriterTexts[typeState.textIndex];
  typeState.charIndex += typeState.deleting ? -1 : 1;
  target.textContent = phrase.slice(0, typeState.charIndex);

  let delay = typeState.deleting ? 42 : 86;

  if (!typeState.deleting && typeState.charIndex === phrase.length) {
    typeState.deleting = true;
    delay = 1600;
  }

  if (typeState.deleting && typeState.charIndex === 0) {
    typeState.deleting = false;
    typeState.textIndex = (typeState.textIndex + 1) % typewriterTexts.length;
    delay = 320;
  }

  window.setTimeout(typewriterStep, delay);
}

function initTypewriter() {
  const target = document.getElementById('typewriter');
  if (!target) return;

  if (prefersReducedMotion) {
    target.textContent = typewriterTexts[0];
    return;
  }

  window.setTimeout(typewriterStep, 500);
}

function initHeroTilt() {
  const container = document.querySelector('.hero-image-container');
  const hero = document.querySelector('.hero');
  if (!container || !hero || prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  let frame = null;
  hero.addEventListener('mousemove', (event) => {
    if (frame) return;

    frame = requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;
      const rotateY = Math.max(-12, Math.min(12, offsetX / 48));
      const rotateX = Math.max(-10, Math.min(10, -offsetY / 52));
      container.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.02)`;
      frame = null;
    });
  });

  hero.addEventListener('mouseleave', () => {
    container.style.transform = '';
  });
}

function initSkillsSwitcher() {
  const categories = document.querySelector('.skills-categories');
  const detailCards = Array.from(document.querySelectorAll('.skills-details .skill-detail-card'));
  if (!categories || !detailCards.length) return;

  const buttons = Array.from(categories.querySelectorAll('[data-category]'));

  detailCards.forEach((card) => {
    card.querySelectorAll('.skill-bar-fill').forEach((bar) => {
      bar.dataset.width = bar.style.width || '0%';
      if (!prefersReducedMotion) bar.style.width = '0%';
    });
  });

  function animateBars(card) {
    card.querySelectorAll('.skill-bar-fill').forEach((bar, index) => {
      const width = bar.dataset.width || '0%';
      if (prefersReducedMotion) {
        bar.style.width = width;
        return;
      }

      bar.style.width = '0%';
      window.setTimeout(() => {
        bar.style.width = width;
      }, 90 + index * 80);
    });
  }

  function showCategory(category) {
    detailCards.forEach((card) => {
      const isActive = card.id === `skill-${category}`;
      card.classList.toggle('hidden', !isActive);
      if (isActive) {
        card.classList.add('visible');
        animateBars(card);
      }
    });

    buttons.forEach((button) => {
      const isActive = button.dataset.category === category;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  categories.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (button) showCategory(button.dataset.category);
  });

  categories.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const button = event.target.closest('[data-category]');
    if (!button) return;
    event.preventDefault();
    showCategory(button.dataset.category);
  });

  showCategory(buttons[0]?.dataset.category || 'frontend');
}

function initScrollReveals() {
  const revealTargets = document.querySelectorAll('.glass-card, .skill-category-card, .skill-detail-card, .project-card, .contact-content');
  if (!revealTargets.length) return;

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    revealTargets.forEach((target) => target.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = entry.target;
      if (target.classList.contains('hidden')) return;

      const isAbove = entry.boundingClientRect.top < 0;

      target.classList.toggle('visible', entry.isIntersecting);
      target.classList.toggle('is-above', !entry.isIntersecting && isAbove);
      target.classList.toggle('is-below', !entry.isIntersecting && !isAbove);
    });
  }, { threshold: 0.2, rootMargin: '-4% 0px -12% 0px' });

  revealTargets.forEach((target) => {
    target.classList.add('is-below');
    observer.observe(target);
  });
}

function initScrollChoreography() {
  if (prefersReducedMotion) {
    root.style.setProperty('--scroll-progress', '0');
    return;
  }

  let raf = null;

  function update() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const y = window.scrollY || window.pageYOffset;
    const progress = Math.min(1, Math.max(0, y / maxScroll));

    root.style.setProperty('--scroll-progress', progress.toFixed(4));
    document.body.classList.add('is-scrolling');

    window.clearTimeout(scrollIdleTimer);
    scrollIdleTimer = window.setTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 160);

    raf = null;
  }

  function requestUpdate() {
    if (raf) return;
    raf = requestAnimationFrame(update);
  }

  update();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
}

function initNavbar() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  function updateNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const navOffset = document.querySelector('.nav')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navOffset + 2;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });
}

function initCustomCursor() {
  if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;
  
  document.body.classList.add('has-custom-cursor');
  
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .skill-category-card, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

function initPageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  const hideLoader = () => {
    setTimeout(() => loader.classList.add('hidden'), 300);
  };
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

function initParticles() {
  if (typeof tsParticles === 'undefined' || prefersReducedMotion) return;
  if (!document.getElementById("tsparticles-container")) return;
  tsParticles.loadPreset("tsparticles-container", {
    preset: "stars",
    background: {
      color: "transparent"
    },
    particles: {
      number: { value: 60 },
      size: { value: { min: 0.5, max: 2 } },
      move: { speed: 0.5 }
    }
  });
}

const projectData = {
  'distributor': {
    title: 'Distributor MS',
    category: 'Enterprise Software & Distribution',
    desc: 'A full-stack Distribution Management System featuring role-based dashboards, inventory tracking, and automated reporting. Built to streamline supply chain operations with robust analytics.',
    tech: '<span class="tech-tag">Node.js</span><span class="tech-tag">PostgreSQL</span><span class="tech-tag">Tailwind</span><span class="tech-tag">Electron</span>',
    features: [
      'Role-based dashboards (Admin, Distributor)',
      'Real-time inventory tracking & alerts',
      'Automated PDF invoicing & reporting',
      'Local data caching for offline support'
    ],
    methods: 'RESTful API architecture, Client-Server Sync, Relational Database Modeling',
    github: 'https://github.com/anjanadulan/DISTRIBUTOR-MS',
    demo: 'https://distributor-ms.vercel.app'
  },
  'agrochain': {
    title: 'AgroChain',
    category: 'Smart Agriculture & Supply Chain',
    desc: 'Smart Agricultural Management System for field registration, crop monitoring, and connecting farmers with buyers. Features include real-time weather integration and yield prediction models.',
    tech: '<span class="tech-tag">Java 24</span><span class="tech-tag">Swing</span><span class="tech-tag">MySQL</span><span class="tech-tag">JDBC</span>',
    features: [
      'Farmer crop listing & pricing system',
      'Weather API integration for crop safety',
      'Secure buyer-seller messaging portal',
      'Database backup and transaction logs'
    ],
    methods: 'Object-Oriented Programming (OOP), MVC Pattern, Relational DB Design, JDBC Connectivity',
    github: 'https://github.com/anjanadulan/AGROCHAIN'
  },
  'smart-prison': {
    title: 'Smart Prison IoT',
    category: 'IoT Security & Embedded Systems',
    desc: 'IoT security prototype with automated lighting, motion-based alarms, and fire detection systems using Arduino. Includes a web dashboard for real-time monitoring and alert management.',
    tech: '<span class="tech-tag">Arduino</span><span class="tech-tag">IoT Sensors</span><span class="tech-tag">Logic Gates</span><span class="tech-tag">C++</span>',
    features: [
      'Automated perimeter motion sensors',
      'Flame & smoke warning alarms',
      'Central console web dashboard integration',
      'Hardware failsafes using logic gates'
    ],
    methods: 'Hardware-Software Interfacing, Sensor Data Filtering, Event-driven Interrupts',
    github: 'https://github.com/anjanadulan/SMART-PRISON-PROTOTYPE'
  },
  'simple-calc': {
    title: 'SimpleCalc',
    category: 'Web Applications',
    desc: 'A modern, Java Servlet-based web calculator featuring a responsive dark crimson glassmorphic user interface styled with Tailwind CSS.',
    tech: '<span class="tech-tag">Java</span><span class="tech-tag">Servlets</span><span class="tech-tag">Tailwind CSS</span>',
    features: [
      'Full arithmetic operation support',
      'Responsive design for mobile & desktop',
      'Calculation history tracking'
    ],
    methods: 'Servlet Request/Response Handling, Server-side Evaluation, Glassmorphism Styling',
    github: 'https://github.com/anjanadulan/simpleCalc-jsp-servlets-'
  },
  'bookstore': {
    title: 'BookStore Website',
    category: 'E-commerce Templates',
    desc: 'PHP-based template for a bookstore website with user authentication and book catalog management.',
    tech: '<span class="tech-tag">PHP</span><span class="tech-tag">MySQL</span><span class="tech-tag">HTML</span>',
    features: [
      'User registration & secure login',
      'Catalog search and filtering by category',
      'Virtual shopping cart & order placement'
    ],
    methods: 'Session Management, Relational Database Queries, CRUD Operations',
    github: 'https://github.com/anjanadulan/BookStore_website-CW-'
  },
  'taxi': {
    title: 'Taxi Management System',
    category: 'Web Dashboards & Interfaces',
    desc: 'A web-based taxi management interface built with HTML, CSS, and basic JavaScript for managing rides and drivers.',
    tech: '<span class="tech-tag">HTML</span><span class="tech-tag">CSS</span><span class="tech-tag">JS</span>',
    features: [
      'Interactive booking requests form',
      'Driver status tracking panel',
      'Passenger management dashboard'
    ],
    methods: 'DOM Manipulation, LocalStorage mock data, CSS Grid layouts',
    github: 'https://github.com/anjanadulan/TAXI_manage'
  },
  'camp-conn': {
    title: 'Camp-Conn',
    category: 'Static Platforms',
    desc: 'A web platform built to connect campers, featuring a clean, responsive HTML layout.',
    tech: '<span class="tech-tag">HTML</span><span class="tech-tag">CSS</span>',
    features: [
      'Campsite directory & reviews list',
      'Responsive layouts for mobile viewports',
      'Contact forms & interactive maps'
    ],
    methods: 'Responsive Web Design, Flexbox Layouts, Modern Typography',
    github: 'https://github.com/anjanadulan/camp-conn'
  }
};

function initModals() {
  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('close-modal');
  const cards = document.querySelectorAll('.project-card[data-project]');
  
  if (!modal || !modalBody) return;

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;
  }

  cards.forEach(card => {
    // Add hover cursor logic manually for cards if needed, or let CSS handle it
    const customCursor = document.getElementById('custom-cursor');
    if (customCursor) {
      card.addEventListener('mouseenter', () => customCursor.classList.add('hover'));
      card.addEventListener('mouseleave', () => customCursor.classList.remove('hover'));
    }

    card.addEventListener('click', (e) => {
      // Don't open modal if clicking a link inside the card
      if (e.target.closest('a')) return;

      const id = card.dataset.project;
      const data = projectData[id];
      if (data) {
        modalBody.innerHTML = `
          <div class="modal-body-content" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
              <h3 class="text-gradient" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.2rem; font-family: var(--font-heading);">${data.title}</h3>
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent); opacity: 0.8; text-transform: uppercase; letter-spacing: 0.12em;">${data.category}</span>
            </div>
            
            <div class="modal-info-row">
              <span style="font-size: 0.82rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 0.6rem;">Description</span>
              <p style="font-size: 1rem; line-height: 1.8; color: var(--text-secondary); margin-bottom: 0;">${data.desc}</p>
            </div>

            <div class="modal-info-row">
              <span style="font-size: 0.82rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 0.6rem;">Key Features</span>
              <ul style="margin: 0; padding-left: 1.25rem; color: var(--text-secondary); font-size: 0.96rem; line-height: 1.8; list-style-type: square;">
                ${data.features.map(f => '<li style="margin-bottom: 0.35rem;">' + f + '</li>').join('')}
              </ul>
            </div>

            <div class="modal-info-row">
              <span style="font-size: 0.82rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 0.6rem;">Development Methods & Patterns</span>
              <p style="font-size: 0.96rem; line-height: 1.7; color: var(--text-secondary); margin-bottom: 0;">${data.methods}</p>
            </div>

            <div class="modal-info-row">
              <span style="font-size: 0.82rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 0.6rem;">Used Technologies</span>
              <div class="tech-stack" style="margin-bottom: 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">${data.tech}</div>
            </div>

            <div class="modal-actions" style="margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.85rem;">
              <a href="${data.github}" class="btn btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; vertical-align:middle; margin-right:4px;"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                View Source
              </a>
              ${data.demo ? `
              <a href="${data.demo}" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; vertical-align:middle; margin-right:4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                Live Demo
              </a>` : ''}
            </div>
          </div>
        `;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initSmoothAnchors();
  initScrollChoreography();
  initHeroTilt();
  initSkillsSwitcher();
  initScrollReveals();
  initNavbar();
  initTypewriter();
  initCustomCursor();
  initPageLoader();
  initBackToTop();
  initParticles();
  initModals();
});