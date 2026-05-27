/**
 * ResumeForge — Homepage Script
 * Initializes AOS animations, stat counters, and featured templates grid.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { templates, initCountAnimations, buildTemplateCard, initSmoothScroll } = window.ResumeForge;

  // ── AOS ────────────────────────────────────────────────────
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
    });
  }

  // ── Smooth scroll ──────────────────────────────────────────
  initSmoothScroll();

  // ── Count animations ───────────────────────────────────────
  initCountAnimations();

  // ── Featured Templates Grid ────────────────────────────────
  const grid = document.getElementById('featuredTemplatesGrid');

  function renderFeatured(featuredList) {
    grid.innerHTML = '';
    if (featuredList.length === 0) {
      grid.innerHTML = '<p class="text-center" style="color:var(--text-muted);grid-column:1/-1;">No templates available yet.</p>';
    } else {
      featuredList.forEach((tpl, i) => {
        const card = buildTemplateCard(tpl);
        card.style.animationDelay = `${i * 100}ms`;
        grid.appendChild(card);
      });
    }
  }

  if (grid) {
    try {
      await templates.load();
      const featured = templates.getFeatured(3);
      renderFeatured(featured);
      
      window.addEventListener('languageChanged', () => {
        renderFeatured(featured);
      });
    } catch (err) {
      console.error('[Home] Failed to load featured templates:', err);
      grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;">Unable to load templates.</p>';
    }
  }

  // ── Handle URL category params (from category cards on home) ──
  document.querySelectorAll('a[href*="?category="]').forEach(link => {
    link.addEventListener('click', (e) => {
      // Let default link navigation happen
    });
  });
});
