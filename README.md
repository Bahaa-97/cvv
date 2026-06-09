# CVFlow CV Builder

CVFlow is a static web app for creating and customizing resumes using ready-made templates, live preview, and PDF export.

## Features

- Browse and select multiple resume templates.
- Edit resume data with instant preview in the editor.
- Support for Arabic/English with RTL/LTR switching.
- Theme and language preferences saved in `localStorage`.
- Export resume to PDF from the editor.

## Tech Stack

- HTML, CSS, Vanilla JavaScript
- Vitest + jsdom for tests
- GitHub Actions for CI

## Project Structure

- `index.html`: Landing page
- `templates.html`: Template browser page
- `editor.html`: Resume editor and preview page
- `js/`: Frontend app logic
- `css/`: Shared and page-level styles
- `templates/`: Individual resume templates
- `data/templates.json`: Templates data source
- `tests/`: Unit and behavior tests
- `.github/workflows/ci.yml`: CI pipeline

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run tests

```bash
npm test
```

### 3) Start locally

This is a static project. You can run it with any local static server.

Option A (Node):

```bash
npx serve .
```

Then open the shown local URL in your browser.

Option B (VS Code / Cursor extension):

- Use any "Live Server" extension and run from project root.

## NPM Scripts

- `npm test`: Run test suite once.
- `npm run test:watch`: Run tests in watch mode.

## Testing Scope (Current)

- Templates registry loading and filtering.
- Language persistence (`rf_lang`) and RTL/LTR application.
- Theme persistence (`rf_theme`) and document theme updates.

## CI

On every push and pull request, GitHub Actions runs:

1. `npm ci`
2. `npm test`

## Known Limitations

- No backend/API integration yet (frontend-only project).
- Some pages/sections may still need content expansion.
- Running pages directly with `file://` can block JSON loading; use a local static server.

