import { beforeEach } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = '';
  window.ResumeForge = {};
});

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}
