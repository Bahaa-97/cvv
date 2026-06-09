/**
 * ResumeForge — Utility Functions
 * Shared helpers used across all pages.
 */

/**
 * Format a number with compact notation (e.g., 12400 → "12.4K")
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay ms
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Safely get a URL search param.
 * @param {string} key
 * @returns {string|null}
 */
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'info'|'success'|'error'|'warning'} type
 * @param {number} duration ms
 */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const icons = {
    info: 'fa-circle-info',
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
  };
  const colors = {
    info: '#6366f1',
    success: '#10b981',
    error: '#f43f5e',
    warning: '#f59e0b',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type]}" style="color:${colors[type]}; font-size:1.1rem;" aria-hidden="true"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  // Auto-remove
  const remove = () => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    toast.addEventListener('animationend', () => toast.remove());
  };
  setTimeout(remove, duration);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

/**
 * Animate counting numbers (for stats).
 * @param {HTMLElement} el - Element with data-count attribute
 */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 2000;
  const start = performance.now();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(easeOut(progress) * target);
    el.textContent = formatNumber(current);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/**
 * Observe elements and trigger count animations when visible.
 */
function initCountAnimations() {
  const elements = document.querySelectorAll('[data-count]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  elements.forEach(el => observer.observe(el));
}

/**
 * Get category color for badges.
 * @param {string} category
 * @returns {{bg: string, color: string}}
 */
function getCategoryStyle(category) {
  const map = {
    modern:   { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1' },
    minimal:  { bg: 'rgba(14,165,233,0.12)',  color: '#0ea5e9' },
    creative: { bg: 'rgba(244,63,94,0.12)',   color: '#f43f5e' },
    ats:      { bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
    arabic:   { bg: 'rgba(139,92,246,0.12)',  color: '#8b5cf6' },
    executive:{ bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  };
  return map[category] || { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' };
}

/**
 * Category label mapping.
 * @param {string} category
 * @returns {string}
 */
function getCategoryLabel(category) {
  const lang = window.ResumeForge.lang ? window.ResumeForge.lang.get() : 'en';
  const isAr = lang === 'ar';
  
  const labels = {
    modern: isAr ? 'عصري' : 'Modern',
    minimal: isAr ? 'بسيط' : 'Minimal',
    creative: isAr ? 'إبداعي' : 'Creative',
    ats: isAr ? 'متوافق مع ATS' : 'ATS Friendly',
    arabic: isAr ? 'عربي / Arabic' : 'Arabic / عربي',
    executive: isAr ? 'تنفيذي' : 'Executive',
  };
  return labels[category] || category;
}

function getDummyData() {
  return {
    personal: {
      fullName: "Alex Morgan",
      jobTitle: "Senior Professional",
      email: "hello@example.com",
      phone: "+1 234 567 890",
      city: "New York",
      country: "USA",
      website: "alexmorgan.dev"
    },
    social: {
      linkedin: "linkedin.com/in/alex",
      github: "github.com/alex"
    },
    summary: "Innovative and deadline-driven professional with 5+ years of experience designing and developing user-centered solutions from initial concept to final, polished deliverable.",
    experience: [
      {
        title: "Senior Position",
        company: "Tech Solutions Inc.",
        startDate: "Jan 2020",
        endDate: "Present",
        location: "New York, NY",
        description: "- Spearheaded the redesign of the main application.\n- Improved performance by 40%."
      },
      {
        title: "Mid-level Role",
        company: "Creative Agency",
        startDate: "Mar 2017",
        endDate: "Dec 2019",
        location: "Boston, MA",
        description: "- Developed responsive projects for various clients.\n- Collaborated closely with the team."
      }
    ],
    education: [
      {
        degree: "Bachelor's Degree",
        school: "University of Excellence",
        startDate: "2013",
        endDate: "2017",
        location: "Boston, MA",
        description: "Graduated with Honors."
      }
    ],
    skills: ["Leadership", "Project Management", "Communication", "Problem Solving", "Design", "Strategy"],
    languages: [
      { name: "English", level: "Native" },
      { name: "Spanish", level: "Intermediate" }
    ]
  };
}

/**
 * Build a template card HTML element.
 * @param {Object} template - template data object
 * @returns {HTMLElement}
 */
function buildTemplateCard(template) {
  const catStyle = getCategoryStyle(template.category);
  const catLabel = getCategoryLabel(template.category);
  
  const lang = window.ResumeForge.lang ? window.ResumeForge.lang.get() : 'en';
  const isAr = lang === 'ar';
  
  const name = isAr && template.nameAr ? template.nameAr : template.name;
  const description = isAr && template.descriptionAr ? template.descriptionAr : template.description;
  const editBtnText = window.ResumeForge.translations ? 
    (window.ResumeForge.translations[lang]['btn_edit_now'] || 'Edit Now') : 'Edit Now';

  const card = document.createElement('article');
  card.className = 'template-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${name} template`);
  card.dataset.templateId = template.id;

  card.innerHTML = `
    <div class="template-card-preview">
      ${template.featured ? '<span class="template-badge-featured">⭐ ' + (isAr ? 'مميز' : 'Featured') + '</span>' : ''}
      <img src="${template.preview || 'assets/previews/placeholder.svg'}" alt="${name} Preview" loading="lazy" onerror="this.src='assets/previews/placeholder.svg'" />
      <div class="template-card-overlay">
        <a href="editor.html?template=${template.id}" class="btn btn-white btn-sm" tabindex="-1">
          <i class="fa-solid fa-pen-to-square"></i> ${editBtnText}
        </a>
        <button class="btn btn-ghost btn-sm preview-btn" data-id="${template.id}" tabindex="-1">
          <i class="fa-solid fa-eye"></i>
        </button>
      </div>
    </div>
    <div class="template-card-body">
      <span class="template-card-category" style="background:${catStyle.bg};color:${catStyle.color};">
        ${catLabel}
      </span>
      <h3 class="template-card-title">${name}</h3>
      <p class="template-card-desc">${description}</p>
      <div class="template-card-meta">
        <span class="ats-score" title="ATS Score">
          <i class="fa-solid fa-robot"></i> ATS ${template.atsScore}%
        </span>
        <span class="downloads-count">
          <i class="fa-solid fa-download"></i> ${formatNumber(template.downloads)}
        </span>
      </div>
    </div>
  `;

  // Click anywhere on card → go to editor
  card.addEventListener('click', (e) => {
    if (e.target.closest('.preview-btn')) return;
    window.location.href = `editor.html?template=${template.id}`;
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = `editor.html?template=${template.id}`;
    }
  });

  return card;
}

/**
 * Initialize smooth scroll for anchor links.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * Initialize Scroll to Top button
 */
function initScrollToTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-to-top';
  btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', debounce(() => {
    if (window.scrollY > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, 50));

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollToTop();
});

// Export to global scope
window.ResumeForge = window.ResumeForge || {};
Object.assign(window.ResumeForge, {
  formatNumber,
  debounce,
  getParam,
  showToast,
  animateCount,
  initCountAnimations,
  getCategoryStyle,
  getCategoryLabel,
  buildTemplateCard,
  initSmoothScroll,
});
