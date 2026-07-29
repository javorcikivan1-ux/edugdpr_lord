export const appRoutes = new Set([
  '/',
  '/kontakt',
  '/gdpr',
  '/vop',
  '/aml',
  '/blog',
  '/trainings-info',
  '/skolenia',
  '/reset-password',
  '/dashboard',
  '/marketplace',
  '/zamestnanci',
  '/dokumenty',
  '/certifikaty',
  '/portal',
  '/oboznamovanie',
  '/moje-dokumenty',
  '/e-learning',
  '/nastavenia',
  '/profil',
  '/historia',
  '/admin/editor-skoleni',
  '/admin/dopyty-nakup',
  '/admin/klienti'
]);

export const dynamicRoutePatterns = [
  /^\/blog\/[^/]+$/,
  /^\/marketplace\/[^/]+$/,
  /^\/zamestnanci\/[^/]+$/,
  /^\/zamestnaci\/[^/]+$/
];

export const forbiddenPathPattern = /(^|\/)(?:\.env(?:[./]|$)|\.git(?:\/|$)|\.svn(?:\/|$)|\.hg(?:\/|$)|node_modules(?:\/|$)|package-lock\.json$|package\.json$|tsconfig\.json$|vite\.config\.ts$)/i;

export const normalizePathname = (pathname: string) => {
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return pathname;
  }

  return pathname.replace(/\/+$/, '') || '/';
};

export const isKnownAppRoute = (pathname: string) =>
  appRoutes.has(pathname) || dynamicRoutePatterns.some((pattern) => pattern.test(pathname));
