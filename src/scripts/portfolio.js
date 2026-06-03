const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let scrollIdleTimer = null;

// Astro ClientRouter event listener and timeout registry
if (!window.__portfolioRegistry) {
  window.__portfolioRegistry = {
    listeners: [],
    timeouts: [],
    observers: []
  };
}

function registerListener(target, type, listener, options) {
  if (!target) return;
  target.addEventListener(type, listener, options);
  window.__portfolioRegistry.listeners.push({ target, type, listener, options });
}

function registerTimeout(callback, delay) {
  const id = window.setTimeout(callback, delay);
  window.__portfolioRegistry.timeouts.push(id);
  return id;
}

function registerObserver(observer) {
  if (!observer) return;
  window.__portfolioRegistry.observers.push(observer);
  return observer;
}

function cleanupAll() {
  if (scrollIdleTimer) {
    window.clearTimeout(scrollIdleTimer);
    scrollIdleTimer = null;
  }

  // Remove event listeners
  if (window.__portfolioRegistry.listeners) {
    window.__portfolioRegistry.listeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    window.__portfolioRegistry.listeners = [];
  }

  // Clear timeouts
  if (window.__portfolioRegistry.timeouts) {
    window.__portfolioRegistry.timeouts.forEach((id) => window.clearTimeout(id));
    window.__portfolioRegistry.timeouts = [];
  }

  // Disconnect observers
  if (window.__portfolioRegistry.observers) {
    window.__portfolioRegistry.observers.forEach((obs) => obs.disconnect());
    window.__portfolioRegistry.observers = [];
  }
}

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
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    registerListener(toggle, 'click', () => {
      setTheme(root.classList.contains('light') ? 'dark' : 'light');
    });
  }
}

function initMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
  }

  registerListener(toggle, 'click', () => {
    const willOpen = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    registerListener(link, 'click', closeMenu);
  });

  registerListener(window, 'resize', () => {
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

  registerTimeout(typewriterStep, delay);
}

function initTypewriter() {
  const target = document.getElementById('typewriter');
  if (!target) return;

  if (prefersReducedMotion) {
    target.textContent = typewriterTexts[0];
    return;
  }

  typeState = { textIndex: 0, charIndex: 0, deleting: false };
  registerTimeout(typewriterStep, 400);
}

function initHeroTilt() {
  const container = document.querySelector('.hero-image-container');
  const hero = document.querySelector('.hero');
  if (!container || !hero || prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  let frame = null;
  registerListener(hero, 'mousemove', (event) => {
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

  registerListener(hero, 'mouseleave', () => {
    container.style.transform = '';
  });
}

function initSkillsScrollShow() {
  const skillsSection = document.getElementById('skills');
  const detailCards = Array.from(document.querySelectorAll('.skill-detail-card'));
  if (!skillsSection || !detailCards.length) return;

  const isDesktop = window.innerWidth >= 921 && !prefersReducedMotion;

  if (!isDesktop) {
    detailCards.forEach((card) => {
      card.style.position = 'static';
      card.style.opacity = '1';
      card.style.transform = 'none';
      card.style.pointerEvents = 'auto';
      card.querySelectorAll('.skill-item').forEach((item) => item.classList.add('visible'));
    });
    skillsSection.classList.add('skills-header-visible');
    return;
  }

  const CARD_COUNT = detailCards.length;
  const SLIDE_DURATION = 0.28;
  const FADE_DURATION  = 0.08;

  function getCardState(index, progress) {
    const start = index * (SLIDE_DURATION - FADE_DURATION);
    const end   = start + SLIDE_DURATION;
    const holdStart = start + FADE_DURATION;
    const holdEnd   = end - FADE_DURATION;

    if (index === CARD_COUNT - 1 && progress >= holdStart) {
      return { opacity: 1, translateY: 0, isDominant: true };
    }

    let opacity = 0;
    let translateY = 0;

    if (progress < start || progress > end) {
      opacity = 0;
      translateY = progress < start ? 20 : -20;
    } else if (progress < holdStart) {
      const t = (progress - start) / FADE_DURATION;
      opacity = t;
      translateY = 20 * (1 - t);
    } else if (progress < holdEnd) {
      opacity = 1;
      translateY = 0;
    } else {
      const t = (progress - holdEnd) / FADE_DURATION;
      opacity = 1 - t;
      translateY = -20 * t;
    }

    return { opacity, translateY, isDominant: opacity > 0.5 };
  }

  const cardsAnimatedFor = new Set();

  function animateCardBars(card) {
    const idx = card.dataset.skillIndex;
    if (cardsAnimatedFor.has(idx)) return;
    cardsAnimatedFor.add(idx);

    const items = card.querySelectorAll('.skill-item');
    items.forEach((item) => item.classList.remove('visible'));
    items.forEach((item, i) => {
      registerTimeout(() => item.classList.add('visible'), 30 + i * 120);
    });
  }

  let rafId = null;

  function update() {
    const rect = skillsSection.getBoundingClientRect();
    const sectionH = skillsSection.offsetHeight;
    const viewportH = window.innerHeight;
    const scrolled = -rect.top;
    const scrollable = sectionH - viewportH;
    const progress = scrollable > 0 ? Math.max(0, Math.min(1, scrolled / scrollable)) : 1;

    skillsSection.classList.add('skills-header-visible');

    detailCards.forEach((card, i) => {
      const state = getCardState(i, progress);
      card.style.opacity = String(state.opacity);
      card.style.transform = `translateY(${state.translateY}px)`;
      card.style.pointerEvents = state.isDominant ? 'auto' : 'none';
      card.classList.toggle('active', state.isDominant);

      if (state.isDominant) {
        animateCardBars(card);
      }
    });

    const isInsideSkills = scrolled >= 0 && scrolled <= scrollable;
    if (isInsideSkills && progress < 0.80) {
      document.body.classList.add('skills-active');
    } else {
      document.body.classList.remove('skills-active');
    }

    rafId = null;
  }

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(update);
  }

  registerListener(window, 'scroll', onScroll, { passive: true });
  registerListener(window, 'resize', update);
  update();
}

function initScrollReveals() {
  const revealTargets = document.querySelectorAll('.stat-item, .project-card, .contact-content');
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

  registerObserver(observer);

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
    scrollIdleTimer = registerTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 160);

    raf = null;
  }

  function requestUpdate() {
    if (raf) return;
    raf = requestAnimationFrame(update);
  }

  update();
  registerListener(window, 'scroll', requestUpdate, { passive: true });
  registerListener(window, 'resize', requestUpdate);
}

function initNavbar() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  function updateNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  updateNav();
  registerListener(window, 'scroll', updateNav, { passive: true });
}

