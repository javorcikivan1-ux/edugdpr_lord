import { renderToString } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { AuthProvider } from '../features/AuthService'
import { TrainingProvider } from '../features/TrainingStore'
import { ToastProvider } from '../lib/ToastContext'

import App from '../index'

export function render(pageContext: any) {
  const urlPathname = pageContext?.urlPathname || '/'
  const canonicalUrl = `https://www.edugdpr.sk${urlPathname === '/' ? '' : urlPathname}`
  const pageMetaMap: Record<string, { title: string; description: string; ogTitle?: string }> = {
    '/': {
      title: 'GDPR služby pre firmy a živnostníkov | VOP a AML',
      description: 'Zistite, či sa vás GDPR týka. Vypracujeme GDPR dokumentáciu, obchodné podmienky (VOP) aj AML riešenia na mieru pre firmy a živnostníkov.'
    },
    '/trainings-info': {
      title: 'GDPR školenia pre firmy | Online kurzy a certifikáty | Complyo',
      description: 'Komplexné GDPR školenia pre firmy a zamestnancov. Online kurzy, certifikáty, praktické návody na spracovanie osobných údajov.'
    },
    '/gdpr': {
      title: 'GDPR dokumentácia na mieru pre firmy a živnostníkov | Ochrana osobných údajov',
      description: 'Potrebujete GDPR dokumentáciu? Zistite, koho sa GDPR týka a zabezpečte ochranu osobných údajov vo firme alebo e-shope. Riešenie na mieru bez zbytočných rizík.',
      ogTitle: 'GDPR dokumentácia na mieru pre firmy a živnostníkov'
    },
    '/vop': {
      title: 'VOP a obchodné podmienky | Complyo',
      description: 'Obchodné podmienky (VOP) pre e‑shop a služby. Zrozumiteľne, profesionálne a v súlade s legislatívou.'
    },
    '/aml': {
      title: 'AML dokumentácia | Complyo',
      description: 'AML dokumentácia a program vlastnej činnosti podľa zákona. Pomôžeme vám nastaviť AML povinnosti v praxi.'
    },
    '/kontakt': {
      title: 'Kontakt | GDPR služby a poradenstvo | Complyo',
      description: 'Kontaktujte nás pre GDPR poradenstvo, dokumentáciu alebo školenia. Rýchla a profesionálna pomoc pre firmy a živnostníkov.'
    }
  }
  const meta = pageMetaMap[urlPathname] || pageMetaMap['/']
  const html = renderToString(
    <AuthProvider>
      <ToastProvider>
        <TrainingProvider>
          <App />
        </TrainingProvider>
      </ToastProvider>
    </AuthProvider>
  )

  return {
    documentHtml: escapeInject`<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}">
    
    <meta property="og:locale" content="sk_SK">
    <meta property="og:site_name" content="LORD'S BENISON">
    <meta property="og:title" content="${meta.ogTitle || meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://www.edugdpr.sk/og-image.jpg">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="GDPR služby pre firmy a živnostníkov">
    <meta name="twitter:description" content="${meta.description}">
    <meta name="twitter:image" content="https://www.edugdpr.sk/og-image.jpg">
    
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="icon" type="image/png" href="/favicon.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">

    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Minimal reset to avoid FOUC before hydration */
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      * { box-sizing: border-box; }
    </style>
    
    
</head>
<body>
    <div id="root">${dangerouslySkipEscape(html)}</div>
    
    <!-- Heavy JS libraries moved to end of body for better performance -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tsparticles@2.12.0/tsparticles.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12"></script>
    <script>
      gsap.registerPlugin(ScrollTrigger);
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              brand: {
                blue: '#004E89',
                orange: '#F7941D',
                gold: '#FFC700',
              },
              corporate: {
                blue: '#1e40af',
                darkblue: '#1e3a8a',
                gray: '#374151',
                lightgray: '#f3f4f6',
                border: '#e5e7eb',
                success: '#059669',
                warning: '#d97706',
                error: '#dc2626'
              },
              neutral: {
                50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4',
                400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040',
                800: '#262626', 900: '#171717', 950: '#0a0a0a'
              }
            },
            fontFamily: {
              sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
              display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            animation: {
              'fade-in': 'fade-in 0.5s ease-out',
              'slide-up': 'slide-up 0.4s ease-out',
              'slide-down': 'slide-down 0.4s ease-out',
            },
            keyframes: {
              'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
              'slide-up': { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
              'slide-down': { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } }
            }
          }
        }
      }
    </script>
</body>
</html>`
  }
}
