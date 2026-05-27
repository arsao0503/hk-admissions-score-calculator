# Deployment

This project is ready for GitHub Pages without a build step.

## First-Time GitHub Setup

Install GitHub CLI if needed:

```bash
brew install gh
gh auth login
```

Create and push a public repository:

```bash
cd /Users/maltese53/.openclaw/workspace/projects/hk-admissions-score-integrator
git init
git branch -M main
git add .
git commit -m "Build HK admissions score calculator"
gh repo create hk-admissions-score-calculator --public --source=. --remote=origin --push
```

Enable GitHub Pages from the repository root:

- Settings -> Pages -> Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

The root `index.html` redirects visitors to `app/`.

## Local Checks

```bash
npm run check
npm run serve
```

Open:

```text
http://127.0.0.1:5173
```

## Data Refresh

When source CSVs are updated:

```bash
npm run build:data
git add app/assets/app-data.js data/processed outputs
git commit -m "Refresh admissions score data"
git push
```
