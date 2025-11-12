#!/usr/bin/env node
/**
 * scripts/deploy-sftp.js
 *
 * Uploads a local directory to a remote SFTP server (Hostinger) using env vars.
 * Usage (example):
 *   SFTP_HOST=hostinger.host SFTP_USER=u12345 SFTP_PORT=22 SFTP_PRIVATE_KEY="$HOME/.ssh/id_ed25519" \
 *   LOCAL_PATH=./hostinger_upload REMOTE_PATH=/home/u12345/public_html node ./scripts/deploy-sftp.js
 *
 * Environment variables:
 * - SFTP_HOST (required)
 * - SFTP_USER (required)
 * - SFTP_PORT (optional, default 22)
 * - SFTP_PASSWORD (optional) - use when not using private key
 * - SFTP_PRIVATE_KEY (optional) - path to private key file
 * - SFTP_PASSPHRASE (optional) - passphrase for private key
 * - LOCAL_PATH (optional, default ./hostinger_upload)
 * - REMOTE_PATH (optional, default /public_html)
 * - KEEP_REMOTE (optional) - if set to 'false' will attempt to remove existing remote files before upload (use with caution)
 *
 * Note: Add `ssh2-sftp-client` to your dependencies: npm install --save ssh2-sftp-client
 */

const fs = require('fs');
const path = require('path');
const SftpClient = require('ssh2-sftp-client');

async function main() {
  const host = process.env.SFTP_HOST;
  const user = process.env.SFTP_USER;
  const port = process.env.SFTP_PORT ? parseInt(process.env.SFTP_PORT, 10) : 22;
  const password = process.env.SFTP_PASSWORD;
  const privateKeyPath = process.env.SFTP_PRIVATE_KEY;
  const passphrase = process.env.SFTP_PASSPHRASE;
  const localPath = process.env.LOCAL_PATH || path.resolve(process.cwd(), 'hostinger_upload');
  const remotePath = process.env.REMOTE_PATH || '/public_html';
  const keepRemote = (process.env.KEEP_REMOTE || 'true').toLowerCase() === 'true';

  if (!host || !user) {
    console.error('Missing required environment variables: SFTP_HOST and SFTP_USER');
    process.exit(2);
  }

  if (!fs.existsSync(localPath)) {
    console.error(`Local path does not exist: ${localPath}`);
    process.exit(3);
  }

  const sftp = new SftpClient();
  const connectConfig = {
    host,
    port,
    username: user,
    readyTimeout: 20000,
  };

  if (privateKeyPath && fs.existsSync(privateKeyPath)) {
    connectConfig.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    if (passphrase) connectConfig.passphrase = passphrase;
  } else if (password) {
    connectConfig.password = password;
  } else {
    console.warn('No private key or password provided; attempting agent or interactive auth.');
  }

  console.log(`Connecting to ${user}@${host}:${port} ...`);

  try {
    await sftp.connect(connectConfig);
    console.log('Connected.');

    // Ensure remote directory exists (recursively create)
    async function ensureRemoteDir(dir) {
      const segments = dir.split('/').filter(Boolean);
      let cur = '';
      for (const seg of segments) {
        cur += '/' + seg;
        try {
          const stat = await sftp.exists(cur);
          if (!stat) {
            console.log(`Creating remote directory: ${cur}`);
            await sftp.mkdir(cur);
          }
        } catch (err) {
          // mkdir may fail if folder exists due to race; ignore and continue
          // but log unexpected errors
          if (err.code && err.code === 4) {
            // ignore
          } else {
            console.warn('ensureRemoteDir warning:', err.message || err);
          }
        }
      }
    }

    await ensureRemoteDir(remotePath);

    if (!keepRemote) {
      console.log('Removing existing remote files (KEEP_REMOTE=false). This is destructive.');
      try {
        await sftp.rmdir(remotePath, true);
        await ensureRemoteDir(remotePath);
      } catch (err) {
        console.warn('Removing remote files failed (maybe remotes do not allow rmdir):', err.message || err);
      }
    }

    console.log(`Uploading local contents of ${localPath} to ${remotePath} ...`);
    // ssh2-sftp-client supports uploadDir(localDir, remoteDir)
    await sftp.uploadDir(localPath, remotePath);

    console.log('Upload complete.');
    await sftp.end();
    process.exit(0);
  } catch (err) {
    console.error('SFTP deploy failed:', err.message || err);
    try { await sftp.end(); } catch (e) {}
    process.exit(4);
  }
}

main();
