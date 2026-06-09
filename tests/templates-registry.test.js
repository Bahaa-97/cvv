import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadScript(relativePath) {
  const scriptPath = resolve(process.cwd(), relativePath);
  const code = readFileSync(scriptPath, 'utf8');
  window.eval(code);
}

describe('templates registry', () => {
  const templatesFixture = [
    {
      id: 'modern-pro',
      name: 'Modern Pro',
      preview: 'assets/previews/modern-pro.webp',
      path: 'templates/modern-pro/',
      category: 'modern',
      description: 'Modern template',
      featured: true,
      atsScore: 95,
      downloads: 1000,
    },
    {
      id: 'arabic-elegant',
      name: 'Arabic Elegant',
      preview: 'assets/previews/arabic-elegant.webp',
      path: 'templates/arabic-elegant/',
      category: 'arabic',
      description: 'Arabic template',
      featured: true,
      atsScore: 88,
      downloads: 900,
    },
  ];

  beforeEach(async () => {
    window.CVFlow = {};
    global.fetch = async (url) => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => templatesFixture,
      url,
    });
    loadScript('js/templates-registry.js');
    await window.CVFlow.templates.load();
  });

  it('loads templates and exposes a non-empty list', () => {
    const templates = window.CVFlow.templates.getAll();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
  });

  it('filters by category and query', () => {
    const modern = window.CVFlow.templates.filter({ category: 'modern' });
    expect(modern.length).toBeGreaterThan(0);
    expect(modern.every((t) => t.category === 'modern')).toBe(true);

    const searched = window.CVFlow.templates.filter({ q: 'arabic' });
    expect(searched.some((t) => t.id === 'arabic-elegant')).toBe(true);
  });

  it('uses JSON source as single truth', async () => {
    let requestedUrl = '';
    global.fetch = async (url) => {
      requestedUrl = String(url);
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => templatesFixture,
      };
    };

    window.CVFlow = {};
    loadScript('js/templates-registry.js');
    await window.CVFlow.templates.load();
    expect(requestedUrl).toBe('data/templates.json');
  });

  it('throws on malformed templates data', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => [{ id: 'broken' }],
    });

    window.CVFlow = {};
    loadScript('js/templates-registry.js');
    await expect(window.CVFlow.templates.load()).rejects.toThrow('missing "name"');
  });
});
