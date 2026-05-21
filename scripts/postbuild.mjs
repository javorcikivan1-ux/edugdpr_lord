import { cp, mkdir, writeFile } from 'node:fs/promises';
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
  await writeFile(vercelServerEntry, `import './entry.mjs';
import { renderPage } from 'vike/server';

export default async function handler(req, res) {
  const pageContext = await renderPage({ urlOriginal: req.url });
  const httpResponse = pageContext.httpResponse;

  if (!httpResponse) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const { body, statusCode, headers } = httpResponse;
  headers.forEach(([name, value]) => res.setHeader(name, value));
  res.statusCode = statusCode;
  res.end(body);
}
`);
}
