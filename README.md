# EasyFolio MH - Personal Portfolio Website

A modern, responsive portfolio website built with Vite and modern web technologies.

## Features

- Modern and responsive design
- Dark/Light mode support
- Optimized asset loading
- SCSS support
- Portfolio showcase
- Contact form integration

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/MustaqueH/mh-folio.git
cd mh-folio
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## GitHub Pages (project site)

**Live site (after first successful deploy):** [https://mustaqueh.github.io/mh-folio/](https://mustaqueh.github.io/mh-folio/)  
(Account [MustaqueH](https://github.com/MustaqueH); repo name **`mh-folio`**.)

`vite.config.js` uses `base: './'` so asset URLs stay **relative** and work under that path without hard-coding the repo name.

### Deploy checklist (first time)

Follow these in order (details match repo **`MustaqueH/mh-folio`**):

1. **Create the repo on GitHub**  
   - Go to [github.com/new](https://github.com/new).  
   - **Owner:** MustaqueH.  
   - **Repository name:** `mh-folio`.  
   - **Public** (required for free GitHub Pages on a personal account, unless you use GitHub Pro / org rules you already know).  
   - Leave **Add a README** unchecked (you already have files locally).  
   - Click **Create repository**.

2. **Push your project from your PC** (in your project folder, e.g. `EasyFolio MH`):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/MustaqueH/mh-folio.git
   git push -u origin main
   ```

   If `git init` was already done, skip it; if `origin` exists, use `git remote set-url origin https://github.com/MustaqueH/mh-folio.git` instead of `add`.

3. **Turn on GitHub Pages (Actions)**  
   - Open the repo: `https://github.com/MustaqueH/mh-folio`.  
   - **Settings** → **Pages** (left sidebar).  
   - Under **Build and deployment**, **Source** → select **GitHub Actions** (not “Deploy from a branch”).

4. **Approve the first deployment (if asked)**  
   - Open **Actions** tab → select **Deploy to GitHub Pages**.  
   - If GitHub shows “Workflow run was not found” on first push, wait a minute and refresh; the workflow file is `.github/workflows/deploy-pages.yml`.  
   - The first run may ask you to **approve** deployment to the `github-pages` environment — approve it.

5. **Confirm the site**  
   - When the workflow is green, your site is at **https://mustaqueh.github.io/mh-folio/**  
   - The exact URL also appears in the workflow run summary and under **Settings → Pages**.

**After that:** every `git push` to **`main`** rebuilds and updates the site automatically.

### Optional: deploy from your PC

If you prefer pushing to a `gh-pages` branch instead of Actions, you can still run `npm run build` then `npm run deploy` (requires `gh-pages` and Pages source set to that branch).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Publish `dist/` to `gh-pages` branch (optional; prefer GitHub Actions above)
- `npm run format` - Format code with Prettier
- `npm run lint:js` - Lint JavaScript files
- `npm run lint:css` - Lint CSS files
- `npm run lint:scss` - Lint SCSS files
- `npm run clean` - Clean build directory

## Project Structure

```
src/
├── assets/
│   ├── css/
│   ├── img/
│   ├── js/
│   ├── scss/
│   └── vendor/
├── forms/
└── index.html
```

## Technologies Used

- Vite
- SCSS
- ESLint
- Prettier
- StyleLint

## License

[Your License]

## Author

Mustaque Halder 