import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadScript(relativePath) {
  const scriptPath = resolve(process.cwd(), relativePath);
  const code = readFileSync(scriptPath, 'utf8');
  window.eval(code);
}

describe('language module', () => {
  it('persists selected language in localStorage', () => {
    window.ResumeForge = { translations: { en: {}, ar: {} } };
    loadScript('js/language.js');

    window.ResumeForge.lang.set('ar');

    expect(localStorage.getItem('rf_lang')).toBe('ar');
    expect(window.ResumeForge.lang.get()).toBe('ar');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });
});

describe('theme module', () => {
  it('applies and persists chosen theme', () => {
    window.ResumeForge = {};
    loadScript('js/theme.js');

    window.ResumeForge.theme.apply('dark');

    expect(localStorage.getItem('rf_theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.ResumeForge.theme.get()).toBe('dark');
  });
});
