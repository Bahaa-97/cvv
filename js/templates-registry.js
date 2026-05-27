/**
 * ResumeForge — Templates Registry
 * Loads templates.json and provides a registry API.
 * All pages use this as the single source of truth for templates.
 *
 * Usage:
 *   await window.ResumeForge.templates.load();
 *   const all = window.ResumeForge.templates.getAll();
 *   const featured = window.ResumeForge.templates.getFeatured();
 *   const tpl = window.ResumeForge.templates.getById('modern-pro');
 *   const filtered = window.ResumeForge.templates.filter({ category: 'modern', q: 'clean' });
 */

(function TemplatesRegistryModule() {
  'use strict';

  const TEMPLATE_SOURCE = 'data/templates.json';
  const REQUIRED_FIELDS = ['id', 'name', 'preview', 'path'];

  let _templates = [];
  let _loaded = false;

  function validateTemplate(template, index) {
    for (const field of REQUIRED_FIELDS) {
      if (!template || typeof template[field] !== 'string' || !template[field].trim()) {
        throw new Error(`[TemplatesRegistry] Invalid template at index ${index}: missing "${field}".`);
      }
    }
  }

  /**
   * Load templates from JSON file.
   * Cached after first load.
   * @returns {Promise<Object[]>}
   */
  async function load() {
    if (_loaded) return _templates;

    const res = await fetch(TEMPLATE_SOURCE, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(
        `[TemplatesRegistry] Failed to load ${TEMPLATE_SOURCE} (${res.status} ${res.statusText}). ` +
        'Run the project through a local server instead of opening HTML directly via file://.'
      );
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error(`[TemplatesRegistry] ${TEMPLATE_SOURCE} must contain an array.`);
    }

    data.forEach((template, index) => validateTemplate(template, index));
    _templates = data;
    _loaded = true;
    return _templates;
  }

  /**
   * Get all templates.
   * @returns {Object[]}
   */
  function getAll() {
    return [..._templates];
  }

  /**
   * Get featured templates.
   * @param {number} [limit=6]
   * @returns {Object[]}
   */
  function getFeatured(limit = 6) {
    return _templates
      .filter(t => t.featured)
      .slice(0, limit);
  }

  /**
   * Get a single template by ID.
   * @param {string} id
   * @returns {Object|null}
   */
  function getById(id) {
    return _templates.find(t => t.id === id) || null;
  }

  /**
   * Filter templates by category and/or search query.
   * @param {Object} opts
   * @param {string} [opts.category='all']
   * @param {string} [opts.q='']
   * @param {string} [opts.sort='featured']
   * @returns {Object[]}
   */
  function filter({ category = 'all', q = '', sort = 'featured' } = {}) {
    let result = [..._templates];

    // Category filter
    if (category && category !== 'all') {
      result = result.filter(t => t.category === category);
    }

    // Search filter (name, description, tags)
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        (t.nameAr && t.nameAr.includes(query)) ||
        t.description.toLowerCase().includes(query) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Sort
    switch (sort) {
      case 'downloads':
        result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case 'ats':
        result.sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }

  /**
   * Get all unique categories.
   * @returns {string[]}
   */
  function getCategories() {
    return [...new Set(_templates.map(t => t.category))];
  }

  // ── Expose API ────────────────────────────────────────────
  window.ResumeForge = window.ResumeForge || {};
  window.ResumeForge.templates = {
    load,
    getAll,
    getFeatured,
    getById,
    filter,
    getCategories,
  };

})();
