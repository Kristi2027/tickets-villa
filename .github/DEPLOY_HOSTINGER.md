Hostinger deployment helper
==========================

This document describes the small helper script `npm run build:hostinger` which builds the Vite app and copies the `dist/` output into the repository root so you can upload the files to Hostinger's `public_html/` (or equivalent).

How it works
- `npm run build` generates `dist/` with `index.html` and `assets/`.
- `scripts/deploy-to-hostinger.js` copies the contents of `dist/` into the project root (overwriting `index.html` and adding `assets/`).

Usage (Windows PowerShell)
```powershell
cd 'D:\tickets-villa (1)'
npm install
npm run build:hostinger
```

After this completes, upload the repository root files to Hostinger `public_html/` (do NOT upload your `.git` folder). Ensure `api/` files (PHP proxy) are present and `api/config.php` is configured on the server (or set env vars in the Hostinger control panel).

Security
- Do NOT commit real API keys. Use `api/config.php.example` as reference and set the real `GOOGLE_API_KEY` via `api/config.php` on the server or environment variables.
