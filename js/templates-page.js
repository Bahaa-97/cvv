/**
 * ResumeForge — Templates Page Script
 * Handles search, filter, sort, and rendering of all templates.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { templates, buildTemplateCard, debounce, getParam } = window.ResumeForge;

  // ── AOS ────────────────────────────────────────────────────
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 600, easing: 'ease-out-cubic', once: true });
  }

  // ── DOM Refs ───────────────────────────────────────────────
  const grid         = document.getElementById('templatesGrid');
  const emptyState   = document.getElementById('emptyState');
  const countNum     = document.getElementById('countNum');
  const searchInput  = document.getElementById('searchInput');
  const searchClear  = document.getElementById('searchClear');
  const sortSelect   = document.getElementById('sortSelect');
  const filterPills  = document.getElementById('filterPills');
  const clearFiltersBtn = document.getElementById('clearFilters');

  // ── State ──────────────────────────────────────────────────
  let currentCategory = 'all';
  let currentQuery    = '';
  let currentSort     = 'featured';

  // ── Load templates ─────────────────────────────────────────
  await templates.load();

  // ── Check URL params ───────────────────────────────────────
  const paramCategory = getParam('category');
  const paramQ        = getParam('q');

  if (paramCategory) {
    currentCategory = paramCategory;
    setActivePill(paramCategory);
  }

  if (paramQ) {
    currentQuery = paramQ;
    searchInput.value = paramQ;
    searchClear.classList.add('visible');
  }

  // ── Render ─────────────────────────────────────────────────
  renderTemplates();

  // ── Event Listeners ────────────────────────────────────────

  window.addEventListener('languageChanged', renderTemplates);

  // Search
  searchInput.addEventListener('input', debounce((e) => {
    currentQuery = e.target.value;
    searchClear.classList.toggle('visible', currentQuery.length > 0);
    renderTemplates();
  }, 250));

  // Clear search
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    currentQuery = '';
    searchClear.classList.remove('visible');
    searchInput.focus();
    renderTemplates();
  });

  // Sort
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTemplates();
  });

  // Filter pills
  filterPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;

    currentCategory = pill.dataset.filter;
    setActivePill(currentCategory);
    renderTemplates();
  });

  // Clear filters button (in empty state)
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      currentCategory = 'all';
      currentQuery = '';
      currentSort = 'featured';
      searchInput.value = '';
      searchClear.classList.remove('visible');
      sortSelect.value = 'featured';
      setActivePill('all');
      renderTemplates();
    });
  }

  // ── Functions ──────────────────────────────────────────────

  function setActivePill(category) {
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.filter === category);
    });
  }

  function renderTemplates() {
    const results = templates.filter({
      category: currentCategory,
      q: currentQuery,
      sort: currentSort,
    });

    // Update count
    if (countNum) countNum.textContent = results.length;

    // Show/hide empty state
    const isEmpty = results.length === 0;
    if (emptyState) emptyState.hidden = !isEmpty;

    // Clear grid
    grid.innerHTML = '';

    if (isEmpty) return;

    // Render cards with staggered animation
    const fragment = document.createDocumentFragment();
    results.forEach((tpl, i) => {
      const card = buildTemplateCard(tpl);
      card.style.animationDelay = `${Math.min(i * 60, 400)}ms`;
      fragment.appendChild(card);
    });
    grid.appendChild(fragment);
  }
});
