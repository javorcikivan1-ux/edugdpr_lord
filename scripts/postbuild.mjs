import { cp, copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const clientDir = path.join(root, 'dist', 'client');
const publicDir = path.join(root, 'public');
const serverEntry = path.join(root, 'dist', 'server', 'entry.mjs');
const vercelServerEntry = path.join(root, 'dist', 'server', 'index.js');

if (existsSync(clientDir)) {
  await mkdir(publicDir, { recursive: true });
  await cp(clientDir, publicDir, { recursive: true, force: true });
}

if (existsSync(serverEntry)) {
  await copyFile(serverEntry, vercelServerEntry);
}
