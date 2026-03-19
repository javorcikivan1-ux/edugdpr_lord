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
  HandCoins,
  FileSignature,
  Scale,
  TrendingUp,
  Ban,
  Home,
  Target,
  Banknote,
  Dice1,
  Dice6
} from 'lucide-react';
import { COMMON_NAV_LINKS, NAV_CSS_CLASSES, AUTH_BUTTON_TEXT, NAV_FONT_FAMILY } from '../common/navigation';
import CookieConsent from './CookieConsent';

const LOGO_WHITE = "/biele.png";
const LOGO_BLUE = "/landing.png";
const LOGO_MOBIL = "/mobilemenu.png";

interface NavItem {
  name: string;
  href?: string;
  type: 'link' | 'dropdown';
  active?: boolean;
  action?: () => void;
  items?: { name: string; href?: string; action?: () => void; active?: boolean }[];
}

const SlidingHeaderAML: React.FC = () => {
  const headerRef = useRef<HTMLHeadingElement>(null);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const gsap = (window as any).gsap;
    if (!headerRef.current || !gsap) return;

    gsap.fromTo(headerRef.current, 
      { 
        x: -300, 
        opacity: 0 
      }, 
      { 
        x: 0, 
        opacity: 1, 
        duration: 1.2, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 95%",
        }
      }
    );
  }, []);

  useEffect(() => {
    let intervalId: number | undefined;
    let stopPulseTimeoutId: number | undefined;

    const triggerPulse = () => {
      setIsPulsing(false);
      requestAnimationFrame(() => setIsPulsing(true));
      if (stopPulseTimeoutId) window.clearTimeout(stopPulseTimeoutId);
      stopPulseTimeoutId = window.setTimeout(() => setIsPulsing(false), 800);
    };

    const startTimeoutId = window.setTimeout(() => {
      triggerPulse();
      intervalId = window.setInterval(triggerPulse, 3000);
    }, 3000);

    return () => {
      window.clearTimeout(startTimeoutId);
      if (intervalId) window.clearInterval(intervalId);
      if (stopPulseTimeoutId) window.clearTimeout(stopPulseTimeoutId);
    };
  }, []);

  return (
    <div className="overflow-hidden py-6 flex justify-center w-full">
      <style>{`@keyframes vopPulse { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.06); filter: brightness(1.05); } }`}</style>
      <h2 
        ref={headerRef}
        className="text-3xl md:text-5xl font-extrabold font-sans text-[#002b4e] tracking-tighter text-center"
      >
        <span className="text-brand-orange inline-block" style={isPulsing ? { animation: 'vopPulse 800ms ease-in-out 1' } : undefined}>4 kroky</span> k Vášmu AML
        </h2>
    </div>
  );
};

