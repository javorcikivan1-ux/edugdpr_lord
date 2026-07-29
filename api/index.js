import '../dist/server/entry.mjs'
import { renderPage } from 'vike/server'

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
  'X-Frame-Options': 'SAMEORIGIN',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: blob: https://www.edugdpr.sk https://edugdpr.sk https://images.unsplash.com https://i.ibb.co https://lordsbenison.sk https://www.lordsbenison.sk https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://cdn.jsdelivr.net",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

const publicRoutes = new Set([
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
])

const dynamicRoutePatterns = [
  /^\/blog\/[^/]+$/,
  /^\/marketplace\/[^/]+$/,
  /^\/zamestnanci\/[^/]+$/,
  /^\/zamestnaci\/[^/]+$/
]

const forbiddenPathPattern = /(^|\/)(?:\.env(?:[./]|$)|\.git(?:\/|$)|\.svn(?:\/|$)|\.hg(?:\/|$)|node_modules(?:\/|$)|package-lock\.json$|package\.json$|tsconfig\.json$|vite\.config\.ts$)/i

const setSecurityHeaders = (res) => {
  Object.entries(securityHeaders).forEach(([name, value]) => {
    res.setHeader(name, value)
  })
}

const isKnownRoute = (pathname) =>
  publicRoutes.has(pathname) || dynamicRoutePatterns.some((pattern) => pattern.test(pathname))

const sendPlain = (res, statusCode, message) => {
  setSecurityHeaders(res)
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end(message)
}

export default async function handler(req, res) {
  setSecurityHeaders(res)

  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url, `https://${req.headers.host || 'www.edugdpr.sk'}`).pathname)
    pathname = pathname.replace(/\/+$/, '') || '/'
  } catch {
    sendPlain(res, 400, 'Bad request')
    return
  }

  if (forbiddenPathPattern.test(pathname)) {
    sendPlain(res, 403, 'Forbidden')
    return
  }

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    sendPlain(res, 404, 'Not found')
    return
  }

  if (!isKnownRoute(pathname)) {
    sendPlain(res, 404, 'Not found')
    return
  }

  const pageContextInit = {
    urlOriginal: req.url
  }
  
  let pageContext
  try {
    pageContext = await renderPage(pageContextInit)
  } catch (error) {
    console.error('SSR render error:', error)
    sendPlain(res, 500, 'Internal server error')
    return
  }

  const httpResponse = pageContext.httpResponse
  
  if (!httpResponse) {
    sendPlain(res, 404, 'Not found')
    return
  }
  
  const { body, statusCode, headers } = httpResponse
  headers.forEach(([name, value]) => {
    res.setHeader(name, value)
  })
  res.statusCode = statusCode
  res.end(body)
}
