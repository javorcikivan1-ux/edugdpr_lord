import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  ArrowLeft, 
  Send, 
  Globe, 
  LogIn, 
  ChevronDown, 
  X, 
  Menu, 
  Zap, 
  AlertCircle, 
  Lightbulb,
  Search,
  RefreshCw,
  MousePointer2,
  Building2,
  Info,
  ShieldAlert,
  ArrowUpRight,
  Star
} from 'lucide-react';
import { COMMON_NAV_LINKS, NAV_CSS_CLASSES, AUTH_BUTTON_TEXT, NAV_FONT_FAMILY } from '../common/navigation';

const LOGO_WHITE = "/biele.png";
const LOGO_BLUE = "/landing.png";
const LOGO_MOBIL = "/mobilemenu.png";

interface NavItem {
  name: string;
  href?: string;
  type: string;
  active?: boolean;
  action?: () => void;
  items?: { name: string; href?: string; action?: () => void; active?: boolean }[];
}

export const GDPRView: React.FC<{ 
  onBack: () => void, 
  onNavigate: (view: string, path: string) => void,
  onAuth: () => void,
  onRegister: () => void
}> = ({ onBack, onNavigate, onAuth, onRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isKohoPulsing, setIsKohoPulsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nazov: '',
    ico: '',
    email: '',
    telefon: '',
    oblast: 'Audit GDPR zdarma',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const particlesInitRef = useRef(false);

  useEffect(() => {
    setIsLoaded(true);
    window.scrollTo(0, 0);

    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);

    if (!particlesInitRef.current && (window as any).tsParticles) {
      const headerConfig = {
        fullScreen: { enable: false },
        fpsLimit: 60,
        interactivity: {
          events: { onHover: { enable: true, mode: "repulse" }, resize: true },
          modes: { repulse: { distance: 100, duration: 0.4 } }
        },
        particles: {
          color: { value: ["#ffffff", "#F7941D"] },
          links: { color: "#ffffff", distance: 120, enable: true, opacity: 0.15, width: 1 },
          move: { enable: true, speed: 0.8, direction: "none", outModes: { default: "bounce" } },
          number: { density: { enable: true, area: 800 }, value: 150 },
          opacity: { value: 0.5 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2.5 } }
        },
        detectRetina: true
      };

      const darkZoneConfig = {
        fullScreen: { enable: false },
        fpsLimit: 60,
        particles: {
          color: { value: ["#ffffff", "#F7941D"] },
          links: { color: "#ffffff", distance: 130, enable: true, opacity: 0.1, width: 1 },
          move: { enable: true, speed: 0.6, direction: "none", outModes: { default: "bounce" } },
          number: { density: { enable: true, area: 1000 }, value: 25 },
          opacity: { value: 0.3 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2 } }
        },
        detectRetina: true
      };

      (window as any).tsParticles.load("gdpr-nav-particles", headerConfig);
      (window as any).tsParticles.load("gdpr-dark-zone-particles", darkZoneConfig);
      particlesInitRef.current = true;
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let intervalId: number | undefined;
    let stopPulseTimeoutId: number | undefined;

    const triggerPulse = () => {
      setIsKohoPulsing(false);
      requestAnimationFrame(() => setIsKohoPulsing(true));
      if (stopPulseTimeoutId) window.clearTimeout(stopPulseTimeoutId);
      stopPulseTimeoutId = window.setTimeout(() => setIsKohoPulsing(false), 1200);
    };

    const startTimeoutId = window.setTimeout(() => {
      triggerPulse();
      intervalId = window.setInterval(triggerPulse, 6000);
    }, 6000);

    return () => {
      window.clearTimeout(startTimeoutId);
      if (intervalId) window.clearInterval(intervalId);
      if (stopPulseTimeoutId) window.clearTimeout(stopPulseTimeoutId);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value || ''  // Zabezpečíme, že value nie je undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://formspree.io/f/mrbkopok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          nazov: '',
          ico: '',
          email: '',
          telefon: '',
          oblast: 'Audit GDPR zdarma',
          message: ''
        });
      } else {
        throw new Error('Nepodarilo sa odoslať formulár');
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById('kontaktny-formular');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = COMMON_NAV_LINKS.WITH_HREF(onNavigate, onRegister, 'gdpr');

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-brand-orange/30">
      
      {/* Navigation */}
      <div className={`fixed inset-x-0 z-[2000] flex justify-center transition-all duration-700 ${scrolled ? 'lg:top-4 lg:px-6 top-0 px-0' : 'top-0 px-0'}`}>
        <nav 
          className={`w-full transition-all duration-700 relative overflow-visible ${
            scrolled 
              ? 'lg:bg-white/95 lg:backdrop-blur-md lg:max-w-[95%] lg:h-16 lg:rounded-full lg:shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:border lg:border-slate-100 bg-[#002b4e] lg:h-24 h-16 border-b border-white/5' 
              : 'w-full lg:h-24 h-16 border-b border-white/5 bg-[#002b4e]'
          }`}
        >
          <div className={`absolute inset-0 z-0 pointer-events-none rounded-inherit transition-opacity duration-700 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
            <div id="gdpr-nav-particles" className="w-full h-full"></div>
          </div>

          <div className={`mx-auto h-full flex items-center justify-between px-10 relative z-10 transition-all duration-700 ${scrolled ? 'max-w-full' : 'max-w-7xl'}`}>
            {/* Logo Section */}
            <div className="flex items-center group cursor-pointer" onClick={onBack}>
              <div className="flex items-center justify-center transition-all duration-500 overflow-hidden">
                {/* Desktop logo - always visible */}
                <img 
                  src={scrolled ? LOGO_BLUE : LOGO_WHITE} 
                  alt="Lord's Benison" 
                  className={`w-auto object-contain transition-all duration-500 hidden lg:block ${scrolled ? 'h-10' : 'h-14'}`} 
                />
                {/* Mobile logo - always visible */}
                <img 
                  src={LOGO_MOBIL} 
                  alt="Lord's Benison" 
                  style={{
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    borderRadius: '0',
                    padding: '0',
                    margin: '0'
                  }}
                  className="w-auto object-contain transition-all duration-300 lg:hidden h-14" 
                />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <div key={link.name} className="relative group/parent">
                  {link.type === 'dropdown' ? (
                    <button className={`${NAV_CSS_CLASSES.DESKTOP_BUTTON} ${scrolled ? 'text-brand-navy hover:text-brand-orange' : 'text-white/90 hover:text-brand-orange'}`} style={{ fontFamily: NAV_FONT_FAMILY }}>
                      {link.name} <ChevronDown size={14} className="group-hover/parent:rotate-180 transition-transform" />
                    </button>
                  ) : (
                    <a href={link.href} onClick={(e) => { if(link.action) { e.preventDefault(); link.action(); } }} className={`${NAV_CSS_CLASSES.DESKTOP_LINK} ${link.active ? 'text-brand-orange' : (scrolled ? 'text-brand-navy hover:text-brand-orange' : 'text-white/90 hover:text-white')}`} style={{ fontFamily: NAV_FONT_FAMILY }}>
                      {link.name}
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-brand-orange transition-all duration-300 ${link.active ? 'w-full' : 'w-0 group-hover/nav:w-full'}`}></span>
                    </a>
                  )}

                  {link.type === 'dropdown' && (
                    <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover/parent:opacity-100 group-hover/parent:translate-y-0 group-hover/parent:pointer-events-auto transition-all duration-300 z-[2001]">
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 min-w-[240px] flex flex-col gap-1 overflow-hidden">
                        {link.items?.map(item => (
                          <a key={item.name} href={item.href || '#'} onClick={(e) => { if(item.action) { e.preventDefault(); item.action(); } }} className={NAV_CSS_CLASSES.DROPDOWN_ITEM} style={{ fontFamily: NAV_FONT_FAMILY }}>
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={onAuth} className={`${NAV_CSS_CLASSES.DESKTOP_AUTH_BUTTON} ${scrolled ? 'shadow-orange-500/25' : 'shadow-black/20'}`} style={{ fontFamily: NAV_FONT_FAMILY }}>
                <LogIn size={14} /> {AUTH_BUTTON_TEXT}
              </button>
            </div>

            {/* Mobile Toggle Button */}
          <button className={`lg:hidden p-2 transition-colors text-white`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-[1999] transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#002b4e] via-[#003d6d] to-[#002b4e]">
          <div className="flex flex-col h-full p-6 pt-24 gap-8 overflow-y-auto">

            {/* Navigation Links */}
            <div className="space-y-2">
              {navLinks.map(link => (
                <div key={link.name}>
                  {link.type === 'dropdown' ? (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-bold text-brand-orange">{link.name}</span>
                        <ChevronDown size={20} className="text-white/60" />
                      </div>
                      <div className="space-y-3">
                        {link.items?.map(item => (
                          <a 
                            key={item.name} 
                            href={item.href || '#'} 
                            onClick={(e) => { 
                              if(item.action) { e.preventDefault(); item.action(); } 
                              setMobileMenuOpen(false); 
                            }} 
                            className="block w-full text-left px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer text-sm"
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <a 
                      key={link.name} 
                      href={link.href || '#'} 
                      onClick={(e) => { 
                        if(link.action) { e.preventDefault(); link.action(); }
                        else { setMobileMenuOpen(false); }
                      }}
                      className="block w-full bg-white/5 backdrop-blur-md rounded-2xl px-5 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                      style={{ fontFamily: NAV_FONT_FAMILY }}
                    >
                      {link.name}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Auth Button */}
            <div className="mt-auto pt-8">
              <button 
                onClick={() => { onAuth(); setMobileMenuOpen(false); }}
                className="w-full bg-gradient-to-r from-brand-orange to-orange-600 text-white py-4 rounded-2xl font-bold uppercase text-sm tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:from-orange-600 hover:to-brand-orange transition-all"
              >
                <LogIn size={20} /> {AUTH_BUTTON_TEXT}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="pt-24 md:pt-48 pb-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F7941D 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="lg:grid lg:grid-cols-2 gap-16 lg:gap-20 items-center text-left">
            <div className={`space-y-6 transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-brand-orange to-orange-400 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-brand-orange font-medium text-sm uppercase tracking-wider block leading-tight">Ochrana osobných údajov</span>
                  <span className="text-orange-200 text-xs uppercase tracking-wide block leading-tight">Zákon 18/2018 Z.z.</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#002b4e] tracking-tighter leading-[1.1]">
                Komplexné zabezpečenie <br/>
                <span className="text-brand-orange italic">agendy GDPR</span>
              </h1>
              <p className="max-w-lg text-slate-500 text-lg font-medium leading-relaxed">
                Hľadáte riešenia, nie výhovorky? V tom prípade sme možno práve my tá správna voľba! Zverte legislatívne povinnosti do rúk odborníkov.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button onClick={scrollToForm} className="flex-1 bg-brand-orange text-white px-6 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all active:scale-95">Cenová ponuka GDPR</button>
                <button onClick={() => document.getElementById('audit')?.scrollIntoView({behavior: 'smooth'})} className="flex-1 bg-slate-50 text-brand-navy border border-slate-200 px-6 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider hover:bg-white transition-all">Bezplatný audit GDPR</button>
              </div>
            </div>

            <div className={`transition-all duration-1000 delay-300 transform ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} mt-8 lg:mt-4`}>
              <div className="p-4 bg-slate-50 rounded-[3rem] border border-slate-100 relative group overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ShieldCheck size={120} /></div>
                <div className="space-y-5 relative z-10">
                   <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Prečo GDPR od nás?</h3>
                   <div className="space-y-3">
                      {[
                        "Individuálna tvorba dokumentov",
                        "Pravidelné aktualizácie agendy GDPR",
                        "Súčinnosť pri štátnych kontrolách",
                        "Bezplatné poradenstvo a ľudský prístup",
                        "Školenia zamestnancov v digitálnej platforme"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 size={18} className="text-brand-orange shrink-0" />
                          {item}
                        </div>
                      ))}
                   </div>

                   <div className="pt-4 mt-5 border-t border-slate-200/60">
                     <a
                       href="https://www.google.com/search?sa=X&sca_esv=206cd4dd954885db&q=LORD%27S+BENISON+s.r.o.+Recenzie&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxI2Njc0MbM0NTWxMDI0MDU2MLc02sDI-IpRzsc_yEU9WMHJ1c8z2N9PoVivSC9fTyEoNTk1ryozdRErAQUADRJEo1wAAAA&rldimm=3714695548210530792&tbm=lcl&hl=sk-SK&ved=2ahUKEwitjZmHofSSAxU2VPEDHaPlDksQ9fQKegQIQRAG&biw=1528&bih=698&dpr=1.25#lkt=LocalPoiReviews"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl px-4 py-2 shadow-sm hover:shadow-md hover:bg-white transition-all cursor-pointer"
                       aria-label="Otvoriť Google recenzie"
                     >
                       <div className="flex items-center gap-2">
                         <svg width="18" height="18" viewBox="0 0 256 262" aria-hidden="true" className="shrink-0">
                           <path fill="#4285F4" d="M255.9 133.5c0-11.6-1-23-3-34.1H130.5v64.6h70.3c-3 16.4-12.1 30.3-25.8 39.5v32.8h41.7c24.4-22.5 39.2-55.7 39.2-102.8z"/>
                           <path fill="#34A853" d="M130.5 261.1c34.9 0 64.1-11.6 85.5-31.5l-41.7-32.8c-11.6 7.8-26.4 12.4-43.8 12.4-33.6 0-62.1-22.7-72.3-53.2H14.9v33.4c21.3 42.3 65.1 71.7 115.6 71.7z"/>
                           <path fill="#FBBC05" d="M58.2 156c-2.6-7.8-4.1-16.1-4.1-24.6s1.5-16.8 4.1-24.6V73.4H14.9C6.1 90.9 1 110.6 1 131.4s5.1 40.5 13.9 58l43.3-33.4z"/>
                           <path fill="#EA4335" d="M130.5 53.6c19 0 36 6.5 49.4 19.2l37-37C194.6 13 165.4 1.7 130.5 1.7 80 1.7 36.2 31.1 14.9 73.4l43.3 33.4c10.2-30.5 38.7-53.2 72.3-53.2z"/>
                         </svg>
                         <div className="text-xs font-black text-slate-700">Hodnotenia klientov</div>
                       </div>
                       <div className="flex items-center gap-0.5">
                         {Array.from({ length: 5 }).map((_, idx) => (
                           <Star key={idx} size={14} className="text-yellow-400 fill-yellow-400" />
                         ))}
                       </div>
                       <div className="text-sm font-black text-slate-800">5.0</div>
                     </a>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deliaca čiara s rastúcou animáciou */}
      <div className="max-w-7xl mx-auto px-10 relative overflow-hidden h-px">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent animate-[grow-width_1.5s_ease-out_forwards]"></div>
      </div>
      <style>{`
        @keyframes grow-width {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      {/* 2. DOKUMENTÁCIA BEZ STAROSTÍ */}
      <section className="bg-white pt-2 pb-6 relative">
        <div className="max-w-7xl mx-auto px-10 pt-4 pb-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-left">
              <h2 className="text-3xl md:text-4xl font-black text-brand-navy tracking-tighter">Podnikajte bez starostí</h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                S nami získate funkčný systém ochrany údajov, ktorý vás chráni pred pokutami a zapezpečuje súlad s platnou legislatívou.
              </p>
              
              <div className="grid gap-4">
                 {[
                   { t: "Vypracovanie na mieru", d: "Vypracovaniu GDPR predchádza hĺbkový audit a konzultácie" },
                   { t: "Aktualizácie & revízie", d: "Vaše dokumenty pravidelne upravujeme podľa aktuálnej legislatívy." },
                   { t: "Implementácia do praxe", d: "Pretože „len“ vypracovať dokumenty proste nestačí" }
                 ].map((item, idx) => (
                   <div key={idx} className="flex gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                     <div className="w-6 h-6 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange shrink-0 mt-1"><CheckCircle2 size={16} /></div>
                     <div>
                        <h4 className="font-bold text-brand-navy text-base">{item.t}</h4>
                        <p className="text-slate-400 text-sm mt-1 leading-relaxed">{item.d}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="space-y-6">
               {/* Vedeli ste, že Card */}
               <div className="group relative bg-brand-orange/5 border border-brand-orange/20 rounded-[2.5rem] p-6 md:p-10 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl group-hover:bg-brand-orange/20 transition-colors"></div>
                  <div className="relative z-10 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                           <Lightbulb size={20} />
                        </div>
                        <span className="text-brand-orange font-black text-[11px] uppercase tracking-[0.3em]">Vedeli ste, že?</span>
                     </div>
                     <p className="text-slate-500 text-sm leading-relaxed font-medium">
                        Každý prevádzkovateľ je podľa zákona č. 18/2018 Z. z. povinný aspoň raz ročne vykonať internú kontrolu spracúvania osobných údajov na každom organizačnom úseku a vyhotoviť o tom protokol o bezpečnosti? Táto kontrolná činnosť nie je len formalita – 
                        predstavuje základný zmysel celej dokumentácie. Ak sa nevykonáva, dokumentácia neplní svoj primárny účel a to preukázať 
                        <span className="text-brand-orange font-bold underline decoration-brand-orange/30 underline-offset-4"> zákonné spracúvanie osobných údajov.</span>
                     </p>
                  </div>
               </div>

               {/* Súčinnosť Card */}
               <div className="group relative bg-brand-blue/5 border border-brand-blue/20 rounded-[2.5rem] p-6 md:p-10 overflow-hidden shadow-sm transition-all hover:shadow-lg">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-colors"></div>
                  <div className="relative z-10 space-y-6 text-left">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                              <ShieldAlert size={20} />
                           </div>
                           <span className="text-brand-blue font-black text-[11px] uppercase tracking-[0.3em]">Súčinnosť pri kontrolách</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                           V prípade <span className="text-brand-blue font-bold">kontroly z Úradu na ochranu osobných údajov</span> stojíme odborne pri vás a klientovi poskytujeme súčinnosť.
                        </p>
                     </div>
                     <button 
                        onClick={scrollToForm}
                        className="w-full bg-brand-blue hover:bg-brand-navy text-white py-3 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-3 group/btn shadow-xl shadow-blue-500/10"
                     >
                        Požiadať o konzultáciu <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AUDIT SEKCIA */}
      <section id="audit" className="bg-slate-50 relative pb-6">
        <div className="absolute top-0 left-0 w-full h-12 bg-white z-20 -mt-px" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
        
        <div className="max-w-7xl mx-auto px-10 text-center space-y-10 pt-24 pb-12 relative z-10">
           <div className="max-w-3xl mx-auto space-y-3">
              <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">Bezplatný audit gdpr</div>
              <h2 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tighter">Naozaj ste v súlade s GDPR?</h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Máte vypracované GDPR? ...že jasné, už dávno? Práve to môže byť problém! Legislatíva GDPR sa neustále vyvíja a mení a dokumenty vypracované pred 2 rokmi už nemusia spĺňať legislatívne štandardy.Využite náš bezplatný online audit a uistite sa, či je vaše podnikanie chránené na 100%
              </p>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              {[
                "Kontrola dokumentácie a procesov",
                "Audit rizík a priorít (traffic-light)",
                "Identifikácia spracovateľských operácií",
                "Výstupný protokol s návrhmi riešenia",
                "Cenová ponuka na mieru",
                "Audit je nezáväzny a bezplatný"
              ].map((txt, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-8 h-8 bg-brand-orange text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-orange-500/10">✓</div>
                  <span className="font-bold text-brand-navy text-sm">{txt}</span>
                </div>
              ))}
           </div>
           <button onClick={scrollToForm} className="bg-brand-blue text-white px-6 py-3 sm:px-12 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl shadow-blue-500/20 hover:bg-brand-navy transition-all active:scale-95">Vyžiadať bezplatný audit</button>
        </div>
      </section>

      {/* 4 & 5. ZJEDNOTENÝ TMAVÝ BLOK (PROCES + FAKTY) */}
      <div className="bg-[#002b4e] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-12 bg-slate-50 z-20 -mt-px" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
        
        <div id="gdpr-dark-zone-particles" className="absolute inset-0 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#003d6d]/40 to-brand-navy/60 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-10 relative z-10 pt-24 pb-12">
          {/* Fakty o GDPR - monolitický prechod */}
             <div className="grid lg:grid-cols-2 gap-16 items-start">

             <div className="space-y-10 text-left relative z-10">
                <div className="space-y-5">
                  <style>{`@keyframes gdprKohoPulse { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.04); filter: brightness(1.05); } }`}</style>
                  <h3 className="text-3xl md:text-4xl font-black text-brand-orange tracking-tighter leading-tight inline-block" style={isKohoPulsing ? { animation: 'gdprKohoPulse 1200ms ease-in-out 1' } : undefined}>Koho sa GDPR týka?</h3>
                  <p className="text-white/40 font-medium italic border-l-4 border-brand-orange/30 pl-8 text-lg leading-relaxed">
                    "...v súčasnej dobe je takmer nemožné predstaviť si podnikateľa, ktorý nespracúva žiadne osobné údaje."
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-4 md:p-10 rounded-[3rem] space-y-4 md:space-y-6 shadow-2xl">
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    GDPR sa týka firiem a živnostníkov, ktorí spracúvajú osobné údaje a to bez ohľadu na veľkosť alebo odvetvie. Už samotná webová stránka, zákaznícka databáza alebo kamery znamenajú povinnosť viesť aspoň základnú GDPR dokumentáciu.
                  </p>
                  <h4 className="text-brand-orange font-bold text-xs uppercase tracking-wider flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2"><span className="flex items-center gap-2"><AlertCircle size={14}/> Pozor na úpravu legislatívy</span></h4>
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    Jednorazové vypracovanie GDPR väčšinou nestačí, rovnako ako nestačí „vlastniť“ 400 stranový šanón A4 papierov pohodený niekde v skrini na firme. Bez pravidelnej kontroly a aktualizácie môže byť dokumentácia pri kontrole považovaná za nedostatočnú.
                    Pokuta za GDPR môže dosiahnuť až 20 miliónov € alebo 4 % z ročného obratu. Najčastejším dôvodom je neaktuálna alebo chýbajúca dokumentácia GDPR.
                  </p>
                </div>
              </div>

             <div className="relative z-10 space-y-6">
               <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-[3rem] shadow-2xl">
                 <h4 className="text-2xl font-bold text-white tracking-tight leading-tight">GDPR sa týka aj vás, ak…</h4>
                 <div className="mt-6 space-y-3">
                   <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><Globe size={18} /></div>
                     <div className="text-white/70 text-sm font-bold leading-relaxed">máte webovú stránku alebo e-shop</div>
                   </div>
                   <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><Mail size={18} /></div>
                     <div className="text-white/70 text-sm font-bold leading-relaxed">prichádzate do styku s osobnými údajmi</div>
                   </div>
                   <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><Building2 size={18} /></div>
                     <div className="text-white/70 text-sm font-bold leading-relaxed">zamestnávate ľudí alebo pracujete s FO</div>
                   </div>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><Building2 size={18} /></div>
                     <div className="text-white/70 text-sm font-bold leading-relaxed">využívate marketing, newsletter alebo databázy</div>
                   </div>
                   <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div>
                     <div className="text-white/70 text-sm font-bold leading-relaxed">používate kamerové, dochádzkové alebo GPS systémy</div>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 6. FORMULÁR - Closer to previous section */}
      <section id="kontaktny-formular" className="bg-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-12 bg-[#002b4e] z-20 -mt-px" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
         
         <div className="max-w-7xl mx-auto px-10 relative z-10 pt-14 pb-20">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-8 text-left">
                  <div className="space-y-4">
                    <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">ozvite sa nám</div>
                    <h2 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tighter leading-tight">GDPR nemusí byť <br/><span className="text-brand-orange italic">strašiakom</span></h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                      Zverte GDPR odborníkom. Stačí pár riadkov a obratom vám navrhneme riešenie šité na mieru vášmu biznisu.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-5">
                    <div className="group cursor-pointer" onClick={() => window.location.href="tel:+421948225713"}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">telefónne číslo</p>
                      <p className="text-xl font-black text-brand-navy group-hover:text-brand-orange transition-colors">+421 948 225 713</p>
                    </div>
                    <div className="group cursor-pointer" onClick={() => window.location.href="mailto:sluzby@lordsbenison.eu"}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">e-mail</p>
                      <p className="text-xl font-black text-brand-navy group-hover:text-brand-orange transition-colors">sluzby@lordsbenison.eu</p>
                    </div>
                  </div>
               </div>

               <div className="bg-white p-4 md:p-12 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,43,78,0.12)] border border-slate-50 relative overflow-hidden">
                  <form className="space-y-4 font-sans" onSubmit={handleSubmit}>
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Názov organizácie / Spoločnosti</label>
                      <input 
                        type="text" 
                        name="nazov"
                        value={formData.nazov || ''}
                        onChange={handleChange}
                        placeholder="Firma s.r.o." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all focus:ring-brand-blue focus:border-brand-blue" 
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">IČO</label>
                        <input 
                          type="text" 
                          name="ico"
                          value={formData.ico || ''}
                          onChange={handleChange}
                          placeholder="12345678" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all focus:ring-brand-blue focus:border-brand-blue" 
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Váš e-mail</label>
                        <input type="email" placeholder="vas@email.sk" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Telefónne číslo</label>
                        <input 
                          type="tel" 
                          name="telefon"
                          value={formData.telefon || ''}
                          onChange={handleChange}
                          placeholder="+421 XXX XXX XXX" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all focus:ring-brand-blue focus:border-brand-blue" 
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">O čo máte záujem?</label>
                        <div className="relative">
                          <select 
                            name="oblast"
                            value={formData.oblast}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all cursor-pointer appearance-none"
                          >
                            <option>Audit GDPR zdarma</option>
                            <option>Cenová ponuka na mieru</option>
                            <option>Nezáväzná konzultácia</option>
                            <option>Iná požiadavka</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Vaša správa (voliteľné)</label>
                      <textarea 
                        rows={2} 
                        name="message"
                        value={formData.message || ''}
                        onChange={handleChange}
                        placeholder="Popíšte nám Vašu požiadavku..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all resize-none"
                      ></textarea>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <input 
                        type="checkbox" 
                        id="gdpr-consent"
                        className="mt-1 w-4 h-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange focus:ring-2"
                        required
                      />
                      <label htmlFor="gdpr-consent" className="text-xs text-slate-600 leading-relaxed">
                        Potvrdzujem, že som sa oboznámil/a so{" "}
                        <a 
                          href="/zasady-ochrany-osobnych-udajov-gdpr.html" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-orange-500 hover:text-orange-600 underline transition-colors font-medium"
                        >
                          Zásadami spracúvania osobných údajov
                        </a>
                      </label>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 sm:px-10 sm:py-5 bg-brand-orange text-white rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <><RefreshCw className="animate-spin" size={18} /> Odosielam...</>
                      ) : (
                        <>Odoslať žiadosť <Send size={18} /></>
                      )}
                    </button>
                    
                    {/* Success/Error Messages */}
                    {submitStatus === 'success' && (
                      <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <CheckCircle2 className="text-emerald-500" size={24} />
                          <h4 className="text-lg font-semibold text-emerald-800">Žiadosť odoslaná!</h4>
                        </div>
                        <p className="text-sm text-emerald-600">Ďakujeme za váš dopyt. Ozveme sa vám čo najskôr.</p>
                      </div>
                    )}
                    
                    {submitStatus === 'error' && (
                      <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <AlertCircle className="text-rose-500" size={24} />
                          <h4 className="text-lg font-semibold text-rose-800">Chyba pri odosielaní</h4>
                        </div>
                        <p className="text-sm text-rose-600">Nepodarilo sa odoslať žiadosť. Skúste to prosím znova.</p>
                      </div>
                    )}
                  </form>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};


