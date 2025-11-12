## Deploy to Hostinger via SSH/SFTP (PowerShell + CI)

This document shows the full SSH/SFTP deployment flow for Tickets Villa (local + CI). It contains PowerShell-friendly commands, a checklist, sample env vars, and notes about GitHub Actions.

---

## Prerequisites

- Node and npm installed locally.
- `npm install` run at least once (to install `ssh2-sftp-client` used by `scripts/deploy-sftp.js`).
- OpenSSH client available on your machine (for `ssh`/`scp`) or use SFTP script.
- Hostinger (hPanel) account with SFTP/SSH access and the remote path to `public_html`.
- A deploy SSH key (recommended) or SFTP password.

---

## Quick checklist

- [ ] Generate an SSH keypair locally (ed25519 recommended)
- [ ] Add public key to Hostinger (SSH Keys / SFTP)
- [ ] Build site locally (`npm run build`)
- [ ] Prepare upload folder (`hostinger_upload` or use `scripts/deploy-to-hostinger.js`)
- [ ] Upload via local script or run CI (GitHub Actions)
- [ ] Verify site and server-side `api/genai.php` behavior

---

## 1) Generate an SSH keypair (local)

PowerShell (ed25519, recommended):

```powershell
# Generate key (enter passphrase when prompted or use -N "" for no passphrase)
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\tickets_villa_deploy -C "tickets-villa-deploy"

# Copy public key to clipboard (Windows)
Get-Content $env:USERPROFILE\.ssh\tickets_villa_deploy.pub | Set-Clipboard
```

Files created:
- Private key: `%USERPROFILE%\\.ssh\\tickets_villa_deploy`
- Public key: `%USERPROFILE%\\.ssh\\tickets_villa_deploy.pub`

If you prefer RSA or another type, adapt `-t rsa -b 4096`.

---

## 2) Add the public key to Hostinger (hPanel)

1. Log into Hostinger → Manage Website → Advanced → SSH Access (or SSH Keys).
2. Add new key: paste the contents of `tickets_villa_deploy.pub`.
3. Link or authorize the key for the appropriate FTP/SFTP user if required by Hostinger.

Note: Confirm the SFTP username (typically `u<digits>`) and the remote upload path (usually `/home/uXXXXX/public_html`).

---

## 3) Prepare the site build artifacts (local)

You can use the repo helper or do the steps manually.

PowerShell (recommended):

```powershell
# Install deps (if needed)
npm install

# Build the production bundle
npm run build

# Create an upload folder (hostinger_upload) from dist
Remove-Item -Recurse -Force hostinger_upload -ErrorAction SilentlyContinue
New-Item -ItemType Directory hostinger_upload
robocopy .\dist .\hostinger_upload /E
```

Alternative: use `npm run build:hostinger` which runs the build and the repo `scripts/deploy-to-hostinger.js` (this script copies `dist/*` into the repo root). You may still prefer `hostinger_upload` for SFTP.

---

## 4) Local upload via PowerShell `scp` (if using scp)

This project includes `scripts/deploy-ssh.ps1` (PowerShell scp wrapper). Example usage:

```powershell
# Example: run the script (replace with your host/user remote path)
.\scripts\deploy-ssh.ps1 -Host "185.xx.xx.xx" -User "u123456789" -KeyPath "$env:USERPROFILE\.ssh\tickets_villa_deploy" -LocalPath ".\hostinger_upload" -RemotePath "/home/u123456789/public_html" -Port 22
```

Notes:
- Use the full remote path provided by Hostinger.
- If your key has a passphrase, the script will prompt for it.

---

## 5) Local upload via Node SFTP script (recommended)

The repository contains a Node SFTP script: `scripts/deploy-sftp.js`. It uses env vars so it's safe to call locally and in CI.

Set environment variables and run the script (PowerShell example):

```powershell
$env:SFTP_HOST = '185.xx.xx.XX'
$env:SFTP_USER = 'u123456789'
$env:SFTP_PORT = '22'
$env:SFTP_PRIVATE_KEY = "$env:USERPROFILE\.ssh\tickets_villa_deploy"  # path to private key
$env:LOCAL_PATH = '.\hostinger_upload'
$env:REMOTE_PATH = '/home/u123456789/public_html'
node .\scripts\deploy-sftp.js
```

If you prefer one npm command, use the convenience script added to `package.json`:

```powershell
# Builds and deploys via the Node SFTP script
npm run deploy:local-sftp
```

(Ensure env vars set in the same shell before running the command.)

---

## 6) CI / GitHub Actions

A GitHub Actions workflow is included: `.github/workflows/deploy-sftp.yml`. It runs on push to `main` and will:

- checkout code
- install dependencies (`npm ci`)
- run `npm run build`
- prepare `hostinger_upload` from `dist`
- write the private key from the `SFTP_PRIVATE_KEY` secret into `./deploy_key`
- run `node ./scripts/deploy-sftp.js` with secrets passed as env vars
- cleanup `deploy_key`

Required repository secrets (GitHub → Settings → Secrets → Actions):

- `SFTP_HOST` — Hostname or IP of Hostinger SFTP/SSH
- `SFTP_USER` — SFTP username (e.g., `u123456789`)
- `SFTP_REMOTE_PATH` — Remote path (e.g., `/home/u123456789/public_html`)
- `SFTP_PRIVATE_KEY` — PEM private key contents (the raw key text)

Optional secrets:
- `SFTP_PASSPHRASE` — passphrase for private key (if used)
- `SFTP_PORT` — default 22

If you prefer manual control, modify `.github/workflows/deploy-sftp.yml` to target `workflow_dispatch` or tag releases only.

---

## 7) Post-deploy verification

- Visit your domain: confirm `index.html` loads and assets are served.
- Test dynamic routes and confirm `.htaccess` rewrite works (SPA routes should serve `index.html`).
- Test server-side GenAI: call a flow that uses `/api/genai.php` and confirm responses.
- If any server-side issues, check Hostinger PHP error logs (hPanel → Logs → Error Logs).

---

## Troubleshooting

- Permission errors: ensure remote directories have correct permissions (755 for dirs, 644 for files).
- 500 errors for API: verify `api/config.php` exists and contains valid keys; ensure PHP version is compatible.
- SFTP auth issues: verify the public key was added to Hostinger and bound to the correct SFTP user. Test `ssh -i` from your machine.

---

## Security notes

- Never commit private keys to the repository.
- Use a dedicated deploy key with restricted access and rotate it periodically.
- Prefer CI secrets for automated deploys and limit who can push to `main`.

---

If you want, I can:
- Commit this file to the repo for you now.
- Change the GitHub Actions workflow to require `workflow_dispatch` (manual) instead of auto-run on every push.
- Add a small health-check script that runs after deploy to verify a few endpoints.

Tell me which follow-up you prefer and I'll proceed.
