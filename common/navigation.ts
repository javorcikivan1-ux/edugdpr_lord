// Spoločné konštanty pre navigation
export const COMMON_NAV_LINKS = {
  // Pre landing a info stránky (s href)
  WITH_HREF: (onNavigate: (view: string, path: string) => void, onRegister: () => void, activeView?: string) => [
    { name: 'Školenia', href: '/skolenia', action: () => onNavigate('trainings_info', '/skolenia'), type: 'link', active: activeView === 'trainings_info' },
    { 
      name: 'Služby', 
      href: '#', 
      type: 'dropdown',
      items: [
        { name: 'Obchodné podmienky', action: () => onNavigate('vop', '/vop'), href: '/vop', active: activeView === 'vop' },
        { name: 'Ochrana osobných údajov', action: () => onNavigate('gdpr', '/gdpr'), href: '/gdpr', active: activeView === 'gdpr' },
        { name: 'AML dokumentácia', action: () => onNavigate('aml', '/aml'), href: '/aml', active: activeView === 'aml' }
      ]
    },
    { name: 'Registrácia', href: '/#platforma', type: 'link', action: onRegister },
    { name: 'Cenník', href: '/skolenia#pricing', action: () => onNavigate('trainings_info', '/skolenia#pricing'), type: 'link' },
    { name: 'Kontakt', href: '/kontakt', type: 'link', action: () => onNavigate('contact', '/kontakt'), active: activeView === 'contact' },
  ],

  // Pre stránky bez href (len actions)
  ACTIONS_ONLY: (onNavigate: (view: string, path: string) => void, onRegister: () => void, activeView?: string) => [
    { name: 'Školenia', active: activeView === 'trainings_info', action: () => activeView === 'trainings_info' ? window.scrollTo({top: 0, behavior: 'smooth'}) : onNavigate('trainings_info', '/skolenia') },
    { 
      name: 'Služby', 
      type: 'dropdown',
      items: [
        { name: 'Obchodné podmienky', action: () => onNavigate('vop', '/vop'), active: activeView === 'vop' },
        { name: 'Ochrana osobných údajov', action: () => onNavigate('gdpr', '/gdpr'), active: activeView === 'gdpr' },
        { name: 'AML dokumentácia', action: () => onNavigate('aml', '/aml'), active: activeView === 'aml' }
      ]
    },
    { name: 'Registrácia', action: onRegister },
    { name: 'Cenník', action: () => activeView === 'trainings_info' ? document.getElementById('pricing')?.scrollIntoView({behavior: 'smooth'}) : onNavigate('trainings_info', '/skolenia#pricing') },
    { name: 'Kontakt', action: () => onNavigate('contact', '/kontakt'), active: activeView === 'contact' },
  ]
};

// Spoločné CSS triedy pre navigation
export const NAV_CSS_CLASSES = {
  DESKTOP_LINK: "inline-flex items-center relative text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer group/nav py-2",
  DESKTOP_BUTTON: "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors py-2 cursor-pointer",
  DESKTOP_AUTH_BUTTON: "bg-brand-orange text-white px-7 py-2.5 rounded-full font-bold uppercase text-xs tracking-wider transition-all hover:scale-105 active:scale-95 ml-4 shadow-xl flex items-center gap-2",
  MOBILE_LINK: "text-2xl font-bold uppercase tracking-wider text-white/70 hover:text-brand-orange transition-colors cursor-pointer",
  MOBILE_DROPDOWN_TITLE: "text-xl font-bold uppercase tracking-wider text-brand-orange/50",
  MOBILE_DROPDOWN_ITEM: "text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white cursor-pointer",
  DROPDOWN_ITEM: "text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-brand-orange hover:bg-slate-50 px-4 py-3 rounded-xl transition-all cursor-pointer text-left"
};

// Spoločný font-family pre navigation
export const NAV_FONT_FAMILY = "'Inter', sans-serif";

// Spoločný text pre auth tlačidlo
export const AUTH_BUTTON_TEXT = "Prihlásenie";
