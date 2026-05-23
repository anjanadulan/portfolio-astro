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

  let delay = typeState.deleting ? 40 : 80;

  if (!typeState.deleting && typeState.charIndex === phrase.length) {
    typeState.deleting = true;
    delay = 1800;
  }

  if (typeState.deleting && typeState.charIndex === 0) {
    typeState.deleting = false;
    typeState.textIndex = (typeState.textIndex + 1) % typewriterTexts.length;
    delay = 300;
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

  window.setTimeout(typewriterStep, 400);
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
      const rotateY = Math.max(-6, Math.min(6, offsetX / 60));
      const rotateX = Math.max(-4, Math.min(4, -offsetY / 65));
      container.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
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
      }, 60 + index * 60);
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
  const revealTargets = document.querySelectorAll('.stat-item, .skill-category-card, .skill-detail-card, .project-card, .contact-content');
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
  }, { threshold: 0.12, rootMargin: '-4% 0px -8% 0px' });

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

function initPageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  const hideLoader = () => {
    setTimeout(() => loader.classList.add('hidden'), 200);
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

function initModals() {
  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('close-modal');
  const cards = document.querySelectorAll('.project-card[data-project]');

  if (!modal || !modalBody) return;

  function closeModal() {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100', 'pointer-events-auto');

    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.classList.add('scale-95');
      modalContent.classList.remove('scale-100');
    }

    document.body.style.overflow = '';

    setTimeout(() => {
      if (modalContent) modalContent.scrollTop = 0;
    }, 300);
  }

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;

      const id = card.dataset.project;
      const data = window.projectData ? window.projectData[id] : null;
      if (data) {
        modalBody.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            <div style="border-bottom:1px solid var(--border);padding-bottom:1rem;padding-right:2rem;">
              <span style="font-family:var(--font-mono);font-size:0.65rem;font-weight:500;color:var(--accent);letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:0.4rem;">${data.category}</span>
              <h3 style="font-family:var(--font-heading);font-size:clamp(1.4rem,3vw,1.8rem);font-weight:800;color:var(--text);letter-spacing:-0.02em;line-height:1.1;">${data.title}</h3>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;background:var(--surface);padding:0.875rem;border-radius:12px;border:1px solid var(--border);">
              <div style="display:flex;flex-direction:column;gap:0.2rem;">
                <span style="font-family:var(--font-mono);font-size:0.6rem;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);">My Role</span>
                <span style="color:var(--text);font-size:0.85rem;font-weight:500;">${data.role || 'Developer'}</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:0.2rem;">
                <span style="font-family:var(--font-mono);font-size:0.6rem;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);">Duration</span>
                <span style="color:var(--text);font-size:0.85rem;font-weight:500;">${data.duration || 'N/A'}</span>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:0.4rem;">
              <span style="font-family:var(--font-mono);font-size:0.6rem;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);">Project Overview</span>
              <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;">${data.desc}</p>
            </div>

            <div style="display:flex;flex-direction:column;gap:0.6rem;">
              <span style="font-family:var(--font-mono);font-size:0.6rem;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);">Key Features</span>
              <ul style="display:flex;flex-direction:column;gap:0.5rem;list-style:none;padding:0;margin:0;">
                ${data.features.map(f => `
                  <li style="display:flex;align-items:flex-start;gap:0.5rem;color:var(--text-secondary);font-size:0.85rem;line-height:1.6;">
                    <span style="color:var(--accent);flex-shrink:0;margin-top:2px;font-size:0.6rem;">&#9670;</span>
                    <span>${f}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div style="display:flex;flex-direction:column;gap:0.4rem;">
              <span style="font-family:var(--font-mono);font-size:0.6rem;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);">Development Methodology</span>
              <p style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-secondary);line-height:1.6;background:var(--surface);padding:0.625rem 0.875rem;border-radius:10px;border:1px solid var(--border);">${data.methods}</p>
            </div>

            ${data.challenge ? `
            <div style="display:flex;flex-direction:column;gap:0.4rem;">
              <span style="font-family:var(--font-mono);font-size:0.6rem;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);">Technical Challenge</span>
              <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.7;">${data.challenge}</p>
            </div>
            ` : ''}

            <div style="display:flex;flex-direction:column;gap:0.4rem;">
              <span style="font-family:var(--font-mono);font-size:0.6rem;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);">Technology Stack</span>
              <div style="display:flex;flex-wrap:wrap;gap:0.35rem;">${data.tech}</div>
            </div>

            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.6rem;margin-top:0.25rem;padding-top:1rem;border-top:1px solid var(--border);">
              <a
                href="${data.github}"
                style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.5rem 1rem;border-radius:8px;font-family:var(--font-body);font-size:0.75rem;font-weight:600;border:1px solid var(--border);color:var(--text-secondary);background:var(--surface);transition:all 0.2s;"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                View Repository
              </a>
              ${data.demo ? `
              <a
                href="${data.demo}"
                style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.5rem 1rem;border-radius:8px;font-family:var(--font-body);font-size:0.75rem;font-weight:600;color:#fff;background:var(--accent);transition:all 0.2s;"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Launch Live Demo
              </a>` : ''}
            </div>
          </div>
        `;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;

        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100', 'pointer-events-auto');
        if (modalContent) {
          modalContent.classList.remove('scale-95');
          modalContent.classList.add('scale-100');
        }
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('opacity-0')) closeModal();
  });
}

function initAll() {
  initTheme();
  initMobileMenu();
  initSmoothAnchors();
  initScrollChoreography();
  initHeroTilt();
  initSkillsSwitcher();
  initScrollReveals();
  initNavbar();
  initTypewriter();
  initPageLoader();
  initBackToTop();
  initModals();
}

document.addEventListener('astro:page-load', initAll);
