import React, { useState, useEffect, useRef } from 'react';
import { getPublishedTrainings } from '../lib/supabase';
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
  ArrowRight,
  HandCoins,
  FileSignature,
  Scale,
  Clock,
  ShoppingCart,
  Users,
  Star,
  TrendingUp,
  HelpCircle,
  Layers,
  Award,
  BarChart3,
  Calculator,
  Minus,
  Plus,
  Camera,
  Facebook,
  Linkedin,
  Instagram
} from 'lucide-react';
import { COMMON_NAV_LINKS, NAV_CSS_CLASSES, AUTH_BUTTON_TEXT, NAV_FONT_FAMILY } from '../common/navigation';
import CookieConsent from './CookieConsent';

const LOGO_WHITE = "/biele.png";
const LOGO_BLUE = "/landing.png";
const LOGO_MOBIL = "/mobilemenu.png";

export const TrainingsInfoView: React.FC<{ 
  onBack: () => void, 
  onNavigate: (view: string, path: string) => void,
  onAuth: () => void,
  onRegister: () => void
}> = ({ onBack, onNavigate, onAuth, onRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showExpertInfo, setShowExpertInfo] = useState(false);
  const [showCameraInfo, setShowCameraInfo] = useState(false);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loadingTrainings, setLoadingTrainings] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedTraining, setSelectedTraining] = useState<any | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // ŠTÁTY PRE SMART KALKULAČKU
  const [totalStaff, setTotalStaff] = useState(10);
  const [premiumStaff, setPremiumStaff] = useState(2);
  const [expertStaff, setExpertStaff] = useState(1);
  
  const particlesInitRef = useRef(false);

  // Funkcia na načítanie školení z databázy
  const loadTrainings = async () => {
    try {
      setLoadingTrainings(true);
      const { data, error } = await getPublishedTrainings();

      if (error) {
        console.error('Chyba pri načítaní školení:', error);
        // Ak je chyba v databáze, načítaj demo dáta
        setTrainings([
          {
            id: 1,
            title: 'GDPR Základné školenie',
            description: 'Komplexné školenie pre všetkých zamestnancov, ktorí spracúvajú osobné údaje.',
            duration: '45 minút',
            target_audience: 'Pre všetkých zamestnancov',
            price: 12,
            icon: 'shield',
            color: 'orange'
          },
          {
            id: 2,
            title: 'GDPR pre Manažérov',
            description: 'Špeciálne školenie pre vedúcich pracovníkov a manažérov.',
            duration: '60 minút',
            target_audience: 'Pre manažérov a vedenie',
            price: 18,
            icon: 'building',
            color: 'blue'
          }
        ]);
      } else {
        setTrainings(data || []);
      }
    } catch (err) {
      console.error('Neočakávaná chyba:', err);
    } finally {
      setLoadingTrainings(false);
    }
  };

  // Funkcie pre ovládanie karusela
  const nextSlide = () => {
    const itemsPerSlide = isMobile ? 1 : 2;
    const totalSlides = Math.ceil(trainings.length / itemsPerSlide);
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    const itemsPerSlide = isMobile ? 1 : 2;
    const totalSlides = Math.ceil(trainings.length / itemsPerSlide);
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    const itemsPerSlide = isMobile ? 1 : 2;
    const totalSlides = Math.ceil(trainings.length / itemsPerSlide);
    if (totalSlides <= 1) return;
    setCurrentSlide(index);
  };

  // Touch swipe funkcie
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const itemsPerSlide = isMobile ? 1 : 2;
    const totalSlides = Math.ceil(trainings.length / itemsPerSlide);

    if (isLeftSwipe && totalSlides > 1) {
      nextSlide();
    }
    if (isRightSwipe && totalSlides > 1) {
      prevSlide();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);

    // Detekcia mobilnej veľkosti obrazovky
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const scrollToHashTarget = () => {
      if (window.location.hash === '#pricing') {
        setTimeout(() => {
          const el = document.getElementById('pricing');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else if (window.location.hash === '#trainings-list') {
        setTimeout(() => {
          const el = document.getElementById('trainings-list');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    };

    scrollToHashTarget();
    window.addEventListener('hashchange', scrollToHashTarget);

    // Načítanie školení z databázy
    loadTrainings();

    if (!particlesInitRef.current && (window as any).tsParticles) {
      const config = {
        fullScreen: { enable: false },
        fpsLimit: 60,
        particles: {
          color: { value: ["#ffffff", "#F7941D"] },
          links: { color: "#ffffff", distance: 120, enable: true, opacity: 0.1, width: 1 },
          move: { enable: true, speed: 0.6, direction: "none", outModes: { default: "bounce" } },
          number: { density: { enable: true, area: 800 }, value: 100 },
          opacity: { value: 0.3 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2.5 } }
        },
        detectRetina: true
      };
      (window as any).tsParticles.load("trainings-particles", config);
      (window as any).tsParticles.load("features-particles", config);
      particlesInitRef.current = true;
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('hashchange', scrollToHashTarget);
    };
  }, []);

  // --- LOGIKA SMART MARGINAL PRICING ---
  const calculateSmartPricing = (total: number, premium: number, expert: number) => {
    if (total > 150) return { total: null, isCustom: true };

    const PREMIUM_SURCHARGE = 12; // Príplatok za oprávnenú osobu (Premium prístup)
    const EXPERT_SURCHARGE = 5; // Príplatok za expert osobu (Kamerový systém)
    
    let baseTotal = 0;
    const tiers = [
      { max: 5, price: 30 },
      { max: 10, price: 25 },
      { max: 20, price: 18 },
      { max: 50, price: 12 },
      { max: 150, price: 6 }
    ];

    let remaining = total;
    let lastMax = 0;

    for (const tier of tiers) {
      const countInTier = Math.min(remaining, tier.max - lastMax);
      if (countInTier <= 0) break;
      baseTotal += countInTier * tier.price;
      remaining -= countInTier;
      lastMax = tier.max;
    }

    // NOVÁ LOGIKA: Každý zamestnanec potrebuje školenie
    const standardCount = total - premium; // Neoprávnené osoby
    const premiumCount = premium; // Oprávnené osoby
    const expertCount = expert; // Expert osoby (navyše k premium)
    
    // Všetci zamestnanci platia base price + príplatky
    const premiumTotal = premium * PREMIUM_SURCHARGE;
    const expertTotal = expert * EXPERT_SURCHARGE;
    const finalTotal = baseTotal + premiumTotal + expertTotal;

    return { 
      total: finalTotal, 
      isCustom: false, 
      avgPrice: (finalTotal / total).toFixed(2),
      basePrice: baseTotal,
      premiumSurcharge: premiumTotal,
      expertSurcharge: expertTotal,
      standardCount: standardCount,
      premiumCount: premiumCount,
      expertCount: expertCount
    };
  };

  const pricing = calculateSmartPricing(totalStaff, premiumStaff, expertStaff);

  const navLinks = COMMON_NAV_LINKS.ACTIONS_ONLY(onNavigate, onRegister, 'trainings_info');

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-brand-orange/30 text-left">
      {/* Navigation */}
      <div className={`fixed inset-x-0 z-[2000] flex justify-center transition-all duration-700 ${scrolled ? 'lg:top-4 lg:px-6 top-0 px-0' : 'top-0 px-0'}`}>
        <nav 
          className={`w-full transition-all duration-700 relative overflow-visible ${
            scrolled 
              ? 'lg:bg-white/95 lg:backdrop-blur-md lg:max-w-[95%] lg:h-16 lg:rounded-full lg:shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:border lg:border-slate-100 bg-[#002b4e] lg:h-24 h-16 border-b border-white/5' 
              : 'w-full lg:h-24 h-16 border-b border-white/5 bg-[#002b4e]'
          }`}
        >
          {/* Centered Content Container */}
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

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <div key={link.name} className="relative group/parent">
                  {link.type === 'dropdown' ? (
                    <button 
                      className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors py-2 cursor-pointer ${scrolled ? 'text-brand-navy hover:text-brand-orange' : 'text-white/90 hover:text-brand-orange'}`}
                      style={{ fontFamily: NAV_FONT_FAMILY }}
                    >
                      {link.name} <ChevronDown size={14} className="group-hover/parent:rotate-180 transition-transform" />
                    </button>
                  ) : (
                    <button onClick={link.action} className={`inline-flex items-center relative text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer group/nav py-2 ${link.active ? 'text-brand-orange' : (scrolled ? 'text-brand-navy hover:text-brand-orange' : 'text-white/90 hover:text-white')}`} style={{ fontFamily: NAV_FONT_FAMILY }}>
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover/nav:w-full"></span>
                    </button>
                  )}

                  {link.type === 'dropdown' && (
                    <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover/parent:opacity-100 group-hover/parent:translate-y-0 group-hover/parent:pointer-events-auto transition-all duration-300">
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 min-w-[240px] flex flex-col gap-1 overflow-hidden">
                        {link.items?.map(item => (
                          <button key={item.name} onClick={item.action} className={NAV_CSS_CLASSES.DROPDOWN_ITEM} style={{ fontFamily: NAV_FONT_FAMILY }}>
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button 
                onClick={onAuth} 
                className={NAV_CSS_CLASSES.DESKTOP_AUTH_BUTTON}
                style={{ fontFamily: NAV_FONT_FAMILY }}
              >
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
      <div className={`lg:hidden fixed inset-0 z-[1999] transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} ${selectedTraining ? 'opacity-0 pointer-events-none' : ''}`}>
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
                          <button 
                            key={item.name} 
                            onClick={() => { 
                              item.action(); 
                              setMobileMenuOpen(false); 
                            }} 
                            className="block w-full text-left px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer text-sm"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button 
                      key={link.name} 
                      onClick={() => { 
                        if(link.action) { link.action(); } 
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left bg-white/5 backdrop-blur-md rounded-2xl px-5 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                      style={{ fontFamily: NAV_FONT_FAMILY }}
                    >
                      {link.name}
                    </button>
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
      <section className="pt-24 md:pt-48 pb-20 bg-[#002b4e] relative overflow-hidden">
        <div id="trainings-particles" className="absolute inset-0 z-0"></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10 text-left">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-brand-orange to-orange-400 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-brand-orange font-medium text-sm uppercase tracking-wider block leading-tight">Školenia pre zamestnancov</span>
                  <span className="text-orange-300 text-xs uppercase tracking-wide block leading-tight">Oboznamovacia povinnosť</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1]">
                Vzdelávanie<br/>
                <span className="text-brand-orange italic">zamestnancov</span>
              </h1>
              <p className="max-w-lg text-white/60 text-lg font-medium leading-relaxed">
                Predstavujeme vám inovatívny a jedinečný spôsob školenia zamestnancov v oblasti ochrany osobných údajov GDPR.
              </p>
              <p className="max-w-lg text-white/60 text-lg font-medium leading-relaxed">
                Zaregistrujte sa, priraďte zamestnancom školenia, spravujte ich certifikáty a nechajte ich podpisovať informačné povinnosti na pír klikov.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button onClick={onRegister} className="flex-1 bg-brand-orange text-white px-6 py-3 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all active:scale-95">Zaregistrovať sa</button>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} className="flex-1 bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-2xl font-bold uppercase text-xs tracking-wider hover:bg-white/20 transition-all">Prehľad funkcií</button>
              </div>
            </div>
            <div className="relative group perspective-1000 hidden lg:block">
              <div className="bg-white p-2 rounded-[3rem] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700 border border-white/5">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80" alt="Platform UI" className="rounded-[2rem] shadow-inner" />
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-[-7px] left-0 right-0 h-12 bg-white sm:hidden"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 50%, 0 78%)' }}
        ></div>
        <div
          className="absolute bottom-[-7px] left-0 right-0 h-16 bg-white hidden sm:block"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}
        ></div>
      </section>

      {/* Features Section */}
      <section id="features" className="pt-16 pb-8 lg:pb-16 bg-white text-left relative overflow-hidden">
        <div id="features-particles" className="absolute inset-0 z-0"></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tighter">Spravujte svoje GDPR povinnosti <span className="text-brand-orange">na jednom mieste</span></h2>
            <p className="text-lg text-slate-500 font-medium">Transformujte papierovú agendu na digitálnu efektivitu</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { t: "Krok 1: Zaregistrujte sa", d: "Vytvorte si firemný účet a získajte prístup ku všetkým nástrojom.", i: <LogIn /> },
              { t: "Krok 2: Nastavte licencie", d: "Nastavte si licencie podľa počtu zamestnancov a oprávnených osôb.", i: <Users /> },
              { t: "Krok 3: Pošlite pozvánky", d: "Odošlite zamestnancom pozvánky na registráciu do platformy.", i: <Send /> },
              { t: "Krok 4: Priraďte školenia", d: "Priraďte zamestnancom povinná školenia a informačné povinnosti.", i: <FileSignature /> },
              { t: "Krok 5: Sledujte priebeh", d: "Monitorujte priebeh školení a plnenie povinností v reálnom čase.", i: <BarChart3 /> },
              { t: "Krok 6: Spravujte certifikáty", d: "Stiahnite a spravujte certifikáty preukazujúce splnenie povinností.", i: <Award /> }
            ].map((feat, i) => (
              <div key={i} className="p-5 sm:p-6 lg:p-10 bg-gradient-to-br from-white to-slate-50 sm:bg-slate-50 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-200 shadow-sm sm:border-slate-100 sm:shadow-none hover:bg-white hover:shadow-xl transition-all group">
                <div className="w-11 h-11 lg:w-14 lg:h-14 bg-brand-orange/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-brand-orange mb-4 lg:mb-6 group-hover:bg-brand-orange group-hover:text-white transition-all">{feat.i}</div>
                <h4 className="text-base sm:text-lg lg:text-xl font-bold text-brand-navy mb-2 lg:mb-3">
                {feat.t.split(':').map((part, index) => 
                  index === 0 ? (
                    <span key={index} className="lg:text-brand-orange">{part}:</span>
                  ) : (
                    <span key={index}> {part}</span>
                  )
                )}
              </h4>
                <p className="text-slate-600 sm:text-slate-400 text-xs lg:text-sm leading-relaxed">{feat.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Section with Slanted Entry */}
      <div className="bg-slate-50 relative pt-16 lg:pt-32 pb-24 overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-full h-16 bg-white z-20 -mt-px" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-12 gap-20 items-start text-left">
            <div className="lg:col-span-5 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-brand-navy tracking-tighter leading-tight">Prečo používať <br/><span className="text-brand-orange italic">našu platformu?</span></h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Predstavujeme rýchly a jednoduchý spôsob, ako zabezpečiť školenia zamestnancov v oblasti GDPR každých 6 mesiacov. 
                
              </p>
              <div className="space-y-4">
                {["Každý zamestnanec má svoj účet", "Certifikáty a história školení", "Preukázateľné školenia pri GDPR kontrole", "Online podpisovanie Informačných povinností", "Notifikácie o opätovných preškoleniach"].map((txt, i) => (
                  <div key={i} className="flex items-center gap-4 text-brand-navy font-bold">
                    <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                    {txt}
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl flex items-start gap-6">
                <div className="text-left text-[#00427a]">
                  <p className="font-bold text-sm uppercase tracking-tight flex items-center gap-2">
                    <span className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-[12px] font-black">!</span>
                    Dôležité
                  </p>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed mt-2">
                    Nákup a aktiváciu ročného rozsahu zrealizujete priamo v platforme. Každý zamestnanec má v cene automaticky všetky potrebné školenia. Vytvorte si firemný účet kliknutím na tlačidlo nižšie.
                  </p>
                </div>
              </div>
              <button onClick={onRegister} className="w-full bg-brand-orange text-white py-6 rounded-3xl font-bold uppercase text-xs tracking-wider shadow-2xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group">
                Zaregistrovať firemný účet <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            <div id="pricing" className="lg:col-span-7 bg-white rounded-3xl md:rounded-[3.5rem] p-4 -mx-2 md:mx-0 md:p-10 shadow-[0_40px_100px_-20px_rgba(0,43,78,0.12)] border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange"><Calculator size={24}/></div>
                  <h3 className="text-xl md:text-2xl font-black text-brand-navy uppercase tracking-tight">Cenová kalkulačka</h3>
                </div>

                <div className="space-y-8">
                  {/* Celkový počet */}
                  <div className="space-y-4">
                    <div className="text-center sm:flex sm:justify-between sm:items-center">
                      <label className="text-[12px] font-bold text-brand-navy uppercase tracking-wider w-full text-center sm:w-auto sm:text-left sm:inline">Celkový počet zamestnancov</label>
                      <span className="text-sm font-bold text-brand-navy bg-slate-50 px-3 py-1 rounded-full border border-slate-200 hidden sm:inline">{totalStaff} osôb</span>
                    </div>
                    <div className="text-center sm:hidden">
                      <span className="text-sm font-bold text-brand-navy bg-slate-50 px-3 py-1 rounded-full border border-slate-200">{totalStaff} osôb</span>
                    </div>
                    <div className="flex justify-center sm:justify-start items-center sm:gap-4">
                      <div className="flex w-full max-w-[360px] mx-auto items-center justify-center gap-4 sm:hidden">
                        <button onClick={() => {
                          const next = Math.max(1, totalStaff - 1);
                          setTotalStaff(next);
                          if (premiumStaff > next) setPremiumStaff(next);
                          if (expertStaff > premiumStaff) setExpertStaff(Math.min(premiumStaff, next));
                        }} className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl text-center text-slate-500 hover:text-brand-orange hover:border-brand-orange hover:bg-gradient-to-br hover:from-white hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Minus size={20} className="inline-block" /></button>
                        <input type="range" min="1" max="150" value={totalStaff} onChange={e => {
                          const val = parseInt(e.target.value);
                          setTotalStaff(val);
                          if (premiumStaff > val) setPremiumStaff(val);
                          if (expertStaff > premiumStaff) setExpertStaff(Math.min(premiumStaff, val));
                        }} className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-orange" />
                        <button onClick={() => setTotalStaff(totalStaff + 1)} className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl text-center text-slate-500 hover:text-brand-orange hover:border-brand-orange hover:bg-gradient-to-br hover:from-white hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Plus size={20} className="inline-block" /></button>
                      </div>
                      <button onClick={() => {
                        const next = Math.max(1, totalStaff - 1);
                        setTotalStaff(next);
                        if (premiumStaff > next) setPremiumStaff(next);
                        if (expertStaff > premiumStaff) setExpertStaff(Math.min(premiumStaff, next));
                      }} className="hidden sm:inline-block w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl text-center text-slate-500 hover:text-brand-orange hover:border-brand-orange hover:bg-gradient-to-br hover:from-white hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Minus size={20} className="inline-block" /></button>
                      <input type="range" min="1" max="150" value={totalStaff} onChange={e => {
                        const val = parseInt(e.target.value);
                        setTotalStaff(val);
                        if (premiumStaff > val) setPremiumStaff(val);
                        if (expertStaff > premiumStaff) setExpertStaff(Math.min(premiumStaff, val));
                      }} className="hidden sm:inline-block flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-orange" />
                      <button onClick={() => setTotalStaff(totalStaff + 1)} className="hidden sm:inline-block w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl text-center text-slate-500 hover:text-brand-orange hover:border-brand-orange hover:bg-gradient-to-br hover:from-white hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Plus size={20} className="inline-block" /></button>
                    </div>
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:hidden"></div>

                  {/* Oprávnené osoby */}
                  <div className="space-y-4">
                    <div className="text-center sm:flex sm:justify-between sm:items-center">
                      <label className="text-[12px] font-bold text-brand-orange uppercase tracking-wider w-full text-center sm:w-auto sm:text-left sm:inline flex items-center justify-center sm:justify-start gap-2">
                      Počet oprávnených osôb
                      <button 
                        onClick={(e) => { e.preventDefault(); setShowExpertInfo(!showExpertInfo); }}
                        className="text-brand-orange transition-transform duration-300 hover:scale-150 sm:ml-2"
                        style={{ animation: 'pulse-opacity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                      >
                        <HelpCircle size={14} />
                      </button>
                    </label>
                      <span className="text-sm font-bold text-brand-orange bg-orange-50 px-3 py-1 rounded-full border border-orange-100 hidden sm:inline">{premiumStaff} osôb</span>
                    </div>
                    <div className="text-center sm:hidden">
                      <span className="text-sm font-bold text-brand-orange bg-orange-50 px-3 py-1 rounded-full border border-orange-100">{premiumStaff} osôb</span>
                    </div>
                    <div className="flex justify-center sm:justify-start items-center sm:gap-4">
                      <div className="flex w-full max-w-[360px] mx-auto items-center justify-center gap-4 sm:hidden">
                        <button onClick={() => {
                          const next = Math.max(0, premiumStaff - 1);
                          setPremiumStaff(next);
                          if (expertStaff > next) setExpertStaff(next);
                        }} className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl text-center text-orange-600 hover:text-brand-orange hover:border-brand-orange hover:bg-gradient-to-br hover:from-white hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Minus size={20} className="inline-block" /></button>
                        <input type="range" min="0" max={totalStaff} value={premiumStaff} onChange={e => {
                          const val = parseInt(e.target.value);
                          setPremiumStaff(val);
                          if (expertStaff > val) setExpertStaff(val);
                        }} className="flex-1 h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-brand-orange" />
                        <button onClick={() => setPremiumStaff(Math.min(totalStaff, premiumStaff + 1))} className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl text-center text-orange-600 hover:text-brand-orange hover:border-brand-orange hover:bg-gradient-to-br hover:from-white hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Plus size={20} className="inline-block" /></button>
                      </div>
                      <button onClick={() => {
                        const next = Math.max(0, premiumStaff - 1);
                        setPremiumStaff(next);
                        if (expertStaff > next) setExpertStaff(next);
                      }} className="hidden sm:inline-block w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl text-center text-orange-600 hover:text-brand-orange hover:border-brand-orange hover:bg-gradient-to-br hover:from-white hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Minus size={20} className="inline-block" /></button>
                      <input type="range" min="0" max={totalStaff} value={premiumStaff} onChange={e => {
                        const val = parseInt(e.target.value);
                        setPremiumStaff(val);
                        if (expertStaff > val) setExpertStaff(val);
                      }} className="hidden sm:inline-block flex-1 h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-brand-orange" />
                      <button onClick={() => setPremiumStaff(Math.min(totalStaff, premiumStaff + 1))} className="hidden sm:inline-block w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl text-center text-orange-600 hover:text-brand-orange hover:border-brand-orange hover:bg-gradient-to-br hover:from-white hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Plus size={20} className="inline-block" /></button>
                    </div>
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:hidden"></div>

                  {/* Expert osoby (kamery) */}
                  <div className="space-y-4">
                    <div className="text-center sm:flex sm:justify-between sm:items-center">
                      <label className="text-[12px] font-bold text-purple-600 uppercase tracking-wider w-full text-center sm:w-auto sm:text-left sm:inline flex items-center justify-center sm:justify-start gap-2">
                      Prístup ku kamerám
                      <button 
                        onClick={(e) => { e.preventDefault(); setShowCameraInfo(!showCameraInfo); }}
                        className="text-purple-600 transition-transform duration-300 hover:scale-150 sm:ml-2"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </label>
                      <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 hidden sm:inline">{expertStaff} osôb</span>
                    </div>
                    <div className="text-center sm:hidden">
                      <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">{expertStaff} osôb</span>
                    </div>
                    <div className="flex justify-center sm:justify-start items-center sm:gap-4">
                      <div className="flex w-full max-w-[360px] mx-auto items-center justify-center gap-4 sm:hidden">
                        <button onClick={() => setExpertStaff(Math.max(0, Math.min(expertStaff - 1, premiumStaff)))} className="w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl text-center text-purple-600 hover:text-purple-600 hover:border-purple-600 hover:bg-gradient-to-br hover:from-white hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Minus size={20} className="inline-block" /></button>
                        <input type="range" min="0" max={premiumStaff} value={expertStaff} onChange={e => setExpertStaff(Math.min(parseInt(e.target.value), premiumStaff))} className="flex-1 h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                        <button onClick={() => setExpertStaff(Math.min(premiumStaff, expertStaff + 1))} className="w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl text-center text-purple-600 hover:text-purple-600 hover:border-purple-600 hover:bg-gradient-to-br hover:from-white hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Plus size={20} className="inline-block" /></button>
                      </div>
                      <button onClick={() => setExpertStaff(Math.max(0, Math.min(expertStaff - 1, premiumStaff)))} className="hidden sm:inline-block w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl text-center text-purple-600 hover:text-purple-600 hover:border-purple-600 hover:bg-gradient-to-br hover:from-white hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Minus size={20} className="inline-block" /></button>
                      <input type="range" min="0" max={premiumStaff} value={expertStaff} onChange={e => setExpertStaff(Math.min(parseInt(e.target.value), premiumStaff))} className="hidden sm:inline-block flex-1 h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                      <button onClick={() => setExpertStaff(Math.min(premiumStaff, expertStaff + 1))} className="hidden sm:inline-block w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl text-center text-purple-600 hover:text-purple-600 hover:border-purple-600 hover:bg-gradient-to-br hover:from-white hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-90 group"><Plus size={20} className="inline-block" /></button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="bg-gradient-to-br from-white to-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <p className="text-[11px] sm:text-[12px] font-bold text-slate-600 uppercase tracking-wider mb-2">Priemerná investícia / os.</p>
                      <span className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-navy tracking-tighter group-hover:text-brand-orange transition-colors duration-300">
                        {pricing.isCustom ? '—' : `${pricing.avgPrice} €`}
                      </span>
                    </div>
                    <div className="bg-gradient-to-br from-brand-orange/5 to-brand-orange/10 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-2 border-brand-orange/20 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-2xl transition-colors"></div>
                      <p className="text-[11px] sm:text-[12px] font-bold text-brand-navy uppercase tracking-wider mb-2 relative z-10">Celková ročná investícia</p>
                      <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-orange tracking-tighter group-hover:scale-105 transition-transform duration-300">
                          {pricing.isCustom ? 'Dohodou' : `${pricing.total} €`}
                        </span>
                        {!pricing.isCustom && <span className="text-slate-600 font-bold text-xs sm:text-sm uppercase tracking-wider ml-2">bez DPH</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Expert Info Modal */}
      {showExpertInfo && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowExpertInfo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                <HelpCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Čo to znamená?</h3>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3">
  <p>
    <strong>Oprávnená osoba</strong> je zamestnanec alebo iná fyzická osoba,
    ktorá je na základe poverenia prevádzkovateľa oprávnená
    <strong> spracúvať osobné údaje v rozsahu svojej pracovnej činnosti</strong>
    a má pridelený prístup k informačným systémom alebo dokumentom obsahujúcim osobné údaje.
  </p>

  <p>
    Medzi typické činnosti oprávnenej osoby patrí najmä:
  </p>

  <ul className="list-disc list-inside space-y-1 ml-2">
    <li>správa personálnej a mzdovej agendy,</li>
    <li>komunikácia so zákazníkmi alebo obchodnými partnermi,</li>
    <li>práca s informačnými systémami obsahujúcimi osobné údaje (napr. CRM, ERP),</li>
    <li>spracúvanie účtovných a fakturačných dokladov,</li>
    <li>vykonávanie administratívnych alebo marketingových činností zahŕňajúcich osobné údaje.</li>
  </ul>
</div>
          </div>
        </div>
      )}

      {/* Camera Expert Info Modal */}
      {showCameraInfo && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowCameraInfo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <Camera size={20} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Čo to znamená?</h3>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3">
            <p>
  <strong>Oprávnená osoba pre kamerový systém</strong> je zamestnanec alebo iná poverená osoba,
  ktorá má na základe poverenia <strong>prístup ku kamerovému systému alebo k záznamom z kamier</strong>
  a vykonáva činnosti súvisiace s ich správou, kontrolou alebo spracúvaním.
</p>

<p>
  Medzi typické činnosti oprávnenej osoby patrí najmä:
</p>

<ul className="list-disc list-inside space-y-1 ml-2">
  <li>správa a konfigurácia kamerového systému,</li>
  <li>prístup k živému náhľadu alebo k archivovaným záznamom,</li>
  <li>vyhľadávanie, export a poskytovanie záznamov oprávneným subjektom,</li>
  <li>vedenie evidencie prístupov a vykonaných operácií,</li>
  <li>kontrola dodržiavania pravidiel ochrany osobných údajov.</li>
</ul>
              <p className="text-xs text-slate-500 italic">
                Títo zamestnanci potrebujú štandardné školenie pre oprávnené osoby + špeciálne školenie pre kamerové systémy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Trainings Section */}
      <section id="trainings-list" className="py-10 -mt-20 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden text-left pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
            {/* Oranžová deliaci čiara */}
            <div className="relative w-full flex justify-center items-center -mt-8 mb-16">
              <div className="absolute w-screen h-0.5 bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-80 left-1/2 -translate-x-1/2"></div>
            </div>
            
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-brand-navy tracking-tighter leading-[1.1]">
              Zoznam školení <br/>
              <span className="text-brand-orange">ochrany osobných údajov</span>
            </h2>
           
          </div>

          <div className="relative">
            {/* Šípky pre ovládanie - skryté na mobile */}
            {(() => {
              const itemsPerSlide = isMobile ? 1 : 2;
              const totalSlides = Math.ceil(trainings.length / itemsPerSlide);
              return totalSlides > 1;
            })() && (
              <>
                <button
                  onClick={prevSlide}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white border-2 border-slate-200 rounded-full shadow-xl flex items-center justify-center text-brand-navy hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all duration-300 hover:scale-110 -ml-6 lg:-ml-10 ${isMobile ? 'hidden' : 'flex'}`}
                  aria-label="Predchádzajúce školenie"
                >
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <button
                  onClick={nextSlide}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white border-2 border-slate-200 rounded-full shadow-xl flex items-center justify-center text-brand-navy hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all duration-300 hover:scale-110 -mr-6 lg:-mr-10 ${isMobile ? 'hidden' : 'flex'}`}
                  aria-label="Ďalšie školenie"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Karusel kontajner */}
            <div className="overflow-hidden rounded-3xl mx-2 sm:mx-10"
                 onTouchStart={onTouchStart}
                 onTouchMove={onTouchMove}
                 onTouchEnd={onTouchEnd}>
              <div 
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * (isMobile ? 100 : 50)}%)` }}
              >
                {loadingTrainings ? (
                  <div className="w-full flex-shrink-0 flex items-center justify-center py-20">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 rounded-full">
                      <RefreshCw className="animate-spin text-brand-orange" size={20} />
                      <span className="text-slate-600 font-medium">Načítavam dostupné školenia...</span>
                    </div>
                  </div>
                ) : trainings.length === 0 ? (
                  <div className="w-full flex-shrink-0 flex items-center justify-center py-20">
                    <div className="text-slate-500 text-center">
                      <AlertCircle className="mx-auto mb-4 text-slate-400" size={48} />
                      <p className="text-lg font-medium mb-2">Momentálne nie sú dostupné žiadne školenia</p>
                      <p className="text-sm">Skúste to prosím neskôr alebo nás kontaktujte.</p>
                    </div>
                  </div>
                ) : (
                  trainings.map((training, index) => (
                    <div key={training.id} className={`flex-shrink-0 px-1 sm:px-2 ${isMobile ? 'w-full' : 'w-1/2'}`}>
                      <div className="group bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-3xl overflow-hidden h-full transition-all duration-500 hover:border-brand-orange/30">
                        {/* Thumbnail */}
                        <div className="relative h-48 overflow-hidden">
                          {training.thumbnail ? (
                            <img 
                              src={training.thumbnail} 
                              alt={training.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-orange/20 to-brand-orange/5 flex items-center justify-center">
                              <ShieldCheck size={48} className="text-brand-orange/50" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 sm:p-6">
                          {/* Titul */}
                          <h3 className="text-lg sm:text-xl font-black text-brand-navy mb-3 group-hover:text-brand-orange transition-colors duration-300">
                            {training.title}
                          </h3>
                          
                          {/* Krátky popis */}
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                            {training.short_description || training.description}
                          </p>
                          
                          {/* Tlačidlo pre detail */}
                          <button 
                            onClick={() => setSelectedTraining(training)}
                            className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white py-2.5 sm:py-3 rounded-xl font-bold uppercase text-xs sm:text-sm tracking-normal shadow-lg hover:shadow-brand-orange/25 active:scale-[0.98] transition-all hover:from-brand-orange/95 hover:to-brand-orange/85 flex items-center justify-center gap-2"
                          >
                            Zobraziť detail
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Indikátory pre karusel */}
            {(() => {
              const itemsPerSlide = isMobile ? 1 : 2;
              const totalSlides = Math.ceil(trainings.length / itemsPerSlide);
              return totalSlides > 1;
            })() && (
              <div className="flex justify-center gap-2 mt-8">
                {(() => {
                  const itemsPerSlide = isMobile ? 1 : 2;
                  const totalSlides = Math.ceil(trainings.length / itemsPerSlide);
                  return Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'bg-brand-orange w-8' 
                          : 'bg-slate-300 hover:bg-slate-400 w-2'
                      }`}
                      aria-label={`Prejsť na školenie ${index + 1}`}
                    />
                  ));
                })()}
              </div>
            )}
          </div>

                  </div>
      </section>

      <footer id="footer-info" className="bg-[#001c36] text-white py-12 relative overflow-hidden border-t border-white/5 text-center lg:text-left">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-10">
            <div className="lg:col-span-4 space-y-6 text-left">
              <div className="flex flex-col items-center gap-6">
                 <div className="flex items-center justify-center text-brand-orange border-white/10 overflow-hidden">
                    <img src={LOGO_WHITE} alt="Lord's Benison" className="h-14 w-auto object-contain" />
                 </div>
                 <div className="flex gap-3 justify-center">
                   <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-orange transition-all">
                     <Facebook size={18} />
                   </a>
                   <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-orange transition-all">
                     <Linkedin size={18} />
                   </a>
                   <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-orange transition-all">
                     <Instagram size={18} />
                   </a>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-5 pl-0 lg:pl-12 text-center lg:text-left">
               <div className="text-brand-orange font-bold text-xs uppercase tracking-wider text-center lg:text-left">PRÍSTUP DO PORTÁLU</div>
               <div className="flex flex-col space-y-3 items-center lg:items-start">
                  <a 
                    href="#" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      onAuth(); 
                    }}
                    className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                  >
                    Prihlásenie
                  </a>
                  <a 
                    href="#" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      onRegister(); 
                    }}
                    className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                  >
                    Registrácia
                  </a>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-5 text-center lg:text-left">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brand-orange text-center lg:text-left">RÝCHLE ODKAZY</h4>
              <div className="flex flex-col space-y-3 items-center lg:items-start">
                 <a 
                   href="/kontakt" 
                   onClick={(e) => { 
                     e.preventDefault(); 
                     onNavigate('contact', '/kontakt'); 
                   }}
                   className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                 >
                   Kontakt
                 </a>
                 <a 
                   href="/skolenia#pricing" 
                   onClick={(e) => { 
                     e.preventDefault(); 
                     if (window.location.pathname === '/skolenia') {
                       if (window.location.hash !== '#pricing') {
                         window.location.hash = 'pricing';
                       } else {
                         document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                       }
                     } else {
                       onNavigate('trainings_info', '/skolenia#pricing'); 
                     }
                   }}
                   className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                 >
                   Cenník
                 </a>
                 <a 
                   href="/zasady-ochrany-osobnych-udajov-gdpr.html" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                 >
                   Zásady ochrany osobných údajov
                 </a>
                 <a 
                   href="/podmienky-pouzivania.html" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                 >
                   Podmienky používania
                 </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex justify-center lg:justify-start items-center gap-8">
            <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-brand-orange">LORD'S BENISON S.R.O. | Váš partner vo svete podnikania</p>
          </div>
        </div>
      </footer>

      {/* Modal pre detail školenia */}
      {selectedTraining && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[5000] flex items-start justify-center p-4 pt-20 sm:pt-24">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl my-4">
            {/* Header */}
            <div className="relative h-64 overflow-hidden">
              {selectedTraining.thumbnail ? (
                <img 
                  src={selectedTraining.thumbnail} 
                  alt={selectedTraining.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-orange/20 to-brand-orange/5 flex items-center justify-center">
                  <ShieldCheck size={80} className="text-brand-orange/50" />
                </div>
              )}
              <button 
                onClick={() => setSelectedTraining(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <X size={24} className="text-slate-700" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-3xl font-black text-brand-navy mb-4">
                  {selectedTraining.title}
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-4 py-2 bg-brand-orange/10 text-brand-orange text-sm font-bold rounded-lg uppercase border border-brand-orange/10">
                    {selectedTraining.category || 'GDPR'}
                  </span>
                  {selectedTraining.duration_minutes && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={16} />
                      <span className="text-sm font-medium">{selectedTraining.duration_minutes} minút</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Popis */}
              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-3">Popis školenia</h3>
                <p className="text-slate-600 leading-relaxed">
                  {selectedTraining.description || selectedTraining.full_description}
                </p>
              </div>

              {/* Cieľové skupiny */}
              {selectedTraining.target_audience && (
                <div>
                  <h3 className="text-xl font-bold text-brand-navy mb-3">Pre koho je školenie určené</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedTraining.target_audience}
                  </p>
                </div>
              )}

              {/* Výučebné ciele */}
              {selectedTraining.learning_objectives && selectedTraining.learning_objectives.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-brand-navy mb-3">Čo sa naučíte</h3>
                  <ul className="space-y-2 mb-6">
                    {selectedTraining.learning_objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-brand-orange flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{objective}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Oddelenie pre certifikát */}
                  <div className="border-t border-slate-200 pt-4">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <Award size={20} className="text-brand-orange flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 font-medium">Certifikát o úspešnom absolvovaní školenia</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Ak nie sú definované výučebné ciele, stále ukážeme certifikát */}
              {(!selectedTraining.learning_objectives || selectedTraining.learning_objectives.length === 0) && (
                <div>
                  <h3 className="text-xl font-bold text-brand-navy mb-3">Čo získate</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <Award size={20} className="text-brand-orange flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600 font-medium">Certifikát o úspešnom absolvovaní školenia</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Moduly školenia */}
              {selectedTraining.modules && selectedTraining.modules.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-brand-navy mb-3">Osnova školenia</h3>
                  <div className="space-y-3">
                    {selectedTraining.modules.map((module: any, index: number) => (
                      <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-2">
                          {index + 1}. {module.title}
                        </h4>
                        <p className="text-slate-600 text-sm">
                          {module.description}
                        </p>
                        {module.duration_minutes && (
                          <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
                            <Clock size={14} />
                            <span>{module.duration_minutes} minút</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {selectedTraining.faq && selectedTraining.faq.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-brand-navy mb-3">Časté otázky</h3>
                  <div className="space-y-4">
                    {selectedTraining.faq.map((faq: any, index: number) => (
                      <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-2">{faq.question}</h4>
                        <p className="text-slate-600 text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to action */}
              <div className="bg-gradient-to-r from-brand-orange/10 to-brand-orange/5 rounded-2xl p-6 border border-brand-orange/20">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-brand-navy mb-3">Môžeme začať?</h3>
                  <p className="text-slate-600 mb-6">
                    Zaregistrujte sa a získajte prístup k tomuto školeniu
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => {
                        setSelectedTraining(null);
                        onRegister();
                      }}
                      className="flex-1 bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-brand-orange/25 active:scale-[0.98] transition-all hover:from-brand-orange/95 hover:to-brand-orange/85 sm:max-w-[200px]"
                    >
                      Registrovať sa
                    </button>
                    <button 
                      onClick={() => setSelectedTraining(null)}
                      className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-slate-300 transition-all sm:max-w-[200px]"
                    >
                      Späť
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <CookieConsent />
    </div>
  );
};
