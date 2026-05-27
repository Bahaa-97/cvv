/**
 * ResumeForge — Language Manager
 * Handles bilingual (EN/AR) support, RTL direction, and UI translation.
 */

(function LanguageModule() {
  'use strict';

  const STORAGE_KEY = 'rf_lang';
  const DEFAULT_LANG = 'en';

  function getLanguage() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLanguage(lang);
  }

  function toggleLanguage() {
    const current = getLanguage();
    setLanguage(current === 'en' ? 'ar' : 'en');
  }

  function applyLanguage(lang) {
    const isAr = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    // Update lang toggle buttons
    document.querySelectorAll('.lang-toggle-text').forEach(el => {
      el.textContent = isAr ? 'English' : 'عربي';
    });

    // Translate statically tagged elements
    const elements = document.querySelectorAll('[data-i18n]');
    const dict = window.ResumeForge.translations[lang] || window.ResumeForge.translations['en'];
    
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        // If it's a placeholder
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.hasAttribute('placeholder')) {
            el.setAttribute('placeholder', dict[key]);
          }
        } else {
          // Keep internal HTML like icons intact by looking for specific spans or replacing text content
          // If we want to keep icons, we shouldn't wipe innerHTML directly unless it's just text.
          // For simplicity, if it has children like icons, we expect a span with data-i18n
          el.textContent = dict[key];
        }
      }
    });

    // Fire an event so dynamic components can re-render
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  function init() {
    applyLanguage(getLanguage());
    
    document.addEventListener('DOMContentLoaded', () => {
      // Find language toggle buttons
      document.querySelectorAll('#langToggle').forEach(btn => {
        btn.addEventListener('click', toggleLanguage);
      });
      
      // Re-apply in case DOM was not ready for some elements
      applyLanguage(getLanguage());
    });
  }

  init();

  window.ResumeForge = window.ResumeForge || {};
  window.ResumeForge.lang = { get: getLanguage, set: setLanguage, toggle: toggleLanguage };

})();