function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  if (!navLinks.length) return;

  const sections = [];
  const linkMap = new Map();

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;
    
    const targetId = href.substring(hashIndex + 1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      if (!sections.includes(targetElement)) {
        sections.push(targetElement);
      }
      if (!linkMap.has(targetId)) {
        linkMap.set(targetId, []);
      }
      linkMap.get(targetId).push(link);
    }
  });

  if (!sections.length) return;

  sections.sort((a, b) => a.offsetTop - b.offsetTop);

  function updateActiveLink() {
    const navOffset = document.querySelector('.nav')?.offsetHeight || 80;
    const scrollPosition = window.scrollY + navOffset + 70;

    let activeSectionId = null;

    const totalHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtBottom = (window.scrollY + clientHeight) >= totalHeight - 50;

    if (isAtBottom) {
      activeSectionId = sections[sections.length - 1].id;
    } else {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollPosition >= top && scrollPosition < top + height) {
          activeSectionId = section.id;
          break;
        }
      }
    }

    if (window.scrollY < 80) {
      const homeSection = document.getElementById('home');
      if (homeSection) {
        activeSectionId = 'home';
      } else {
        if (window.location.pathname.includes('projects') || document.getElementById('projects')) {
          activeSectionId = 'projects';
        } else {
          activeSectionId = null;
        }
      }
    }

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const hashIndex = href.indexOf('#');
      const targetId = hashIndex !== -1 ? href.substring(hashIndex + 1) : null;
      
      if (targetId && targetId === activeSectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  registerListener(window, 'scroll', updateActiveLink, { passive: true });
  registerListener(window, 'resize', updateActiveLink);
  updateActiveLink();
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    registerListener(anchor, 'click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const navOffset = (document.querySelector('.nav')?.offsetHeight || 60) + 24;
      const top = target.getBoundingClientRect().top + window.scrollY - navOffset;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });
}

function initPageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) {
    document.body.classList.add('loaded');
    return;
  }

  const hideLoader = () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.add('loaded');
    }, 200);
  };

  if (document.readyState === 'complete') hideLoader();
  else registerListener(window, 'load', hideLoader);
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  registerListener(window, 'scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  registerListener(btn, 'click', () => {
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
    registerListener(card, 'click', (e) => {
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

  if (closeBtn) registerListener(closeBtn, 'click', closeModal);
  registerListener(modal, 'click', (e) => {
    if (e.target === modal) closeModal();
  });
  registerListener(document, 'keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('opacity-0')) closeModal();
  });
}

function initAll() {
  cleanupAll();

  // Reset loaded class to force re-evaluation of entry animations
  document.body.classList.remove('loaded');
  void document.body.offsetWidth; // force layout reflow

  initTheme();
  initMobileMenu();
  initSmoothAnchors();
  initScrollChoreography();
  initHeroTilt();
  initSkillsScrollShow();
  initScrollReveals();
  initNavbar();
  initScrollSpy();
  initTypewriter();
  initPageLoader();
  initBackToTop();
  initModals();
}

document.addEventListener('astro:page-load', initAll);
