import { promises as fs } from 'fs';
import path from 'path';

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  const repoRoot = process.cwd();
  const distDir = path.join(repoRoot, 'dist');
  try {
    // Check dist exists
    await fs.access(distDir);
  } catch (err) {
    console.error('dist folder not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Copy every file from dist root into repo root (overwrites index.html and assets/)
  try {
    const entries = await fs.readdir(distDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(distDir, entry.name);
      const destPath = path.join(repoRoot, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else if (entry.isFile()) {
        await fs.copyFile(srcPath, destPath);
      }
    }
    console.log('Dist contents copied to project root. Ready to upload to Hostinger public_html.');
  } catch (err) {
    console.error('Error copying dist contents:', err);
    process.exit(1);
  }
}

main();
