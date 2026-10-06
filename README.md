# LTV:CAC Intelligence Platform — D1 Training

A portfolio-wide unit economics dashboard for tracking LTV:CAC ratios across D1 Training locations and consulting clients.

## Local Development

```bash
cd ltv-cac-platform
npm install
npm run dev
```

Visit http://localhost:5173

## Build

```bash
npm run build
```

Output goes to `dist/`. Preview the production build:

```bash
npm run preview
```

## Deploy to Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select the repo — Railway auto-detects the Dockerfile
4. Set the port to `3000` if not auto-detected
5. Deploy

The app is fully client-side — no environment variables or database required.

## Features

- **Dashboard** — KPI cards, ratio bar chart, leaderboard table, portfolio group summaries
- **Business management** — Add/edit/remove businesses with full unit economics inputs
- **File import** — Drop QBO P&L exports, GHL pipeline exports, or generic CSVs to auto-populate fields
- **PDF export** — Landscape A4 report with full leaderboard table
- **How It Works** — Built-in SOP explaining every formula and data source
- **localStorage persistence** — Data survives page refreshes

## Stack

- React 18 + Vite
- Recharts (bar charts)
- PapaParse (CSV parsing)
- xlsx (Excel parsing)
- jsPDF + jspdf-autotable (PDF export)

## Hosting

Hosted on Railway. The public URL is unknown — confirm it with Austin.

## Environment variables

Names only. Do not record values in this file or in git.

The app does not read custom secrets. The production server uses:

- `PORT`

Local development does not require a `.env` file.
