/**
 * ResumeForge — Theme Manager
 * Handles dark/light mode toggle with LocalStorage persistence.
 * Also handles navbar scroll behavior and hamburger menu.
 */

(function ThemeModule() {
  'use strict';

  const STORAGE_KEY = 'rf_theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  // ── Helpers ──────────────────────────────────────────────
  function getPreferred() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update icon
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = theme === DARK
        ? 'fa-solid fa-sun'
        : 'fa-solid fa-moon';
    }

    // Update toggle button aria-label
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || LIGHT;
    applyTheme(current === DARK ? LIGHT : DARK);
  }

  // ── Navbar scroll behavior ────────────────────────────────
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScroll = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run immediately
  }

  // ── Hamburger / Mobile Menu ───────────────────────────────
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      mobileMenu.classList.toggle('open', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    // Apply theme before paint to prevent flash
    applyTheme(getPreferred());

    // Wait for DOM
    document.addEventListener('DOMContentLoaded', () => {
      const toggleBtn = document.getElementById('themeToggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
      }

      initNavbar();
      initMobileMenu();

      // Listen for OS-level changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? DARK : LIGHT);
        }
      });
    });
  }

  init();

  // Expose to global
  window.ResumeForge = window.ResumeForge || {};
  window.ResumeForge.theme = { toggle: toggleTheme, apply: applyTheme, get: getPreferred };

})();
