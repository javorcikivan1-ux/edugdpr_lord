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
  Search,
  RefreshCw,
  Users,
  Target,
  MousePointer2,
  Building2,
  Info,
  ShieldAlert,
  ArrowUpRight,
  Database,
  Camera,
  Settings,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { COMMON_NAV_LINKS, NAV_CSS_CLASSES, AUTH_BUTTON_TEXT, NAV_FONT_FAMILY } from '../common/navigation';
import CookieConsent from './CookieConsent';
import { MarketingFooter } from './MarketingFooter';

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
    message: '',
    website: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showVedeliSteModal, setShowVedeliSteModal] = useState(false);
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ ...formData, source: 'gdpr', gdprConsent: true })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          nazov: '',
          ico: '',
          email: '',
          telefon: '',
          oblast: 'Audit GDPR zdarma',
          message: '',
          website: ''
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
    <div className="marketing-page min-h-screen bg-white font-sans overflow-x-hidden selection:bg-brand-orange/30">
      
      {/* Navigation */}
      <div className={`fixed inset-x-0 z-[2000] flex justify-center transition-all duration-700 ${scrolled ? 'lg:top-4 lg:px-6 top-0 px-0' : 'top-0 px-0'}`}>
        <nav 
          className={`w-full transition-all duration-700 relative overflow-visible ${
            scrolled 
              ? 'lg:bg-white/95 lg:backdrop-blur-md lg:max-w-[95%] lg:h-16 lg:rounded-full lg:shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:border lg:border-slate-100 bg-[#002b4e] h-16 border-b border-white/5' 
              : 'w-full lg:h-24 h-16 border-b border-white/10 bg-[#002b4e]/25 backdrop-blur-md shadow-[0_10px_35px_rgba(0,20,38,0.08)]'
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
                      {link.name === 'Platforma Complyo' ? (
                        <>
                          <span style={{ textTransform: 'none' }}>PLATFORMA</span>&nbsp;<span className="text-brand-orange italic text-base" style={{ textTransform: 'none' }}>Complyo</span>
                        </>
                      ) : (
                        link.name
                      )}
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
                      {link.name === 'Platforma Complyo' ? (
                        <>
                          Platforma&nbsp;<span className="text-brand-orange italic text-base">Complyo</span>
                        </>
                      ) : (
                        link.name
                      )}
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
      <section className="relative min-h-[100svh] overflow-hidden bg-[#002b4e] pt-24 lg:pt-28">
        <div className="absolute inset-0 bg-right bg-no-repeat" style={{ backgroundImage: "url('/gdpr-hero-office-v1.webp')", backgroundSize: 'auto 94%' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#002b4e] via-[#002b4e]/80 to-[#002b4e]/5"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#002b4e]/80 via-transparent to-[#002b4e]/25"></div>
        <div className="absolute left-[7%] top-[22%] h-56 w-56 rounded-full bg-blue-500/10 blur-[90px]"></div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-7rem)] max-w-7xl items-center px-6 py-7 sm:px-10 lg:px-12 lg:py-8">
          <div className="grid w-full items-center gap-10 text-left lg:grid-cols-[minmax(300px,0.6fr)_minmax(600px,1fr)] lg:gap-9 xl:gap-12">
            <div className={`max-w-[520px] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="mb-5 flex items-start gap-5">
                <span className="mt-2.5 h-0.5 w-10 bg-brand-orange"></span>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-[0.22em] text-white/85">Ochrana osobných údajov</span>
                  <span className="mt-1.5 block text-[11px] uppercase tracking-[0.18em] text-brand-orange">Zákon 18/2018 Z. z.</span>
                </div>
              </div>
              <h1 className="max-w-xl text-4xl font-black leading-[1.03] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.35rem]">
                Komplexné<br />zabezpečenie
                <span className="mt-2 block italic text-brand-orange">agendy GDPR</span>
              </h1>
              <p className="mt-5 max-w-[480px] text-base font-medium leading-relaxed text-slate-200">
                Hľadáte riešenia, nie výhovorky? V tom prípade sme možno práve my tá správna voľba! Zverte legislatívne povinnosti do rúk odborníkov.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button onClick={scrollToForm} className="rounded-lg bg-brand-orange px-7 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xl shadow-orange-950/20 transition-all hover:-translate-y-0.5 hover:bg-orange-500 active:translate-y-0 sm:min-w-[205px]">Cenová ponuka GDPR</button>
                <button onClick={() => document.getElementById('audit')?.scrollIntoView({behavior: 'smooth'})} className="rounded-lg border border-white/70 bg-transparent px-7 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-white/10 sm:min-w-[215px]">Bezplatný audit GDPR</button>
              </div>

              <a
                href="https://www.google.com/search?sca_esv=60d489da354ea4a7&sxsrf=APpeQnvjvvsizTcujON7ZsPUFpMhckjLOQ:1789893300083&uds=AJ5uw1_a2D0D09lxm8gpKKOTUn4rJPcB3QsXLUf8Pc7uOwrEVNpAevfBh8KgTvY6pbl-xZUrrFb7XMSy_OJKPLLdjBZnTWiH1rMcX1Igsd70-lRVBZWkOtkb9u5bq8OWiilaqdN7ABXMBR4UWOOm7OMR6EbvRnJLdjAGYiU2oVXBdXaKb4g0M4Y&q=LORD%27S+BENISON+s.r.o.+Reviews&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_wcgS8fTTkS4ASw3dsM8qdKyur_Lc3XZDYplxYOjMW_dRWBufcAS40BqagojuKxpiLf8Q728ej5oq5CjQDijYj8sL9ss4rR_tHni8xec06T1Wh0Hrw%3D%3D&hl=en-SK&sa=X&ved=2ahUKEwiO79iS4PyWAxUg1QIHHUK_AKUQ_4MLegQIQBAO&biw=1528&bih=698&dpr=1.25"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hodnotenia zákazníkov LORD'S BENISON na Google"
                className="mt-7 flex w-fit max-w-full items-center gap-3 rounded-full border border-slate-200/90 bg-white/95 px-4 py-2.5 text-brand-navy shadow-[0_8px_24px_rgba(0,20,38,0.14)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_30px_rgba(0,20,38,0.2)] sm:px-5"
              >
                <img src="/google_icons.webp" alt="Google" className="h-7 w-7 shrink-0 object-contain" />
                <span className="min-w-0 whitespace-nowrap text-[11px] font-bold sm:text-xs">
                  <span className="sm:hidden">Google recenzie&nbsp;&nbsp;✔</span>
                  <span className="hidden sm:inline">Google recenzie</span>
                </span>
                <span className="flex shrink-0 gap-0.5 text-[17px] leading-none text-[#fbbc04]" aria-hidden="true">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </span>
                <span className="h-7 w-px shrink-0 bg-slate-200"></span>
                <span className="shrink-0 text-lg font-black">5.0</span>
              </a>
            </div>

            <aside className="hidden lg:block">
              <div className="mb-4 flex items-center gap-4">
                <span className="h-0.5 w-10 bg-brand-orange"></span>
                <h2 className="text-xl font-black tracking-tight text-white">Prečo GDPR od nás?</h2>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: FileText, title: 'Individuálne riešenie', text: 'Individuálne vytvoríme dokumentáciu na mieru vášmu podnikaniu.' },
                  { icon: Settings, title: 'Praktické zavedenie', text: 'Pomôžeme vám GDPR skutočne implementovať do každodennej praxe.' },
                  { icon: ShieldCheck, title: 'Aktuálna legislatíva', text: 'Zabezpečíme, aby ste boli vždy v súlade s platnými predpismi.' },
                  { icon: Users, title: 'Odborné poradenstvo', text: 'Máte k dispozícii tím skúsených špecialistov s ľudským prístupom.' },
                  { icon: TrendingUp, title: 'Minimalizácia rizík', text: 'Pomáhame predchádzať pokutám a nežiaducim situáciám.' },
                  { icon: GraduationCap, title: 'Školenia zamestnancov', text: 'Cez našu platformu Complyo zabezpečíme školenia zamestnancom.' }
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="min-h-[175px] rounded-xl border border-white/20 bg-[#073a5d]/20 p-4 shadow-[0_14px_38px_rgba(0,0,0,.08)] transition-transform duration-300 hover:-translate-y-1">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-brand-orange">
                      <Icon size={26} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-[15px] font-black leading-snug text-white">{title}</h3>
                    <p className="mt-2 text-[14px] font-medium leading-relaxed text-white/85">{text}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Deliaca čiara s rastúcou animáciou */}
      <div className="relative mx-auto h-px max-w-7xl overflow-hidden px-10">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent animate-[grow-width_1.5s_ease-out_forwards]"></div>
      </div>
      <style>{`
        @keyframes grow-width {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      {/* 2. DOKUMENTÁCIA BEZ STAROSTÍ */}
      <section className="relative bg-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(247,148,29,.07),transparent_28%)]"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="space-y-6 text-left">
              <h2 className="text-3xl md:text-4xl font-black text-brand-navy tracking-tighter">Podnikajte bez starostí</h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                S nami získate funkčný systém ochrany údajov, ktorý vás ochráni pred pokutami a zabezpečí preukázateľný súlad s platnou GDPR legislatívou.
              </p>
              
              <div className="grid gap-4">
                 {[
                   { t: "Vypracovanie na mieru", d: "Vypracovaniu GDPR predchádza hĺbkový audit a konzultácie" },
                   { t: "Aktualizácie & revízie", d: "Vaše dokumenty pravidelne upravujeme podľa aktuálnej legislatívy." },
                   { t: "Implementácia do praxe", d: "Pretože „len“ vypracovať dokumenty proste nestačí" }
                 ].map((item, idx) => (
                   <div key={idx} className="group flex gap-5 border-b border-slate-200/80 py-5 last:border-0">
                     <div className="w-6 h-6 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange shrink-0 mt-1"><CheckCircle2 size={16} /></div>
                     <div>
                        <h4 className="font-bold text-brand-navy text-base">{item.t}</h4>
                        <p className="text-slate-400 text-sm mt-1 leading-relaxed">{item.d}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="space-y-5">
               {/* Vedeli ste, že Card */}
               <div 
                  className="group relative cursor-pointer overflow-hidden rounded-3xl border border-orange-100 bg-[#fffaf4] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg md:p-8"
                  onClick={() => setShowVedeliSteModal(true)}
               >
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl group-hover:bg-brand-orange/20 transition-colors"></div>
                  <div className="relative z-10 space-y-4">
                     <div className="flex items-center gap-3">
                        <img src="/question-icon.png" alt="" aria-hidden="true" className="w-10 h-10 object-contain drop-shadow-md" />
                        <span className="text-brand-orange font-black text-sm uppercase">Vedeli ste, že?</span>
                     </div>
                     <p className="text-slate-500 text-sm leading-relaxed font-medium">
                        Každý prevádzkovateľ je podľa zákona č. 18/2018 Z. z. povinný aspoň raz ročne vykonať internú kontrolu spracúvania osobných údajov na každom organizačnom úseku a vyhotoviť o tom protokol o bezpečnosti? Táto kontrolná činnosť nie je len formalita – 
                        predstavuje základný zmysel celej dokumentácie. Ak sa nevykonáva, dokumentácia neplní svoj primárny účel a to preukázať 
                        <span> zákonné spracúvanie osobných údajov.</span>
                     </p>
                     <div className="flex items-center gap-2 text-brand-orange text-sm font-medium">
                        <span className="underline decoration-brand-orange/30 underline-offset-4">Kliknite pre viac informácií</span>
                        <ChevronRight size={16} />
                     </div>
                  </div>
               </div>

               {/* Súčinnosť Card */}
               <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg md:p-8">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-colors"></div>
                  <div className="relative z-10 space-y-6 text-left">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                              <CheckCircle2 size={20} />
                           </div>
                           <span className="text-brand-blue font-black text-sm uppercase">Bezplatná kontrola dokumentácie GDPR</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                           Pomôžeme vám preveriť rozsah a správnosť GDPR dokumentácie a identifikovať prípadné nedostatky. V prípade potreby navrhneme jej úpravu alebo doplnenie tak, aby zodpovedala aktuálnym právnym požiadavkám a reálnemu spôsobu spracúvania osobných údajov.
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
      <section id="audit" className="relative border-y border-slate-100 bg-slate-50">
        <div className="relative z-10 mx-auto max-w-7xl space-y-10 px-6 py-20 text-center sm:px-10 lg:py-24">
           <div className="max-w-3xl mx-auto space-y-3">
              <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">Bezplatný audit gdpr</div>
              <h2 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tighter">Naozaj ste v súlade s GDPR?</h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Máte GDPR dokumentáciu vypracovanú už dlhšie? Práve to môže byť problém. Legislatíva aj vaše procesy sa vyvíjajú a staršie dokumenty už nemusia zodpovedať realite. Využite náš bezplatný audit a overte si, či je vaše podnikanie správne chránené.
              </p>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              {[
                "Kontrola dokumentácie a procesov",
                "Audit rizík a priorít (traffic-light)",
                "Identifikácia spracovateľských činností",
                "Výstupný protokol s návrhmi opatrení",
                "Cenová ponuka na mieru",
                "Audit je nezáväzny a bezplatný"
              ].map((txt, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/10 text-xs font-black text-brand-orange">✓</div>
                  <span className="font-bold text-brand-navy text-sm">{txt}</span>
                </div>
              ))}
           </div>
           <button onClick={scrollToForm} className="bg-brand-blue text-white px-6 py-3 sm:px-12 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl shadow-blue-500/20 hover:bg-brand-navy transition-all active:scale-95">Vyžiadať bezplatný audit</button>
        </div>
      </section>

      {/* 4 & 5. ZJEDNOTENÝ TMAVÝ BLOK (PROCES + FAKTY) */}
      <div className="bg-[#002b4e] relative overflow-hidden">
        <div id="gdpr-dark-zone-particles" className="absolute inset-0 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#003d6d]/40 to-brand-navy/60 pointer-events-none"></div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-24">
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
                
                <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.055] p-7 shadow-2xl backdrop-blur-sm md:space-y-6 md:p-9">
                  <div className="space-y-3">
                    <h4 className="text-brand-orange font-bold text-sm md:text-base leading-tight">GDPR sa vzťahuje na firmy a živnostníkov</h4>
                    <p className="text-white/60 text-sm leading-relaxed font-medium">
                      ktorí spracúvajú osobné údaje, bez ohľadu na veľkosť alebo odvetvie. V praxi ide o väčšinu podnikateľov.
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed font-medium">
                      Bežné činnosti ako prevádzka webovej stránky, evidencia zákazníkov, komunikácia e-mailom alebo používanie kamerového systému predstavujú spracúvanie osobných údajov a zakladajú súvisiace povinnosti podľa Nariadenia GDPR a zákona č. 18/2018 Z. z.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-brand-orange font-bold text-sm md:text-base leading-tight">GDPR nie je jednorazová záležitosť</h4>
                    <p className="text-white/60 text-sm leading-relaxed font-medium">
                      Vypracovanie dokumentácie je len prvým krokom. Dôležité je, aby spracúvanie osobných údajov prebiehalo v súlade s právnymi predpismi aj v praxi.
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed font-medium">
                      Dokumentácia musí odrážať skutočný spôsob spracúvania osobných údajov v organizácii. Ak nezodpovedá reálnemu stavu alebo sa v praxi nepoužíva, nemusí byť pri kontrole považovaná za dostatočnú.
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed font-medium">
                      V prípade zistených nedostatkov môže dozorný orgán uložiť opatrenia na nápravu alebo sankcie.
                    </p>
                  </div>
                </div>
              </div>

             <div className="relative z-10 space-y-6">
               <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-sm md:p-8">
                 <h4 className="text-2xl font-bold text-white tracking-tight leading-tight">GDPR sa týka aj vás, ak…</h4>
                 <div className="mt-6 space-y-3">
                   <div className="flex flex-col items-center gap-3 p-4 sm:p-4 sm:flex-row sm:items-center sm:gap-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><Globe size={18} /></div>
                     <div className="text-white/70 text-sm font-medium leading-relaxed text-center sm:text-left">prevádzkujete webovú stránku alebo e-shop</div>
                   </div>
                   <div className="flex flex-col items-center gap-3 p-4 sm:p-4 sm:flex-row sm:items-center sm:gap-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><Users size={18} /></div>
                     <div className="text-white/70 text-sm font-medium leading-relaxed text-center sm:text-left">ste zamestnávateľom alebo spolupracujete so SZČO </div>
                   </div>
                   <div className="flex flex-col items-center gap-3 p-4 sm:p-4 sm:flex-row sm:items-center sm:gap-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><FileText size={18} /></div>
                     <div className="text-white/70 text-sm font-medium leading-relaxed text-center sm:text-left">evidujete zákazníkov, klientov alebo obchodných partnerov</div>
                   </div>
                   <div className="flex flex-col items-center gap-3 p-4 sm:p-4 sm:flex-row sm:items-center sm:gap-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><Mail size={18} /></div>
                     <div className="text-white/70 text-sm font-medium leading-relaxed text-center sm:text-left">komunikujete e-mailom alebo spracúvate kontaktné údaje</div>
                   </div>
                   <div className="flex flex-col items-center gap-3 p-4 sm:p-4 sm:flex-row sm:items-center sm:gap-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><Target size={18} /></div>
                     <div className="text-white/70 text-sm font-medium leading-relaxed text-center sm:text-left">využívate marketing, newsletter alebo databázy kontaktov</div>
                   </div>
                   <div className="flex flex-col items-center gap-3 p-4 sm:p-4 sm:flex-row sm:items-center sm:gap-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0"><Camera size={18} /></div>
                     <div className="text-white/70 text-sm font-medium leading-relaxed text-center sm:text-left">používate kamerové, dochádzkové alebo GPS systémy</div>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 6. FORMULÁR - Closer to previous section */}
      <section id="kontaktny-formular" className="relative overflow-hidden bg-[#f8fafc]">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(247,148,29,.08),transparent_25%)]"></div>
         <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-8 text-left">
                  <div className="space-y-4">
                    <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">ozvite sa nám</div>
                    <h2 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tighter leading-tight">GDPR nemusí byť <br/><span className="text-brand-orange italic">záťaž</span></h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                      Zverte to odborníkom. Stačí pár riadkov a obratom vám navrhneme riešenie šité na mieru pre váš biznis.
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

               <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_30px_80px_-30px_rgba(0,43,78,0.28)] md:p-10">
                  <form className="space-y-4 font-sans" onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleChange}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Názov organizácie / Spoločnosti</label>
                      <input 
                        type="text" 
                        name="nazov"
                        value={formData.nazov || ''}
                        onChange={handleChange}
                        maxLength={120}
                        placeholder="Firma s.r.o." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all focus:ring-brand-blue focus:border-brand-blue" 
                        required
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
                          maxLength={20}
                          placeholder="12345678" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all focus:ring-brand-blue focus:border-brand-blue" 
                          required
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Váš e-mail</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleChange}
                          maxLength={160}
                          placeholder="vas@email.sk"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                          required
                        />
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
                          maxLength={40}
                          placeholder="+421 XXX XXX XXX" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all focus:ring-brand-blue focus:border-brand-blue" 
                          required
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
                        maxLength={2500}
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
      <MarketingFooter onNavigate={onNavigate} onRegister={onRegister} />
      <CookieConsent />

      {/* Vedeli ste, že? Modal */}
      {showVedeliSteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md md:bg-black/60 md:backdrop-blur-sm"
            onClick={() => setShowVedeliSteModal(false)}
          ></div>
          <div className="relative bg-white rounded-[1.5rem] md:rounded-[2rem] max-w-2xl w-[calc(100%-2rem)] md:w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto shadow-2xl md:mx-4">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 md:p-6 rounded-t-[1.5rem] md:rounded-t-[2rem]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/question-icon.png" alt="" aria-hidden="true" className="w-10 h-10 object-contain drop-shadow-md" />
                  <h3 className="text-lg md:text-xl font-black text-brand-navy">Vedeli ste, že?</h3>
                </div>
                <button 
                  onClick={() => setShowVedeliSteModal(false)}
                  className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="md:size-16 text-slate-600" />
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6 space-y-4">
              <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
                <p>
                  <strong>Prevádzkovateľ je povinný</strong> zabezpečiť, aby spracúvanie osobných údajov prebiehalo v súlade s Nariadením GDPR a zákonom č. 18/2018 Z. z. Zároveň musí vedieť tento súlad preukázať (zásada zodpovednosti).
                </p>
                <p>
                  Z tohto dôvodu vykonáva primeranú kontrolnú činnosť zameranú na overenie, či prijaté technické a organizačné opatrenia fungujú v praxi a či spracúvanie osobných údajov prebieha zákonným spôsobom.
                </p>
                <p>
                  Frekvencia a rozsah kontrol sa neurčujú pevne zákonom, ale závisia najmä od rizikovosti spracúvania, typu spracúvaných údajov a prostredia prevádzkovateľa. O vykonaných kontrolách sa vedie primeraná evidencia, ktorá slúži na preukázanie súladu a prijímanie nápravných opatrení.
                </p>
                <p>
                  <strong>Kontrolná činnosť preto nie je len formalitou, ale dôležitým nástrojom na zabezpečenie reálnej ochrany osobných údajov.</strong>
                </p>
              </div>
              
              <div className="pt-6 flex flex-col gap-3 md:flex-row md:gap-3">
                <button 
                  onClick={() => {
                    setShowVedeliSteModal(false);
                    scrollToForm();
                  }}
                  className="w-full bg-brand-orange text-white px-6 py-4 md:py-3 rounded-2xl font-bold uppercase text-sm md:text-sm tracking-wider shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all active:scale-95 text-center"
                >
                  Vyžiadať konzultáciu
                </button>
                <button 
                  onClick={() => setShowVedeliSteModal(false)}
                  className="w-full bg-slate-100 text-brand-navy px-6 py-4 md:py-3 rounded-2xl font-bold uppercase text-sm md:text-sm tracking-wider hover:bg-slate-200 transition-all text-center"
                >
                  Zavrieť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
