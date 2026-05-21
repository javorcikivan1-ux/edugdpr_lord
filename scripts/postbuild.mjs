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

export default async function handler(request) {
  const url = new URL(request.url);
  const pageContext = await renderPage({ urlOriginal: url.pathname + url.search });
  const httpResponse = pageContext.httpResponse;

  if (!httpResponse) {
    return new Response('Not found', { status: 404 });
  }

  const { body, statusCode, headers } = httpResponse;
  return new Response(body, {
    status: statusCode,
    headers: new Headers(headers)
  });
}
`);
}
