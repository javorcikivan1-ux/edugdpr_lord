import { render } from 'vike/abort';
import { forbiddenPathPattern, isKnownAppRoute, normalizePathname } from '../lib/routes';

export function onBeforeRender(pageContext: { urlPathname?: string }) {
  const pathname = normalizePathname(pageContext.urlPathname || '/');

  if (forbiddenPathPattern.test(pathname)) {
    throw render(403, 'Forbidden');
  }

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    throw render(404, 'Not found');
  }

  if (!isKnownAppRoute(pathname)) {
    throw render(404, 'Not found');
  }

  return {};
}
