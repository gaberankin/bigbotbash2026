# React + TypeScript + Tailwind + GitHub Pages Template

This project is a starter template for client-side React apps that are deployed to GitHub Pages.

## Included setup

- Vite + React + TypeScript
- Tailwind CSS v4 integration
- GitHub Actions workflow for GitHub Pages deployment
- Pages base path support through `VITE_BASE_PATH`

## Requirements

- Node.js `>= 22.12.0` (or `>= 20.19.0`)
- npm

## Local development

```bash
npm install
npm run dev
```

## Build locally

Standard build:

```bash
npm run build
```

Build exactly as GitHub Pages (replace `my-repo-name`):

```bash
VITE_BASE_PATH=/my-repo-name/ npm run build
```

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. In GitHub, open **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`.

The workflow in `.github/workflows/deploy.yml` builds and publishes automatically.

## Using this as a template

For each new app:

1. Create a new repository from this folder/template.
2. Update `package.json` `name`.
3. Replace `src/App.tsx` with your app pages/components.
4. Commit and push to `main` to deploy.
