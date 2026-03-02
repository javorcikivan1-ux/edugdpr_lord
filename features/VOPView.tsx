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
  Scale,
  ShoppingCart,
  Clock,
  ArrowUpRight,
  HandCoins,
  FileSignature,
  Coffee,
  ShieldAlert
} from 'lucide-react';
import { COMMON_NAV_LINKS, NAV_CSS_CLASSES, AUTH_BUTTON_TEXT, NAV_FONT_FAMILY } from '../common/navigation';

const LOGO_WHITE = "/biele.png";
const LOGO_BLUE = "/landing.png";

interface NavItem {
  name: string;
  href?: string;
  type: string;
  active?: boolean;
  action?: () => void;
  items?: { name: string; href?: string; action?: () => void; active?: boolean }[];
}

const SlidingHeader: React.FC = () => {
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
        <span className="text-brand-orange inline-block" style={isPulsing ? { animation: 'vopPulse 800ms ease-in-out 1' } : undefined}>4 kroky</span>  od Vašich nových VOP
        </h2>
    </div>
  );
};

export const VOPView: React.FC<{ 
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
    zaujem: 'Konzultácia',
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

      (window as any).tsParticles.load("vop-nav-particles", headerConfig);
      (window as any).tsParticles.load("vop-dark-zone-particles", darkZoneConfig);
      particlesInitRef.current = true;
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          zaujem: 'Konzultácia',
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
    const el = document.getElementById('vop-formular');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = COMMON_NAV_LINKS.WITH_HREF(onNavigate, onRegister, 'vop');

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-brand-orange/30">
      
      {/* Navigation */}
      <div className={`fixed inset-x-0 z-[2000] flex justify-center transition-all duration-700 ${scrolled ? 'top-4 px-6' : 'top-0 px-0'}`}>
        <nav className={`w-full transition-all duration-700 relative overflow-visible ${scrolled ? 'bg-white/95 backdrop-blur-md max-w-[95%] h-16 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100' : 'w-full h-24 border-b border-white/5 bg-[#002b4e]'}`}>
          <div className={`absolute inset-0 z-0 pointer-events-none rounded-inherit transition-opacity duration-700 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
            <div id="vop-nav-particles" className="w-full h-full"></div>
          </div>
          <div className={`mx-auto h-full flex items-center justify-between px-10 relative z-10 transition-all duration-700 ${scrolled ? 'max-w-full' : 'max-w-7xl'}`}>
            <div className="flex items-center group cursor-pointer" onClick={onBack}>
              <img src={scrolled ? LOGO_BLUE : LOGO_WHITE} alt="Lord's Benison" className={`w-auto object-contain transition-all duration-500 ${scrolled ? 'h-10' : 'h-14'}`} />
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
            <button className={`lg:hidden p-2 transition-colors ${scrolled ? 'text-brand-navy' : 'text-white'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-[1999] bg-brand-navy transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col h-full p-10 pt-16 gap-6 text-left overflow-y-auto">
          <div className="flex items-center gap-3 mb-10"><img src={LOGO_WHITE} alt="Logo" className="h-14 w-auto object-contain" /></div>
          {navLinks.map(link => (
            <div key={link.name}>
               {link.type === 'dropdown' ? (
                <div className="space-y-4">
                  <span className="text-xl font-black uppercase tracking-widest text-brand-orange/50">{link.name}</span>
                  <div className="flex flex-col gap-4 pl-4 border-l border-white/10">
                    {link.items?.map(item => (
                      <a key={item.name} href={item.href || '#'} onClick={(e) => { if(item.action) { e.preventDefault(); item.action(); } else { setMobileMenuOpen(false); } }} className={NAV_CSS_CLASSES.MOBILE_DROPDOWN_ITEM} style={{ fontFamily: NAV_FONT_FAMILY }}>
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a key={link.name} href={link.href || '#'} onClick={(e) => { if(link.action) { e.preventDefault(); link.action(); } else { setMobileMenuOpen(false); } }} className="text-2xl font-bold uppercase tracking-widest text-white/70 hover:text-brand-orange transition-colors cursor-pointer" style={{ fontFamily: NAV_FONT_FAMILY }}>
                  {link.name}
                </a>
              )}
            </div>
          ))}
          <div className="mt-auto pb-10">
            <button 
              onClick={() => { setMobileMenuOpen(false); onAuth(); }}
              className="w-full bg-brand-orange text-white py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-2xl flex items-center justify-center gap-3"
            >  
              <LogIn size={20} /> Vstúpiť
            </button>
          </div>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="pt-40 md:pt-44 pb-10 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F7941D 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center text-left">
            <div className={`space-y-6 transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
                <div className="w-10 h-px bg-brand-orange/30"></div> Spotrebiteľská legislatíva
              </div>
             <h1 className="text-3xl md:text-5xl font-black text-[#002b4e] tracking-tighter leading-[1.1]">
  Všeobecné obchodné <br/>
  <span className="italic">
    podmienky <span className="text-brand-orange">na mieru</span>
  </span>
</h1>
              <p className="max-w-lg text-slate-500 text-lg font-medium leading-relaxed">
                Nové pravidlá pre e-shopy a zmluvy uzatvárané na diaľku platné od 1. 7. 2024. Zabezpečíme vám kompletnú legislatívnu ochranu podľa zákona č. 108/2024 Z. z.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button onClick={scrollToForm} className="bg-brand-orange text-white px-10 py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all active:scale-95">Cenová ponuka</button>
                <button onClick={() => document.getElementById('kontrola-eshopu')?.scrollIntoView({behavior: 'smooth'})} className="bg-slate-50 text-brand-navy border border-slate-200 px-10 py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-white transition-all">Bezplatná kontrola webu</button>
              </div>
            </div>

            <div className={`transition-all duration-1000 delay-300 transform ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 relative group overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Scale size={120} /></div>
                <div className="space-y-5 relative z-10">
                   <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight flex items-center gap-2 text-rose-600"><AlertCircle size={20}/> Dôležité upozornenie</h3>
                   <p className="text-sm font-bold text-slate-600 leading-relaxed text-left">
                     Od 1. júla 2024 boli zrušené zákony č. 102/2014 a č. 250/2007. Nahradil ich nový predpis č. <span className="text-brand-orange">108/2024 Z. z.</span>. Každý e-shop musí mať svoje Obchodné podmienky aktualizované v súlade s týmto zákonom.
                   </p>
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

      {/* 2. PROCES - Centrovaný nadpis s animáciou */}
      <section className="bg-white pt-12 pb-16 relative">
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="mb-12">
            <SlidingHeader />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "1", t: "Analýza e‑shopu", d: "Identifikujeme špecifiká vášho predaja a stanovíme nutný rozsah dokumentácie.", i: <Search /> },
              { n: "2", t: "Vypracovanie VOP", d: "Do 5 pracovných dní pripravíme podklady vrátane všetkých formulárov.", i: <FileSignature /> },
              { n: "3", t: "Implementácia", d: "Koncept spoločne doladíme a pripravíme na zverejnenie na váš web.", i: <ShoppingCart /> },
              { n: "4", t: "Platba po dodaní", d: "U nás platíte až po úplnom dodaní diela a vašej 100% spokojnosti.", i: <HandCoins /> }
            ].map((step, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-10 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all text-left relative group overflow-hidden">
                <div className="text-7xl font-black text-slate-100 absolute top-2 right-4 group-hover:text-brand-orange/10 transition-colors pointer-events-none">{step.n}</div>
                <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange mb-6 group-hover:bg-brand-orange group-hover:text-white transition-all">{step.i}</div>
                <h4 className="text-lg font-bold text-brand-navy mb-3">{step.t}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CO DOSTANETE */}
      <section className="bg-slate-50 relative pt-24 pb-24">
        <div className="absolute top-0 left-0 w-full h-12 bg-white z-20 -mt-px" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12 text-left">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tighter">Čo od nás dostanete?</h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">Všetky dokumenty sú spracované na mieru a zohľadňujú reálne potreby vášho podnikania.</p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                 {[
                  { t: "Bezplatná konzultácia", d: "za účelom pochopenia Vášho biznisu" },
                   { t: "VOP na mieru", d: "podľa zákona č. 108/2024 Z. z." },
                   { t: "Reklamačný poriadok", d: "podľa zákona č. 40/1964 Zb." },
                   { t: "Informačné povinnosti", d: "(najmä) v zmysle §5" },
                   { t: "Formuláre", d: "zákonné formuláre pre spotrebiteľov" },
                   { t: "Reklamačný protokol", d: "dokument o vybavení reklamácie" },
                 
                   { t: "Poučenie (príloha č. 3)", d: "o odstúpení od zmluvy" },
                   { t: "Skontrolujeme Vám e-shop", d: "kontrola legislatívnych povinností" }

                 ].map((item, idx) => (
                   <div key={idx} className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                     <div className="w-5 h-5 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange shrink-0 mt-0.5"><CheckCircle2 size={14} /></div>
                     <div>
                        <h4 className="font-bold text-brand-navy text-sm">{item.t}</h4>
                        <p className="text-slate-400 text-[11px] mt-0.5 font-medium">{item.d}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="space-y-6">
               {/* Vedeli ste, že Card */}
               <div className="group relative bg-brand-orange/5 border border-brand-orange/20 rounded-[2.5rem] p-10 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl group-hover:bg-brand-orange/20 transition-colors"></div>
                  <div className="relative z-10 space-y-4 text-left">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                           <Lightbulb size={20} />
                        </div>
                        <span className="text-brand-orange font-black text-[11px] uppercase tracking-[0.3em]">Vedeli ste, že?</span>
                     </div>
                     <p className="text-slate-500 text-sm leading-relaxed font-medium">
                        SOI je veľmi aktívny dozorný orgán. Až <span className="text-brand-orange font-bold underline decoration-brand-orange/30 underline-offset-4">60% kontrolovaných e‑shopov</span> má chyby vo VOP alebo nedostatky v informačných povinnostiach. Kopírovanie z cudzích webov sa naozaj nevypláca.
                     </p>
                  </div>
               </div>

               {/* Pravidelné aktualizácie Card */}
               <div className="group relative bg-brand-blue/5 border border-brand-blue/20 rounded-[2.5rem] p-10 overflow-hidden shadow-sm transition-all hover:shadow-lg">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-colors"></div>
                  <div className="relative z-10 space-y-6 text-left">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                              <RefreshCw size={20} />
                           </div>
                           <span className="text-brand-blue font-black text-[11px] uppercase tracking-[0.3em]">Pravidelné aktualizácie</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                           Naši klienti sú <span className="text-brand-blue font-bold">pravidelne a bezplatne</span> informovaní o všetkých zmenách (nielen) v spotrebiteľskej legislatíve.
                        </p>
                     </div>
                     
                     <div className="w-full flex items-center justify-center gap-3 bg-white/40 backdrop-blur-sm border border-brand-blue/10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-brand-blue cursor-pointer hover:bg-white/60 transition-all" onClick={scrollToForm}>
                        <ArrowUpRight size={16} className="text-brand-orange" /> Požiadať o cenovú ponuku
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TMAVÝ BLOK - KONTROLA ESHOPU */}
      <section id="kontrola-eshopu" className="bg-[#002b4e] relative overflow-hidden pt-24 pb-24">
        <div className="absolute top-0 left-0 w-full h-12 bg-slate-50 z-20 -mt-px" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
        <div id="vop-dark-zone-particles" className="absolute inset-0 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#003d6d]/40 to-brand-navy/60 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
             <div className="space-y-8 text-left">
                <div className="space-y-4">
                  <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">Audit zdarma</div>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">Skontrolujeme vám <br/><span className="text-brand-orange italic">e-shop bezplatne!</span></h2>
                  <p className="text-lg text-white/50 font-medium leading-relaxed">
                    Nie ste si istý, či váš e-shop spĺňa všetky legislatívne náležitosti? Kontaktujte nás, preveríme vaše dokumenty a výsledky obdržíte do 3 pracovných dní.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-4 text-white/80 font-bold"><Zap size={18} className="text-brand-orange" /> Všetko spolu vyriešime online</div>
                   <div className="flex items-center gap-4 text-white/80 font-bold"><Coffee size={18} className="text-brand-orange" /> ...alebo sa u nás zastavte na dobrú kávu</div>
                </div>

                <div className="flex gap-6 pt-4 border-t border-white/5">
                   <div className="group cursor-pointer" onClick={() => window.location.href="tel:+421948225713"}>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Infolinka</p>
                      <p className="text-xl font-black text-white group-hover:text-brand-orange transition-colors">0948 225 713</p>
                   </div>
                   <div className="group cursor-pointer" onClick={() => window.location.href="mailto:sluzby@lordsbenison.eu"}>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">E-mail</p>
                      <p className="text-xl font-black text-white group-hover:text-brand-orange transition-colors">sluzby@lordsbenison.eu</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                {[
                  { n: "900+", l: "Ošetrených e-shopov" },
                  { n: "10+", l: "Rokov skúseností" },
                  { n: "100%", l: "Úspešné SOI kontroly" },
                  { n: "24h", l: "Odozva na dopyt" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] text-center hover:bg-white/10 transition-all group">
                     <p className="text-3xl font-black text-brand-orange mb-1">{stat.n}</p>
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{stat.l}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 5. FORMULÁR */}
      <section id="vop-formular" className="bg-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-12 bg-[#002b4e] z-20 -mt-px" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
         
         <div className="max-w-7xl mx-auto px-10 relative z-10 pt-14 pb-20">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-8 text-left">
                  <div className="space-y-4">
                    <div className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">Ozvite sa nám</div>
                    <h2 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tighter leading-tight">VOP sú dôležitou <br/><span className="text-brand-orange italic">súčasťou kúpnej zmluvy</span></h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                      Zverte ich vypracovanie odborníkom. Stačí pár riadkov a obratom vám navrhneme riešenie šité na mieru – rýchlo a zrozumiteľne.
                    </p>
                  </div>
                  
                  {/* Informácia o bezplatnej konzultácii */}
                  <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-100 px-8 py-4 rounded-2xl font-black text-slate-400 uppercase text-[10px] tracking-widest cursor-default">
                    <CheckCircle2 size={18} className="text-brand-orange" /> Prvá konzultácia bezplatne
                  </div>
               </div>

               <div className="bg-white p-10 md:p-12 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,43,78,0.12)] border border-slate-50 relative overflow-hidden">
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

                    <div className="grid md:grid-cols-2 gap-4">
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
                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">O čo máte záujem?</label>
                        <div className="relative">
                          <select 
                            name="zaujem"
                            value={formData.zaujem}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all cursor-pointer appearance-none"
                          >
                            <option value="Konzultácia">Konzultácia</option>
                            <option value="Bezplatná kontrola e-shopu">Bezplatná kontrola e-shopu</option>
                            <option value="Cenová ponuka">Cenová ponuka</option>
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
                        placeholder="Popíšte nám Váš sortiment alebo požiadavku..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none resize-none transition-all"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-brand-orange text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <><RefreshCw className="animate-spin" size={18} /> Odosielam...</>
                      ) : (
                        <>Odoslať žiadosť <Send size={18} /></>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-3">
                      <span className="text-slate-500">Odoslaním súhlasíte so spracovaním osobných údajov. Pre bližšie informácie kliknite</span>{' '}
                      <a 
                        href="/zasady-ochrany-osobnych-udajov-gdpr.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-orange underline decoration-brand-orange/30 underline-offset-2 hover:text-brand-orange/80 transition-colors"
                      >
                        SEM
                      </a>
                    </p>
                    
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

    </div>
  );
};