export const AMLView: React.FC<{ 
  onBack: () => void, 
  onNavigate: (view: string, path: string) => void,
  onAuth: () => void,
  onRegister: () => void
}> = ({ onBack, onNavigate, onAuth, onRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nazov: '',
    ico: '',
    email: '',
    telefon: '',
    podnikatelska_cinnost: '',
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

      (window as any).tsParticles.load("aml-nav-particles", headerConfig);
      (window as any).tsParticles.load("aml-dark-zone-particles", darkZoneConfig);
      particlesInitRef.current = true;
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value || ''
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
          podnikatelska_cinnost: '',
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
    const el = document.getElementById('aml-formular');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = COMMON_NAV_LINKS.WITH_HREF(onNavigate, onRegister, 'aml');

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-brand-orange/30 text-left">
      
      <div className={`fixed inset-x-0 z-[2000] flex justify-center transition-all duration-700 ${scrolled ? 'lg:top-4 lg:px-6 top-0 px-0' : 'top-0 px-0'}`}>
        <nav className={`w-full transition-all duration-700 relative overflow-visible ${
            scrolled 
              ? 'lg:bg-white/95 lg:backdrop-blur-md lg:max-w-[95%] lg:h-16 lg:rounded-full lg:shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:border lg:border-slate-100 bg-[#002b4e] lg:h-24 h-16 border-b border-white/5' 
              : 'w-full lg:h-24 h-16 border-b border-white/5 bg-[#002b4e]'
          }`}>
          <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
            <div id="aml-nav-particles" className="w-full h-full"></div>
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

      {/* Hero Section */}
      <section className="pt-24 md:pt-48 pb-12 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F7941D 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center text-left">
            <div className={`space-y-6 transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-brand-orange to-orange-400 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-brand-orange font-medium text-sm uppercase tracking-wider block leading-tight">Anti Money Laundering</span>
                  <span className="text-orange-200 text-xs uppercase tracking-wide block leading-tight">Zákon 297/2008 Z.z.</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#002b4e] tracking-tighter leading-[1.1]">
                Program vlastnej činnosti <br/>
                <span className="text-brand-orange italic">dokumentácia AML</span>
              </h1>
              <p className="max-w-lg text-slate-500 text-lg font-medium leading-relaxed">
                Pomôžeme vám s kompletnou AML agendou. Odhaľujte rizikové operácie a zamedzte legalizácii príjmov z trestnej činnosti odborne a v súlade s predpismi.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button onClick={scrollToForm} className="flex-1 bg-brand-orange text-white px-6 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all active:scale-95" style={{ fontFamily: NAV_FONT_FAMILY }}>Cenová ponuka AML</button>
                <button onClick={() => document.getElementById('aml-info')?.scrollIntoView({behavior:'smooth'})} className="flex-1 bg-slate-50 text-brand-navy border border-slate-200 px-6 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider hover:bg-white transition-all" style={{ fontFamily: NAV_FONT_FAMILY }}>Viac informácií</button>
              </div>
            </div>

            <div className={`transition-all duration-1000 delay-300 transform ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="space-y-6">
                <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 relative group overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ShieldAlert size={100} /></div>
                  <div className="space-y-5 relative z-10">
                    <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight relative inline-block">
                      Prečo AML od nás?
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-orange via-brand-orange/50 to-transparent"></span>
                    </h3>
                    <div className="space-y-3">
                      {[
                        "Dodanie do 5 pracovných dní",
                        "Program vlastnej činnosti na mieru",
                        "Súhlasy, poučenia a formuláre",
                        "Platíte až po dodaní dokumentov",
                        "Odborná podpora pri FSJ kontrole"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 size={18} className="text-brand-orange shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed italic border-l-2 border-brand-orange/30 pl-4 mt-4">
                      Nenechajte sa zaskočiť kontrolou zo strany Finančnej spravodajskej jednotky
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deliaca čiara */}
      <div className="max-w-7xl mx-auto px-10 relative overflow-hidden h-px">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent animate-[grow-width_1.5s_ease-out_forwards]"></div>
      </div>
      <style>{`
        @keyframes grow-width {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      {/* 2. PROCES */}
      <section className="bg-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 relative z-10 text-left">
          <div className="mb-12">
            <SlidingHeaderAML />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "1", t: "Úvodná konzultácia", d: "Zistíme vaše potreby a identifikujeme rozsah nutnej dokumentácie podľa typu podnikateľskej činnosti.", i: <Search /> },
              { n: "2", t: "Vypracovanie AML", d: "Do 5 pracovných dní spracujeme dokumentáciu AML v súlade s §20 a jej príslušné dokumenty.", i: <FileSignature /> },
              { n: "3", t: "Implementácia", d: "Pomôžeme s reálnym nasadením do praxe a postupmi pri neobvyklých operáciách a hláseniach FSJ", i: <Zap /> },
              { n: "4", t: "Platba po dodaní", d: "U nás platíte až po úplnom dodaní diela a vašej 100% spokojnosti s našou prácou. Ideme na to?", i: <HandCoins /> }
            ].map((step, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-10 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all text-left relative group overflow-hidden">
                <div className="text-7xl font-black text-slate-200 absolute top-4 right-6 group-hover:text-brand-orange/5 transition-colors pointer-events-none">{step.n}</div>
                <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange mb-6 group-hover:bg-brand-orange group-hover:text-white transition-all">{step.i}</div>
                <h4 className="text-lg font-bold text-brand-navy mb-3">{step.t}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. KTO POTREBUJE AML? + TMAVÁ SEKCIA SIKMY VSTUP */}
      <div className="bg-[#002b4e] relative overflow-hidden pt-24 pb-20">
        {/* Particles v tmavej sekcii */}
        <div id="aml-dark-zone-particles" className="absolute inset-0 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#003d6d]/40 to-brand-navy/60 pointer-events-none"></div>

        {/* Miernejsi sikmy vstup */}
        <div className="absolute top-0 left-0 w-full h-12 bg-white z-20 -mt-px" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
        
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
            <div className="space-y-8 text-left">
              <div className="space-y-4">
                <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">Povinné osoby</div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">Účtovníci & realitky, <br/><span className="text-brand-orange italic">zbystrite pozornosť!</span></h2>
                <p className="text-lg text-white/50 font-medium leading-relaxed">
                  AML zákon sa týka širokého spektra subjektov – bez ohľadu na veľkosť podniku či počet klientov. Najviac kontrolovaných subjektov avšak nájdeme práve medzi realitnými kanceláriami a účtovnými spoloťnosťami. Podstatou AML je okrem iného najmä odhaľovanie neobvyklých obchodných operácií a prania špinavých peňazí.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-6 opacity-5"><Lightbulb size={60} className="text-brand-orange"/></div>
                 <h4 className="text-brand-orange font-black text-[10px] md:text-[11px] uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2"><AlertCircle size={14}/> Vedeli ste, že?</h4>
                 <p className="text-white/70 text-xs md:text-sm leading-relaxed font-medium">
                   Zákon definuje tzv. <span className="text-brand-orange font-bold">povinné osoby</span>. Ide o subjekty vykonávajúce činnosť, pri ktorej je zvýšené riziko 
                   zneužitia na legalizáciu príjmov z trestnej činnosti. Okrem bánk či poisťovní sem patria najmä <span className="text-brand-orange font-bold">účtovníci, realitky, záložne či audítori</span>.                 </p>
              </div>
              
              <button onClick={scrollToForm} className="bg-brand-orange text-white px-6 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl shadow-orange-500/20 hover:bg-white hover:text-[#002b4e] transition-all active:scale-95 flex items-center gap-3" style={{ fontFamily: NAV_FONT_FAMILY }}>
                 Požiadať o bezplatnú konzultáciu <ArrowUpRight size={18}/>
              </button>
            </div>

            <div className="grid gap-4">
               {[
                 { t: "Banky a poisťovne", d: "...ale aj leasingové či investičné spoločnosti", i: <Building2 /> },
                 { t: "Účtovníci a audítori", d: "Daňoví, ekonomickí a organizační poradcovia", i: <HandCoins /> },
                 { t: "Realitné kancelárie", d: "Sprostredkovanie predaja and prenájmu nehnuteľností", i: <Home /> },
                 { t: "Advokáti and notári", d: "Najmä pri zakladaní firiem a správe majetku", i: <Scale /> },
                 { t: "Hazardné hry", d: "Prevádzkovatelia lotérií, herní a záložní", i: <Dice6 /> },
                 { t: "Vysoké hotovostné obchody", d: "Hotovostné obchody vo výške ≥ 15 000 €", i: <Banknote /> }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-brand-orange shadow-sm group-hover:bg-brand-orange group-hover:text-white transition-all">{item.i}</div>
                    <div className="text-left">
                       <h4 className="font-bold text-white text-base">{item.t}</h4>
                       <p className="text-white/40 text-xs mt-0.5">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. ČO JE AML A PROGRAM VLASTNEJ ČINNOSTI */}
      <section id="aml-info" className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
             <div className="space-y-8 text-left">
                <div className="space-y-4">
                  <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">Legislatívne požiadavky</div>
                  <h2 className="text-2xl md:text-4xl font-black text-brand-navy tracking-tighter leading-tight">Čo musí obsahovať <br/><span className="text-brand-orange italic">dokumentácia AML?</span></h2>
                </div>
                
                <div className="space-y-3">
                  {[
                    "identifikáciu a hodnotenie AML rizík",
                    "postup identifikácie a preverenia klienta (KYC)",
                    "rozpoznanie a posudzovanie neobvyklých operácií",
                    "postup oznámenia podozrivých operácií FSJ",
                    "určenie zodpovednej osoby za AML",
                    "pravidlá uchovávania údajov a dokumentácie",
                    "školenie a kontrolu zamestnancov"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <span className="text-brand-orange font-black text-lg">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
             </div>

             <div className="space-y-8 text-left">
                <div className="space-y-4">
                  <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">Legislatívny rámec</div>
                  <h2 className="text-2xl md:text-4xl font-black text-brand-navy tracking-tighter leading-tight">Program vlastnej <br/><span className="text-brand-orange italic">činnosti (§ 20)</span></h2>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed">
  Každá povinná osoba musí mať <span className="font-bold text-brand-orange">písomne vypracovaný</span> Program vlastnej činnosti. Tento dokument definuje vaše interné procesy a preventívne opatrenia.
</p>
                </div>
                
                <div className="bg-brand-blue/5 border border-brand-blue/10 p-6 md:p-12 rounded-[3rem] space-y-8 shadow-sm">
                   <div className="flex items-center gap-3 text-brand-blue">
                      <ShieldCheck size={28} />
                      <h3 className="text-base md:text-xl font-black uppercase tracking-tight">podnikajte bezpečne</h3>
                   </div>
                   <p className="text-slate-600 text-sm leading-relaxed font-medium">
                     Správne nastavené AML vás chráni pred pokutami až do<span className="text-brand-blue font-bold"> výšky 10.000 €</span> a zvyšuje <span className="text-brand-blue font-bold">dôveryhodnosť vašej firmy</span>.
                   </p>
                   <button onClick={scrollToForm} className="w-full bg-brand-blue text-white py-3 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider hover:bg-brand-navy transition-all shadow-xl shadow-blue-500/10" style={{ fontFamily: NAV_FONT_FAMILY }}>
                     Cenová ponuka AML
                   </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      <div className="w-full h-0.5 bg-gradient-to-r from-brand-orange to-transparent"></div>

      {/* 5. FORMULÁR */}
      <section id="aml-formular" className="py-20 bg-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-10 relative z-10 pt-0.5 md:pt-14 pb-4 md:pb-6">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
               <div className="space-y-8 text-left">
                  <div className="space-y-4">
                    <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">Ozvite sa nám</div>
                    <h2 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tighter leading-tight">Nezáväzná cenová <br/>ponuka <span className="text-brand-orange italic">AML</span></h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                      Vyplňte nám formulár, prípadne sa ozvite e-mailom alebo telefonicky. Ozveme sa vám v čo najkratšom čase.
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" 
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
                          placeholder="12345678" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" 
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
                          placeholder="vas@email.sk" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Podnikateľská činnosť</label>
                      <input 
                        type="text" 
                        name="podnikatelska_cinnost"
                        value={formData.podnikatelska_cinnost || ''}
                        onChange={handleChange}
                        placeholder="Napr. Účtovná kancelária" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" 
                        required 
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Telefónne číslo</label>
                      <input 
                        type="tel" 
                        name="telefon"
                        value={formData.telefon || ''}
                        onChange={handleChange}
                        placeholder="+421 XXX XXX XXX" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" 
                        required 
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Vaša správa (voliteľné)</label>
                      <textarea 
                        rows={2} 
                        name="message"
                        value={formData.message || ''}
                        onChange={handleChange}
                        placeholder="Popíšte Vašu požiadavku..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none resize-none transition-all"
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
                        <p className="text-sm text-emerald-600">Ďakujeme za váš záujem. Ozveme sa vám čo najskôr.</p>
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
      <CookieConsent />
    </div>
  );
};
