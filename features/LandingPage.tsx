import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Zap, 
  Users, 
  Coffee, 
  Star,
  Quote,
  Menu,
  X,
  ArrowRight,
  Shield,
  FileText,
  Briefcase,
  Search,
  GraduationCap,
  ShoppingCart,
  DollarSign,
  MousePointer2,
  Lightbulb,
  Globe,
  Instagram,
  Linkedin,
  Facebook,
  AlertCircle,
  Clock,
  ExternalLink,
  LogIn,
  ChevronDown,
  UserPlus,
  ChevronLeft,
  Layout,
  Trophy,
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

// Modal komponent pre galériu obrázkov
const ImageGalleryModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    "/obrazok1.png",
    "/obrazok2.png",
    "/obrazok3.png",
    "/obrazok4.png",
    "/obrazok5.png",
    "/obrazok6.png",
    "/obrazok7.png"
  ];

  if (!isOpen) return null;

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[5001]"
      >
        <X size={32} />
      </button>

      <div className="relative w-full max-w-6xl aspect-video flex items-center justify-center group" onClick={e => e.stopPropagation()}>
        {/* Šípka vľavo */}
        <button 
          onClick={prev}
          className="absolute left-4 md:-left-20 p-4 bg-black/60 hover:bg-brand-orange text-white rounded-2xl transition-all shadow-2xl backdrop-blur-sm"
        >
          <ChevronLeft size={32} />
        </button>

        {/* Hlavný obrázok */}
        <div className="w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative">
          <img 
            src={images[currentIndex]} 
            alt={`Náhľad ${currentIndex + 1}`}
            className="w-full h-full object-contain animate-in zoom-in-95 fade-in duration-500"
            onError={(e) => {
               (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80";
            }}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
             <p className="text-xs font-bold text-white uppercase tracking-wider">Snímka {currentIndex + 1} / {images.length}</p>
          </div>
        </div>

        {/* Šípka vpravo */}
        <button 
          onClick={next}
          className="absolute right-4 md:-right-20 p-4 bg-black/60 hover:bg-brand-orange text-white rounded-2xl transition-all shadow-2xl backdrop-blur-sm"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Bodky / Miniatúry */}
      <div className="absolute bottom-10 flex gap-3">
        {images.map((_, i) => (
          <button 
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
            className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-10 bg-brand-orange' : 'w-2 bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const LandingPage: React.FC<{ 
  onAuth: () => void, 
  onRegister: () => void,
  onNavigate: (view: string, path: string) => void
}> = ({ onAuth, onRegister, onNavigate }) => {
  const [expandedTestimonials, setExpandedTestimonials] = useState<{[key: number]: boolean}>({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [showVedeliSteModal, setShowVedeliSteModal] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  
  const toggleTestimonial = (index: number) => {
    setExpandedTestimonials(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const nextTestimonial = () => {
    const isMobile = window.innerWidth < 768;
    const maxIndex = Math.max(0, testimonials.length - (isMobile ? 1 : 3));
    setCurrentTestimonialIndex((prev) => (prev + 1 > maxIndex) ? 0 : prev + 1);
  };

  const prevTestimonial = () => {
    const isMobile = window.innerWidth < 768;
    const maxIndex = Math.max(0, testimonials.length - (isMobile ? 1 : 3));
    setCurrentTestimonialIndex((prev) => (prev - 1 < 0) ? maxIndex : prev - 1);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonialIndex(index);
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
    setSlideProgress(0); // Reset progress when manually changing slide
  };

  // Touch/swipe handlers for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextTestimonial();
    }
    if (isRightSwipe) {
      prevTestimonial();
    }
  };
  
  const heroSlides = [
    {
      title: "Platforma, ktorá myslí za vás.",
      highlight: "Platforma",
      subtitle: "Školenia sú dôležitou súčasťou GDPR",
      description: "Vďaka našej školiacej platforme budete mať kompletný prehľad o stave vzdelávania Vašich zamestnancov.",
      target: { view: 'trainings_info', path: '/skolenia' }
    },
    {
      title: "GDPR dokumentácia na mieru za rozumnú cenu",
      highlight: "GDPR",
      subtitle: "Využite teraz našu bezplatnú konzultáciu",
      description: "S nami zistíte, nakoľko sa Vás GDPR reálne týka a ako sa chrániť pred zbytočnými pokutami.",
      target: { view: 'gdpr', path: '/gdpr' }
    },
    {
      title: "Obchodné podmienky podľa zák. 108/2024 Z. z.",
      highlight: "108/2024",
      subtitle: "Máte e-shop, alebo uzatvárate zmluvy na diaľku?",
      description: "Vypracujeme Vám na mieru šité Obchodné podmienky, ktoré budú chrániť nielen kupujúceho, ale aj Váš e-shop.",
      target: { view: 'vop', path: '/vop' }
    }
  ];

  const testimonials = [
    {
      name: "Ivana Mišutková",
      role: "FIDELIS SLOVAKIA s.r.o.",
      text: "Ďakujeme za ústretovú a profesionálnu spoluprácu. Keď sme si vybrali spoločnosť LORD'S BENISON s.r.o. urobili sme vynikajúce rozhodnutie. Skvelý prístup, ochota, spracovanie dokumentácie, ako mailom, tak aj telefonicky. Pani Urbowicz je milá, ústretová, všetko nám bez problémov vysvetlila aj poradila. Spoluprácu s LORD'S BENISON s.r.o. určite odporúčam.",
      logoUrl: "https://i.ibb.co/nqXkKg52/hromex.png",
      avatar: "IM"
    },

   
  {
      name: "Ing. Jozef Mašura",
      role: "AutoHouse.sk s.r.o.",
      text: "Ocenujem profesionalny pristup. Vzdy vysvetlene kroky, zodpovedane otazky, vyborna komunikacia mailom alebo po telefone, dodrzane terminy. Vypracovane GDPR, vzdy zapracovane zmeny v zakonoch, pripomenutie k upravam na e-shope. Taktiez aktualizacia VOP podmienok so vsetkymi potrebnymi nalezitostami. Odporucam. Vedia co robia.",
      logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/Bez-nazvu-0.png",
      avatar: "JM"
    },

  {
    name: "Ing. Milan Svitana",
    role: "Z&H Lean, s. r. o.",
    text: "Spoluprácu považujem za veľkú podporu. Komunikácia zo strany firmy je profesionálna, kompetentná a ľudská. Prístup hodnotím ako veľmi prozákaznícky. Ak potrebujete poriešiť zákonné povinnosti, pri tejto firme chybu neurobíte.",
    logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/zahean_imgupscaler.ai_Upscaler_2K.png",
    avatar: "MS"
  },
  {
    name: "Ing. Peter Ferčer",
    role: "Dynamic Office s.r.o.",
    text: "S firmou som bol maximálne spokojný. Potreboval som vypracovať obchodné podmienky a GDPR pre svoj e-shop www.rainpro.sk a všetko prebehlo rýchlo, presne a bez zbytočných komplikácií. Oceňujem ich odborné znalosti, jasnú komunikáciu a ochotu vysvetliť mi všetky detaily. Dokumenty boli pripravené na mieru môjmu podnikaniu a v súlade s platnou legislatívou. Profesionálny prístup, férové ceny a ľudská komunikácia – určite odporúčam každému, kto hľadá spoľahlivého partnera pre právne náležitosti svojho podnikania.",
    logoUrl: "https://i.ibb.co/chhNWdzS/Bez-nazvu-0-1.png",
    avatar: "PF"
  },
  
  {
    name: "Bc. Timothée Volpi",
    role: "JustCreate3D s. r. o.",
    text: "Firma LORD´S BENISON ma telefonicky oslovila ohľadom vypracovania dokumentácie GDPR. Nechal som si v tejto veci poradiť a dobre som urobil 😊. Cena mi prišla férová. S komunikáciou a odbornosťou som nadmieru spokojný. Dodávateľ dokumentácie proaktívne sleduje nové zákony a zabezpečuje aby bol môj e-shop kontinuálne legislatívne zabezpečený, čo vnímam ako najväčšie pozitívum tejto spolupráce. Prácu s touto spoločnosťou vrelo odporúčam.",
    logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/just.png",
    avatar: "TV"
  },
  {
    name: "Ing. Katka Ličková",
    role: "Katkaparfumery s. r. o.",
    text: "So spoločnosťou LORD´S BENISON, konkrétne s pánom Javorčíkom som bola nadmieru spokojná. Pripravil mi Obchodné podmienky pre e-shop na mieru a bol maximálne ústretový, promptný a mohla som sa spoľahnúť na vysokú odbornosť a jeho rady. Každému odporúčam, či už riešite akúkoľvek legislatívu pre Vaše podnikanie, alebo len potrebujete odborné poradenstvo v danej oblasti. Určite ostávam verný klient a rada sa na Vás obrátim aj v budúcnosti.",
    logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/katka.png",
    avatar: "KL"
  },


 {
    name: "Ing. Vladimír Michal",
    role: "ARTFORUM spol. s r.o.",
    text: "Za našu spoločnosť hodnotím spoluprácu pri vypracovaní VOP pre náš eshop vysoko pozitívne. LORD'S Benison prostredníctvom pána Javorčíka vyniká rýchlosťou, komunikáciou aj ľudským prístupom.",
    logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/artforum.png",
    avatar: "VM"
  },

  {
    name: "www.vrecko.sk",
    role: "Black Shark s.r.o.",
    text: "Radi by sme vyjadrili svoju maximálnu spokojnosť s prácou pána Javorčíka z firmy LORD´S BENISON s.r.o. za jeho profesionálny prístup pri vypracovaní obchodných podmienok pre náš e-shop www.vrecko.sk. Pán Javorčík preukázal výnimočné odborné znalosti a starostlivosť o detaily. Komunikácia bola vždy promptná a príjemná a riešenia presne reflektovali charakter nášho podnikania. Služby môžeme s radosťou odporučiť všetkým, ktorí hľadajú spoľahlivého odborníka.",
    logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/Bez-nazvu-0_imgupscaler.ai_Upscaler_2K-1.png",
    avatar: "VS"
  },
  {
    name: "Ing. Marián Hromádka",
    role: "HROMEX s. r. o.",
    text: "Spoločnosť, ktorá aj reálne plní to, k čomu sa zmluvne zaviaže. Veľmi ochotný prístup zamestnancov, odborne nám všetko vysvetlili a podklady doručili v stanovenom termíne. Odporúčam aj iným firmám.",
    logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/hromex-2.png",
    avatar: "MH"
  },
  {
    name: "Ing. Jozef Opálený",
    role: "Debongré, s.r.o.",
    text: "Spolupráca bola na vysoko profesionálnej úrovni, vecná, presná a veľmi ústretová. Pani Urbowicz môžem všetkým potenciálnym klientom len odporučiť, všetko prebehlo perfektne.",
    logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/debomgre.png",
    avatar: "JO"
  },
  {
    name: "Milan Orto",
    role: "BOATS Slovakia",
    text: "Ďakujeme za profesionálny prístup a odborné rady, perfektná komunikácia telefonicky aj e-mailom. Ochotne všetko vysvetlili a expresne podklady dodali, odporúčam aj iným firmám.",
    logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/eclny.sk_.png",
    avatar: "MO"
  },
  {
    name: "Ing. M. Sütöová",
    role: "MARSUT",
    text: "V mene svojom aj ostatných 9 spoločností sa Vám chcem poďakovať za spoluprácu pri vypracovaní internej smernice GDPR. Oceňujem zodpovedný, ústretový prístup a ochotu pri nekonečnom vysvetľovaní. Som rada, že sme sa rozhodli pre Vás. Ďakujeme a tešíme sa na ďalšiu spoluprácu.",
    logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/sutova.png",
    avatar: "MS"
  },
  {
    name: "www.jumikos.sk",
    role: "JUMIKOS, s.r.o.",
    text: "Z hľadiska odbornosti, ústretovosti a komunikácie úplná spokojnosť. Ak hľadáte firmu na dlhodobú spoluprácu v GDPR, tak LORD´S BENISON môžem všetkým len odporučiť.",
    logoUrl: "https://lordsbenison.sk/wp-content/uploads/2026/02/jumikos.png",
    avatar: "JU"
  }

  
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    
    // Reset progress when slide changes
    setSlideProgress(0);
    
    // Progress bar animation - update every 100ms for smooth animation
    const progressInterval = setInterval(() => {
      setSlideProgress(prev => {
        if (prev >= 100) {
          return 0; // Reset when reaching 100%
        }
        return prev + (100 / 80); // 8000ms / 100ms = 80 steps, so 100/80 = 1.25% per step
      });
    }, 100);
    
    // Slide change interval
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
      setSlideProgress(0); // Reset progress when slide changes
    }, 8000);

    if ((window as any).tsParticles) {
      // HEADER PARTICLES KONFIGURÁCIA
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

      // HLAVNÁ KONFIGURÁCIA BEZ ČIAR (LINKS: ENABLE: FALSE)
      const heroParticlesConfig = {
        fpsLimit: 60,
        interactivity: {
          events: { onHover: { enable: true, mode: "repulse" }, onClick: { enable: true, mode: "push" }, resize: true },
          modes: { 
            repulse: { distance: 100, duration: 0.4 },
            push: { quantity: 4 } 
          }
        },
        particles: {
          color: { value: ["#ffffff", "#F7941D"] },
          links: { enable: false }, // TU SME ODSTRÁNILI ČIARY
          move: { enable: true, speed: 0.7, direction: "none", outModes: { default: "bounce" } },
          number: { density: { enable: true, area: 800 }, value: 120 }, // Mierne viac bodiek pre dynamiku
          opacity: { value: 0.3 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2.5 } }
        },
        detectRetina: true
      };

      const darkParticlesConfig = {
        fpsLimit: 60,
        interactivity: {
          events: { onHover: { enable: true, mode: "repulse" }, onClick: { enable: true, mode: "push" }, resize: true },
          modes: { 
            repulse: { distance: 100, duration: 0.4 },
            push: { quantity: 4 } 
          }
        },
        particles: {
          color: { value: ["#ffffff", "#F7941D"] },
          links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.1, width: 1 },
          move: { enable: true, speed: 0.7, direction: "none", outModes: { default: "bounce" } },
          number: { density: { enable: true, area: 800 }, value: 30 },
          opacity: { value: 0.3 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2.5 } }
        },
        detectRetina: true
      };

      const lightParticlesConfig = {
        fpsLimit: 60,
        particles: {
          color: { value: "#F7941D" },
          move: { enable: true, speed: 0.4, direction: "top", outModes: { default: "out" } },
          number: { density: { enable: true, area: 800 }, value: 12 },
          opacity: { value: 0.06 },
          shape: { type: "circle" },
          size: { value: { min: 2, max: 4 } }
        },
        detectRetina: true
      };

      (window as any).tsParticles.load("landing-nav-particles", headerConfig);
      (window as any).tsParticles.load("hero-particles", heroParticlesConfig);
      (window as any).tsParticles.load("dark-particles-why", darkParticlesConfig);
      (window as any).tsParticles.load("dark-particles-vop", darkParticlesConfig);
      (window as any).tsParticles.load("light-particles-platform", lightParticlesConfig);
      (window as any).tsParticles.load("light-particles-gdpr", lightParticlesConfig);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(progressInterval);
      clearInterval(slideInterval);
    };
  }, [heroSlides.length]);

  const navLinks: NavItem[] = [
    { name: 'Školenia', action: () => onNavigate('trainings_info', '/skolenia'), type: 'link' },
    { 
      name: 'Služby', 
      href: '#', 
      type: 'dropdown',
      items: [
        { name: 'GDPR dokumentácia', action: () => onNavigate('gdpr', '/gdpr') },
        { name: 'Obchodné podmienky', action: () => onNavigate('vop', '/vop') },
        { name: 'AML dokumentácia', action: () => onNavigate('aml', '/aml') }
      ]
    },
    { name: 'Registrácia', href: '#', type: 'link', action: onRegister },
    { name: 'Cenník', href: '#platforma', action: () => { document.getElementById('platforma')?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 500); }, type: 'link' },
    { name: 'Kontakt', href: '/kontakt', type: 'link', action: () => onNavigate('contact', '/kontakt') },
  ];

  const DidYouKnowCard = ({ children, onClick, showMoreInfo = true }: { children: React.ReactNode, onClick?: () => void, showMoreInfo?: boolean }) => (
    <div 
      className="relative bg-brand-orange/5 border border-brand-orange/20 rounded-[2.5rem] p-6 md:p-10 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl"></div>
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Lightbulb size={20} />
          </div>
          <span className="text-brand-orange font-black text-sm uppercase">Vedeli ste, že?</span>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">
          {children}
        </p>
        {showMoreInfo && (
          <div className="flex items-center gap-2 text-brand-orange text-sm font-medium">
            <span className="underline decoration-brand-orange/30 underline-offset-4">Kliknite pre viac informácií</span>
            <ChevronRight size={16} />
          </div>
        )}
      </div>
    </div>
  );

  const scrollToForm = () => {
    setTimeout(() => {
      const formElement = document.getElementById('kontaktny-formular');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen font-sans overflow-x-hidden scroll-smooth bg-white text-left">
      <ImageGalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />

      {/* Navigation */}
      <div className={`fixed inset-x-0 z-[2000] flex justify-center transition-all duration-700 ${scrolled ? 'lg:top-4 lg:px-6 top-0 px-0' : 'top-0 px-0'}`}>
        <nav 
          className={`w-full transition-all duration-700 relative overflow-visible ${
            scrolled 
              ? 'lg:bg-white/95 lg:backdrop-blur-md lg:max-w-[95%] lg:h-16 lg:rounded-full lg:shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:border lg:border-slate-100 bg-[#002b4e] lg:h-24 h-16 border-b border-white/5' 
              : 'w-full lg:h-24 h-16 border-b border-white/5 bg-[#002b4e]'
          }`}
        >
          {/* Particles Container */}
          <div 
            id="landing-nav-particles" 
            className={`absolute inset-0 z-0 pointer-events-none transition-all duration-700 ${scrolled ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
          ></div>

          {/* Centered Content Container */}
          <div className={`mx-auto h-full flex items-center justify-between px-10 relative z-10 transition-all duration-700 ${scrolled ? 'max-w-full' : 'max-w-7xl'}`}>
            {/* Logo Section */}
            <div className="flex items-center group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
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
                    <a 
                      href={link.href} 
                      onClick={(e) => { if(link.action) { e.preventDefault(); link.action(); } }}
                      className={`inline-flex items-center relative text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer group/nav py-2 ${link.active ? 'text-brand-orange' : (scrolled ? 'text-brand-navy hover:text-brand-orange' : 'text-white/90 hover:text-white')}`}
                      style={{ fontFamily: NAV_FONT_FAMILY }}
                    >
                      {link.name === 'Školenia' ? (
                        <>
                          <span style={{ textTransform: 'none' }}>PLATFORMA</span>&nbsp;<span className="text-brand-orange italic text-base" style={{ textTransform: 'none' }}>Complyo</span>
                        </>
                      ) : (
                        link.name
                      )}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover/nav:w-full"></span>
                    </a>
                  )}

                  {link.type === 'dropdown' && (
                    <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover/parent:opacity-100 group-hover/parent:translate-y-0 group-hover/parent:pointer-events-auto transition-all duration-300">
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
                      className="block w-full text-left bg-white/5 backdrop-blur-md rounded-2xl px-5 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                      style={{ fontFamily: NAV_FONT_FAMILY }}
                    >
                      {link.name === 'Školenia' ? (
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

      {/* Hero Section */}
      <section className="relative h-screen min-h-[750px] w-full flex items-center bg-[#002b4e] overflow-hidden">
        <div id="hero-particles" className="absolute inset-0 z-0 w-full h-full"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#003d6d]/40 via-transparent to-[#002b4e] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full h-full flex lg:items-center pt-24 lg:pt-0">
          <div className="max-w-4xl h-[400px] relative w-full text-left">
            {heroSlides.map((slide, idx) => (
              <div key={idx} className={`absolute inset-0 flex flex-col justify-start pt-4 transition-all duration-1000 transform ${activeSlide === idx ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}>
                {idx === 0 && (
                  <>
                    <h2 className="text-3xl sm:text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-6 drop-shadow-2xl">
                       <span className="sm:hidden">
                         {"GDPR platforma, ktorá myslí za vás".split(' ').map((word, i) => (
                           <React.Fragment key={i}>
                             {word === 'myslí' && <br className="hidden sm:inline" />}
                             <span
                               className={
                                 word.toUpperCase().includes("PLATFORMA")
                                   ? "text-brand-orange"
                                   : "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                               }
                             >
                               {word}{' '}
                             </span>
                           </React.Fragment>
                         ))}
                       </span>
                       <span className="hidden sm:inline">
                         {"Platforma, ktorá myslí za vás.".split(' ').map((word, i) => (
                           <React.Fragment key={i}>
                             {word === 'myslí' && <br />}
                             <span
                               className={
                                 word.toUpperCase().includes("PLATFORMA")
                                   ? "text-brand-orange"
                                   : "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                               }
                             >
                               {word}{' '}
                             </span>
                           </React.Fragment>
                         ))}
                       </span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/40 font-medium mb-10 max-w-xl text-left border-l-[3px] border-brand-orange/30 pl-3">
                      <span className="sm:hidden">Vďaka našej platforme <span className="text-brand-orange text-sm italic font-bold">Complyo</span> vyriešite legislatívne požiadavky GDPR rýchlo, efektívne a preukázateľne.</span>
                      <span className="hidden sm:inline">Vďaka našej platforme <span className="text-brand-orange text-xl italic font-bold">Complyo</span> vyriešite legislatívne požiadavky GDPR rýchlo, efektívne a preukázateľne.</span>
                    </p>
                  </>
                )}
                {idx === 1 && (
                  <>
                    <h2 className="text-3xl sm:text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-6 drop-shadow-2xl">
                       <span className="sm:hidden">
                         {"Profesionálne služby v oblasti GDPR".split(' ').map((word, i) => (
                           <React.Fragment key={i}>
                             <span
                               className={
                                 word.toUpperCase().includes("GDPR")
                                   ? "text-brand-orange"
                                   : "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                               }
                             >
                               {word}{' '}
                             </span>
                           </React.Fragment>
                         ))}
                       </span>
                       <span className="hidden sm:inline">
                         {"GDPR dokumentácia na mieru a rozumnú cenu".split(' ').map((word, i) => (
                           <React.Fragment key={i}>
                             <span
                               className={
                                 word.toUpperCase().includes("GDPR")
                                   ? "text-brand-orange"
                                   : "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                               }
                             >
                               {word}{' '}
                             </span>
                           </React.Fragment>
                         ))}
                       </span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/40 font-medium mb-10 max-w-xl text-left border-l-[3px] border-brand-orange/30 pl-3">
                      <span className="sm:hidden">S nami zistíte, nakoľko sa Vás GDPR reálne týka a ako sa chrániť pred zbytočnými pokutami.</span>
                      <span className="hidden sm:inline">S nami zistíte, nakoľko sa Vás GDPR reálne týka a ako sa chrániť pred zbytočnými pokutami.</span>
                    </p>
                  </>
                )}
                {idx === 2 && (
                  <>
                    <h2 className="text-3xl sm:text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-6 drop-shadow-2xl">
                       <span className="sm:hidden">
                         {"Obchodné podmienky zák. 108/2024 Z. z.".split(' ').map((word, i) => (
                           <React.Fragment key={i}>
                             <span
                               className={
                                 word.toUpperCase().includes("108/2024")
                                   ? "text-brand-orange"
                                   : "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                               }
                             >
                               {word}{' '}
                             </span>
                           </React.Fragment>
                         ))}
                       </span>
                       <span className="hidden sm:inline">
                         {"Obchodné podmienky podľa zák. 108/2024 Z. z.".split(' ').map((word, i) => (
                           <React.Fragment key={i}>
                             <span
                               className={
                                 word.toUpperCase().includes("108/2024")
                                   ? "text-brand-orange"
                                   : "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                               }
                             >
                               {word}{' '}
                             </span>
                           </React.Fragment>
                         ))}
                       </span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/40 font-medium mb-10 max-w-xl text-left border-l-[3px] border-brand-orange/30 pl-3">
                      <span className="sm:hidden">Vypracujeme Vám na mieru šité Obchodné podmienky, ktoré budú chrániť nielen kupujúceho, ale aj Váš e-shop.</span>
                      <span className="hidden sm:inline">Vypracujeme Vám na mieru šité Obchodné podmienky, ktoré budú chrániť nielen kupujúceho, ale aj Váš e-shop.</span>
                    </p>
                  </>
                )}
              </div>
            ))}
            
            {/* Tlačidlá mimo slide kontajnera s fixnou pozíciou */}
            <div className="absolute top-48 left-0 right-0 flex flex-row justify-center gap-3 sm:top-[18.5rem] sm:justify-start sm:gap-5 pointer-events-none px-6">
              <button 
                onClick={() => onNavigate(heroSlides[activeSlide].target.view, heroSlides[activeSlide].target.path)} 
                className="bg-white text-[#002b4e] px-8 py-3 sm:px-8 sm:py-4 rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg hover:bg-brand-orange hover:text-white transition-all transform hover:-translate-y-1 pointer-events-auto whitespace-nowrap"
              >
                Pozrieť viac
              </button>
              <button 
                onClick={() => onNavigate('contact', '/kontakt')} 
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 sm:px-8 sm:py-4 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-white/20 transition-all transform hover:-translate-y-1 pointer-events-auto whitespace-nowrap"
              >
                Konzultácia
              </button>
            </div>
          </div>
          
          {/* Mobilné service bubliny - mimo slide mapovania */}
          <div className="lg:hidden absolute bottom-16 left-0 right-0">
            <div className="space-y-2 max-w-sm mx-auto px-4">
              {/* GDPR bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-lg hover:shadow-blue-500/25 hover:border-blue-500/30 transition-all cursor-pointer group hover:scale-102 hover:bg-white/10 animate-breathing" onClick={() => onNavigate('gdpr', '/gdpr')}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield size={16} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-xs group-hover:text-blue-300 transition-colors">Ochrana osobných údajov | GDPR</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Poradenstvo v oblasti ochrany údajov</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Obchodné podmienky bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-lg hover:shadow-purple-500/25 hover:border-purple-500/30 transition-all cursor-pointer group hover:scale-102 hover:bg-white/10 animate-breathing" style={{ animationDelay: '0.5s' }} onClick={() => onNavigate('vop', '/vop')}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText size={16} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-xs group-hover:text-purple-300 transition-colors">Obchodné podmienky | VOP</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Podľa nového zákona 108/2024 Z.z.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Poradenstvo bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-lg hover:shadow-green-500/25 hover:border-green-500/30 transition-all cursor-pointer group hover:scale-102 hover:bg-white/10 animate-breathing" style={{ animationDelay: '1s' }} onClick={() => onNavigate('contact', '/kontakt')}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingCart size={16} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-xs group-hover:text-green-300 transition-colors">Bezplatná kontrola e-shopu</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Spĺňate všetky legislatívne požiadavky?</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AML bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-lg hover:shadow-orange-500/25 hover:border-orange-500/30 transition-all cursor-pointer group hover:scale-102 hover:bg-white/10 animate-breathing" style={{ animationDelay: '1.5s' }} onClick={() => onNavigate('aml', '/aml')}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DollarSign size={16} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-xs group-hover:text-orange-300 transition-colors">Anti Money Laundering | AML</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Program vlastnej činnosti (§20)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Školenia bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-lg hover:shadow-pink-500/25 hover:border-pink-500/30 transition-all cursor-pointer group hover:scale-102 hover:bg-white/10 animate-breathing" style={{ animationDelay: '2s' }} onClick={() => onNavigate('trainings_info', '/skolenia')}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap size={16} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-xs group-hover:text-pink-300 transition-colors">GDPR školenia zamestnancov</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Oboznamovacia povinnosť zamestnancov</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile progress bar with 3 segments - positioned above title */}
          <div className="lg:hidden absolute top-20 left-6 right-6 flex justify-center">
            <div className="flex gap-1">
              {heroSlides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => goToSlide(i)}
                  className="w-8 h-1 bg-white/10 rounded-full overflow-hidden"
                >
                  <div 
                    className={`h-full rounded-full transition-all duration-100 ease-linear ${
                      i < activeSlide ? 'bg-brand-orange' : 
                      i === activeSlide ? 'bg-gradient-to-r from-brand-orange to-orange-400' : 
                      'bg-white/10'
                    }`}
                    style={{ 
                      width: i < activeSlide ? '100%' : 
                             i === activeSlide ? `${slideProgress}%` : 
                             '0%' 
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Plávajúce bubliny na pravej strane */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 h-auto">
            <div className="flex flex-col gap-4">
              {/* GDPR bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl hover:shadow-blue-500/25 hover:border-blue-500/30 transition-all cursor-pointer group hover:scale-105 hover:bg-white/10 animate-breathing" onClick={() => onNavigate('gdpr', '/gdpr')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors">Ochrana osobných údajov | GDPR</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Poradenstvo v oblasti ochrany údajov</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Obchodné podmienky bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl hover:shadow-purple-500/25 hover:border-purple-500/30 transition-all cursor-pointer group hover:scale-105 hover:bg-white/10 animate-breathing" style={{ animationDelay: '0.5s' }} onClick={() => onNavigate('vop', '/vop')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-purple-300 transition-colors">Obchodné podmienky | VOP</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Podľa nového zákona 108/2024 Z.z.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Poradenstvo bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl hover:shadow-green-500/25 hover:border-green-500/30 transition-all cursor-pointer group hover:scale-105 hover:bg-white/10 animate-breathing" style={{ animationDelay: '1s' }} onClick={() => onNavigate('contact', '/kontakt')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingCart size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-green-300 transition-colors">Bezplatná kontrola e-shopu</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Spĺňate všetky legislatívne požiadavky?</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AML bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl hover:shadow-orange-500/25 hover:border-orange-500/30 transition-all cursor-pointer group hover:scale-105 hover:bg-white/10 animate-breathing" style={{ animationDelay: '1.5s' }} onClick={() => onNavigate('aml', '/aml')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DollarSign size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-orange-300 transition-colors">Anti Money Laundering | AML</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Program vlastnej činnosti (§20)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Školenia bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl hover:shadow-pink-500/25 hover:border-pink-500/30 transition-all cursor-pointer group hover:scale-105 hover:bg-white/10 animate-breathing" style={{ animationDelay: '2s' }} onClick={() => onNavigate('trainings_info', '/skolenia')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-pink-300 transition-colors">GDPR školenia zamestnancov</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Oboznamovacia povinnosť zamestnancov</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CSS pre breathing efekt */}
          <style jsx="true">{`
            @keyframes breathing {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.02);
              }
            }
            .animate-breathing {
              animation: breathing ease-in-out 4s infinite;
            }
          `}</style>

           {/* Progress bar with 3 segments */}
          <div className="hidden lg:flex absolute lg:bottom-40 lg:left-8 flex items-center gap-1">
            <div className="flex gap-1">
              {heroSlides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => goToSlide(i)}
                  className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden"
                >
                  <div 
                    className={`h-full rounded-full transition-all duration-100 ease-linear ${
                      i < activeSlide ? 'bg-brand-orange' : 
                      i === activeSlide ? 'bg-gradient-to-r from-brand-orange to-orange-400' : 
                      'bg-white/10'
                    }`}
                    style={{ 
                      width: i < activeSlide ? '100%' : 
                             i === activeSlide ? `${slideProgress}%` : 
                             '0%' 
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-[-2px] left-0 right-0 h-20 z-20 pointer-events-none">
          <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 45%)' }}></div>
        </div>
      </section>

      {/* Section 1: Školenia (formerly Platforma) */}
      <section id="platforma" className="bg-white relative overflow-hidden text-slate-900 pt-6 pb-28">
        <div id="light-particles-platform" className="absolute inset-0 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-brand-orange to-orange-400 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-brand-orange font-medium text-sm uppercase tracking-wider block leading-tight">riešenia pre váš biznis</span>
                </div>
              </div>
                <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black text-[#002b4e] leading-[1.05] tracking-tighter text-left">
                  GDPR povinnosti <span className="text-brand-orange italic">rychlo a efektívne</span>
                </h1>
                <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed text-left">
                  Pridajte svojich zamestnancov, priraďte im <a href="/skolenia" className="text-brand-orange hover:text-brand-orange/80 font-semibold">školenia</a>, sledujte priebeh a exportujte certifikáty na zopár klikov. Splňte si povinnosti podľa <a href="/gdpr" className="text-brand-orange hover:text-brand-orange/80 font-semibold transition-all duration-300">GDPR</a> rýchlo a jednoducho.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { t: "GDPR školenia", d: "(nielen) pre zamestnávateľov", i: <Shield size={18} /> },
                  { t: "Správa školení", d: "Intuitívne rozhranie systému", i: <Zap size={18} /> },
                  { t: "Automatizácia", d: "Notifikácie a prehľad", i: <Clock size={18} /> },
                  { t: "5000+ klientov", d: "Dôvera lídrov na trhu", i: <Users size={18} /> },
                  { t: "10+ rokov praxe", d: "Odbornosť v compliance", i: <Star size={18} /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl transition-all group shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all">
                      {item.i}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-[#002b4e] text-base">{item.t}</h4>
                      <p className="text-xs text-slate-400">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mobilné tlačidlá */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 lg:hidden">
                <button onClick={() => onNavigate('trainings_info', '/skolenia#trainings-list')} className="flex-1 bg-[#002b4e] text-white px-6 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl hover:bg-brand-orange transition-all transform hover:-translate-y-1">Prehľad školení</button>
                <button onClick={() => onNavigate('trainings_info', '/skolenia#pricing')} className="flex-1 bg-slate-100 text-[#002b4e] border border-slate-200 px-6 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider hover:bg-slate-200 transition-all transform hover:-translate-y-1">Cenník</button>
              </div>
            </div>

            <div className="relative group hidden lg:block">
              <div className="absolute -inset-12 bg-gradient-to-br from-brand-orange/5 to-blue-500/5 rounded-[4rem] rotate-2 scale-105 blur-2xl -z-10"></div>
              <div 
                onClick={() => setIsGalleryOpen(true)}
                className="bg-gradient-to-br from-[#002b4e] to-[#003d6d] rounded-[4rem] p-6 shadow-2xl overflow-hidden aspect-video border-[4px] border-slate-100 relative group ring-2 ring-slate-200/50 cursor-pointer active:scale-95 transition-transform"
              >
                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-1000" alt="Platform" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#003d6d]/50 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                      <MousePointer2 size={32} />
                   </div>
                </div>
                <div className="absolute bottom-8 right-8">
                   <span className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">Kliknite pre náhľad</span>
                </div>
              </div>
              
              {/* Tlačidlá pod obrázkom */}
              <div className="flex flex-row gap-4 mt-12">
                <button onClick={() => onNavigate('trainings_info', '/skolenia#trainings-list')} className="flex-1 bg-[#002b4e] hover:bg-[#001a3a] hover:scale-105 text-white px-6 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl transition-all duration-150">Prehľad školení</button>
                <button onClick={() => onNavigate('trainings_info', '/skolenia#pricing')} className="flex-1 bg-brand-orange hover:bg-orange-600 hover:scale-105 text-white px-6 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl transition-all duration-150">Cenník</button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[-2px] left-0 right-0 h-20 z-20 pointer-events-none">
          <div className="absolute inset-0 bg-[#002b4e]" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 45%)' }}></div>
        </div>
      </section>

      {/* Section 2: Why our platform? */}
      <section className="bg-[#002b4e] relative overflow-hidden text-white pt-2 sm:pt-6 pb-28">
        <div id="dark-particles-why" className="absolute inset-0 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-6 sm:pt-10">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-7 space-y-12 text-left">
               <div className="space-y-5 text-left">
                  <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black tracking-tighter text-left">Prečo naša platforma?</h2>
                  <p className="text-base sm:text-xl text-white/50 leading-relaxed font-medium text-left break-words [overflow-wrap:anywhere] hyphens-auto sm:hyphens-none">
                    Predstavujeme Vám <span className="text-brand-orange italic">Complyo</span> - jedinečný spôsob, ako si zamestnávateľ môže splniť svoje povinnosti vyplývajúce z nariadenia GDPR a zákona č. 18/2018 Z.z. o ochrane osobných údajov jednoducho, preukázateľne a online.
                  </p>
               </div>
               
               <div className="space-y-4">
                  {[
                    {
                      mobileText: "Intuitívne ovládanie",
                      desktopText: "Complyo ponúka prehľadné prostredie pre správu GDPR povinností podnikateľov",
                      icon: <Layout size={20} />
                    },
                    {
                      mobileText: "Automatické pripomienky", 
                      desktopText: "Automatické pripomienky zabezpečia vždy 100% súlad s legislatívou",
                      icon: <Clock size={20} />
                    },
                    {
                      mobileText: "Certifikáty na klik",
                      desktopText: "Certifikáty zamestnancov a história absolvovaných školení pre prípadné kontroly",
                      icon: <Trophy size={20} />
                    },
                    {
                      mobileText: "Aktuálne školenia GDPR",
                      desktopText: "Vždy aktuálne školenia pre zamestnancov podľa nariadenia GDPR a zák. 18/2018 Z. z.",
                      icon: <GraduationCap size={20} />
                    },
                    {
                      mobileText: "Oboznamovanie zamestnancov",
                      desktopText: "Elektronický spôsob oboznamovania zamestnancov formou školení, testov a smerníc",
                      icon: <Zap size={20} />
                    },
                    {
                      mobileText: "Preukázateľné plnenie povinností",
                      desktopText: "Preukázateľné plnenie informačných povinností podľa článkov (13) a (14) nariadenia GDPR",
                      icon: <ShieldCheck size={20} />
                    }
                  ].map((item, i) => (
                    <div key={i} className="group flex items-center gap-4 py-2 border-b border-white/10 last:border-0 transition-all duration-300 hover:border-white/20">
                      {/* Icon */}
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/60 group-hover:text-brand-orange group-hover:bg-white/10 transition-all duration-300 flex-shrink-0">
                        {item.icon}
                      </div>
                      
                      {/* Text - different for mobile and desktop */}
                      <h3 className="font-medium text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors">
                        <span className="sm:hidden">{item.mobileText}</span>
                        <span className="hidden sm:inline">{item.desktopText}</span>
                      </h3>
                    </div>
                  ))}
               </div>
            </div>

            <div className="lg:col-span-5 space-y-8">
               <DidYouKnowCard onClick={() => onNavigate('trainings_info', '/skolenia')} showMoreInfo={false}>
                 Väčšina firiem nedokáže preukázať riadne preškolenie zamestnancov pri výkone kontroly dozorným orgánom. Neriskujte a majte všetko pod kontrolou v našej školiacej platforme.
               </DidYouKnowCard>
               
               <div className="group relative bg-brand-orange/5 border border-brand-orange/20 rounded-[2.5rem] p-6 md:p-10 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 text-left backdrop-blur-sm">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <ShieldCheck size={20} />
                      </div>
                      <h3 className="text-brand-orange font-black text-sm uppercase">Komplexné riešenie</h3>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      Prostredníctvom Complyo platformy zabezpečíte efektívne plnenie legislatívnych požiadaviek GDPR.
                    </p>
                    <button onClick={() => onNavigate('contact', '/kontakt')} className="w-full bg-brand-orange text-white py-4 sm:py-5 rounded-2xl font-bold uppercase text-xs tracking-wider hover:scale-[1.02] transition-all">Kontaktujte nás</button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[-2px] left-0 right-0 h-20 z-20 pointer-events-none">
          <div className="absolute inset-0 bg-[#f8fafc]" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 45%)' }}></div>
        </div>
      </section>

      {/* Section 3: GDPR Dokumentácia */}
      <section id="gdpr" className="bg-[#f8fafc] relative overflow-hidden text-slate-900 pt-6 pb-28">
        <div id="light-particles-gdpr" className="absolute inset-0 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-10">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div className="space-y-12 text-left">
              <div className="space-y-5 text-left">
                <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-brand-orange to-orange-400 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-brand-orange font-medium text-sm uppercase tracking-wider block leading-tight">Ochrana osobných údajov</span>
                </div>
              </div>
                <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black text-[#002b4e] leading-none tracking-tighter text-left">
                  GDPR dokumentácia <br/>
                  <span className="text-brand-orange">na mieru</span>
                </h2>
                <p className="text-base sm:text-xl text-slate-500 font-medium leading-relaxed text-left break-words [overflow-wrap:anywhere] hyphens-auto sm:hyphens-none">
                   Očakávate precíznosť, individuálny prístup a „veci“ dotiahnuté do konca? V tom prípade sme možno práve my tá správna voľba. 
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {[
                  "Pravidelné aktualizácie pri legislatívnych zmenách",
                  "Odborné poradenstvo a konzultácie",
                  "Individuálny prístup a dokumenty tvorené na mieru",
                  "Implementácia a zavedenie GDPR do praxe",
                  "Ľudský a férový prístup je našou prioritou",
                  "rýchle dodanie a rozumné ceny"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0">
                      <CheckCircle2 size={12} className="sm:size-[14px]" />
                    </div>
                    <span className="font-bold text-[#002b4e] group-hover:text-brand-orange transition-colors text-left text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 space-y-4">
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  Zaujala vás naša ponuka GDPR služieb? Radi vám pripravíme detailnú cenovú ponuku na mieru.
                </p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  Napíšte nám a dohodnite si s nami nezáväznú konzultáciu za účelom vypracovania bezplatnej&nbsp; 
                  <button 
                    onClick={() => {
                      onNavigate('gdpr', '/gdpr');
                      setTimeout(() => {
                        const formElement = document.getElementById('kontaktny-formular');
                        if (formElement) {
                          formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 100);
                    }} 
                    className="text-brand-orange font-bold hover:text-brand-orange/80 transition-colors underline underline-offset-2"
                  >
                     cenovej ponuky
                  </button>
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-[#002b4e] rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl text-left">
                <div className="relative z-10 space-y-10">
                  <h3 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-left">Naozaj ste v súlade s <span className="text-brand-orange">GDPR?</span></h3>
                  <p className="text-white/50 font-medium italic text-left">Využite náš bezplatný online audit a uistite sa o aktuálnosti vašej dokumentácie.</p>
                  
                  <div className="space-y-4">
                    {[
                      "Kontrola dokumentácie a procesov",
                      "Identifikácia spracovateľských operácií",
                      "Traffic-light report priorít",
                      "Protokol s návrhmi riešení",
                      "Nezáväzná cenová ponuka"
                    ].map((txt, i) => (
                      <div key={i} className="flex items-center gap-4 text-sm font-bold text-white/80 text-left">
                        <div className="w-6 h-6 bg-brand-orange/20 rounded-lg flex items-center justify-center text-brand-orange shrink-0">✓</div>
                        {txt}
                      </div>
                    ))}
                  </div>

                  <button onClick={() => {
  onNavigate('gdpr', '/gdpr');
  setTimeout(() => {
    const formElement = document.getElementById('kontaktny-formular');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}} className="w-full bg-brand-orange text-white py-6 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-xl shadow-orange-500/20 hover:bg-white hover:text-[#002b4e] transition-all">VYŽIADAŤ AUDIT ZDARMA</button>
                </div>
              </div>

              {/* Vedeli ste, že Card */}
              <div 
                 className="group relative bg-brand-orange/5 border border-brand-orange/20 rounded-[2.5rem] p-6 md:p-10 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                 onClick={() => setShowVedeliSteModal(true)}
              >
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl group-hover:bg-brand-orange/20 transition-colors"></div>
                 <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                          <Lightbulb size={20} />
                       </div>
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
            </div>
          </div>
        </div>

        <div className="absolute bottom-[-2px] left-0 right-0 h-20 z-20 pointer-events-none">
          <div className="absolute inset-0 bg-[#002b4e]" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 45%)' }}></div>
        </div>
      </section>

      {/* Section 4: VOP 108/2024 */}
      <section id="vop" className="bg-[#002b4e] relative overflow-hidden text-white pt-6 pb-28">
        <div id="dark-particles-vop" className="absolute inset-0 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-10">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-center">
            <div className="space-y-10 order-2 lg:order-1 text-left">
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-3xl font-bold text-white mb-2">
                  Čo od nás dostanete?
                </h3>
                <div className="w-20 h-1 bg-brand-orange mx-auto rounded-full"></div>
              </div>
              <div className="grid gap-4 sm:gap-6">
                {[
                  { t: "Obchodné podmienky & Reklamačný poriadok", d: "Podľa nového zákona č. 108/2024 Z. z. od 1.7.2024.", i: <Zap size={20} /> },
                  { t: "Individuálny a hlavne ľudský prístup", d: "Náš prístup je jedinečný tak, ako každý náš klient.", i: <FileText size={20} /> },
                  { t: "Všetky formuláre a súčasti VOP", d: "Všetky dôležité informačné povinnosti a formuláre v cene.", i: <Shield size={20} /> },
                  { t: "Dodanie do 7 pracovných dní", d: "Rýchle a precízne spracovanie dokumentov.", i: <Clock size={20} /> },
                  { t: "Platba až po kompletnom dodaní", d: "Dôvera na oboch stranách - platíte až po odovzdaní diela.", i: <CheckCircle2 size={20} /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6 p-5 sm:p-8 border border-white/10 rounded-[2.25rem] sm:rounded-[2.5rem] hover:border-brand-orange/30 transition-all group text-left">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-orange transition-all shrink-0">
                      {item.i}
                    </div>
                    <div className="text-left">
                      <h4 className="text-base sm:text-lg font-bold mb-1 text-left leading-snug">{item.t}</h4>
                      <p className="text-xs sm:text-sm text-white/40 font-medium leading-relaxed text-left break-words [overflow-wrap:anywhere] hyphens-auto sm:hyphens-none">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8 order-1 lg:order-2 text-left">
              <div className="space-y-5 text-left">
                <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-brand-orange to-orange-400 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-brand-orange font-medium text-sm uppercase tracking-wider block leading-tight">Obchodné podmienky pre e-shop</span>
                </div>
              </div>
                <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tighter text-left">
                  Nové VOP podľa <br/>
                  <span className="text-brand-orange text-left">zák. 108/2024 Z.z.</span>
                </h2>
                <p className="text-base sm:text-xl text-white/50 font-medium leading-relaxed text-left break-words [overflow-wrap:anywhere] hyphens-auto sm:hyphens-none">
                  Postrehli ste úpravu spojenú s novým zákonom o ochrane spotrebiteľa? Od 1.7.2024 už neplatia niektoré známe predpisy, významnú novelu získal aj Občiansky zákonník.
                </p>
              </div>

              <div className="bg-white/5 p-10 md:p-12 rounded-[3.5rem] border border-white/10 relative overflow-hidden group shadow-2xl text-left">
                  <h3 className="text-2xl font-black mb-4 text-left">
                    Skontrolujeme vám Web bezplatne
                    
                  </h3>
                  <p className="text-white/50 font-medium mb-6 text-sm text-left">
                    Nie ste si istý, či Váš web alebo e-shop spĺňa všetky byrokratické povinnosti? Radi sa na to pozrieme! Výsledky dostanete do 48 hodín, je to bezplatné a nezáväzne.
                  </p>
                  
                  <div className="space-y-3 mb-8 text-left">
                    <div className="flex items-center gap-3 text-white/70 font-medium text-sm">
                      <Globe size={18} className="text-brand-orange" />
                      <span>všetko spolu vybavíme online</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70 font-medium text-sm">
                      <Coffee size={18} className="text-brand-orange" />
                      <span>...alebo dáme kávu?</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-10 text-left border-t border-white/10 pt-6">
                    <div className="flex items-center gap-4 text-white/70 font-bold tracking-tight text-left"><Phone size={18} className="text-brand-orange" /> +421 948 225 713</div>
                    <div className="flex items-center gap-4 text-white/70 font-bold tracking-tight text-left"><Mail size={18} className="text-brand-orange" /> sluzby@lordsbenison.eu</div>
                  </div>
                  
                  <button onClick={() => onNavigate('vop', '/vop')} className="w-full bg-brand-orange text-white py-6 rounded-2xl font-bold uppercase text-xs tracking-wider hover:scale-[1.02] transition-all">Cenová ponuka VOP</button>
              </div>

              <DidYouKnowCard onClick={() => onNavigate('vop', '/vop')} showMoreInfo={false}>
                Zákon ukladá presné znenie objednávkového tlačidla a prináša nové informačné povinnosti. Neriskujte pokuty od SOI kopírovaním cudzích VOP!
              </DidYouKnowCard>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="bg-white py-16 relative overflow-hidden text-left -mt-2 sm:-mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
             <div className="flex items-center gap-3 mb-6 justify-center">
                <div className="w-1 h-8 bg-gradient-to-b from-brand-orange to-orange-400 rounded-full"></div>
                <div className="flex-1 max-w-fit">
                  <span className="text-brand-orange font-medium text-sm uppercase tracking-wider block leading-tight">Referencie</span>
                </div>
              </div>
             <h2 className="text-4xl md:text-5xl font-black text-brand-navy tracking-tighter">Dôvera našich klientov</h2>
             <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-brand-orange/60 to-transparent rounded-full mx-auto"></div>
          </div>
          
          {/* Carousel Container */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button 
              onClick={prevTestimonial}
              className="absolute -left-6 md:-left-20 top-1/2 -translate-y-1/2 z-20 p-3 text-brand-orange hover:text-brand-orange/80 md:p-4 md:bg-white/90 md:backdrop-blur-sm md:rounded-full md:shadow-lg md:hover:bg-white md:hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Predchádzajúca recenzia"
            >
              <ChevronLeft size={24} className="md:w-6 md:h-6" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="absolute -right-6 md:-right-20 top-1/2 -translate-y-1/2 z-20 p-3 text-brand-orange hover:text-brand-orange/80 md:p-4 md:bg-white/90 md:backdrop-blur-sm md:rounded-full md:shadow-lg md:hover:bg-white md:hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Ďalšia recenzia"
            >
              <ChevronRight size={24} className="md:w-6 md:h-6" />
            </button>

            {/* Testimonials Slider */}
            <div 
              className="relative overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonialIndex * (window.innerWidth < 768 ? 100 : 33.333)}%)` }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-full md:w-1/3 flex-shrink-0 px-3">
                    <div className="bg-slate-50 p-6 rounded-[3rem] border border-slate-100 relative group transition-all duration-300 text-left h-full">
                      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 space-y-4 text-left">
                        {/* Logo and stars on top */}
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-20 h-14 bg-white rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden">
                            {t.logoUrl ? (
                              <img src={t.logoUrl} alt={`${t.name} logo`} className="w-[90%] h-[90%] object-contain" style={{maxWidth: '120%', maxHeight: '120%'}} />
                            ) : (
                              <div className="w-full h-full bg-brand-navy rounded-2xl flex items-center justify-center text-white font-black text-lg">
                                {t.avatar}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-brand-gold text-brand-gold" />)}
                          </div>
                        </div>
                        
                        {/* Testimonial text with line clamping */}
                        <div className="text-center">
                          <p className={`text-slate-600 font-medium leading-relaxed text-sm ${!expandedTestimonials[i] ? 'line-clamp-4' : ''}`}>
                            "{t.text}"
                          </p>
                          <button 
                            onClick={() => toggleTestimonial(i)}
                            className="text-brand-orange font-medium text-sm mt-2 hover:text-brand-orange/80 transition-colors"
                          >
                            {expandedTestimonials[i] ? 'Zobraziť menej ▲' : 'Zobraziť viac ▼'}
                          </button>
                        </div>
                        
                        {/* Name and company */}
                        <div className="text-center pt-4 border-t border-slate-100">
                          <h4 className="font-bold text-brand-navy text-sm">{t.name}</h4>
                          <p className="text-xs text-slate-400 font-medium">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.max(1, testimonials.length - 2) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentTestimonialIndex === i 
                      ? 'w-8 bg-brand-orange shadow-[0_0_10px_rgba(247,148,29,0.5)]' 
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Prejsť na skupinu recenzií ${i + 1}`}
                />
              ))}
            </div>

            {/* Testimonial Counter */}
            <div className="text-center mt-4">
              <p className="text-sm text-slate-500 font-medium">
                Strana {currentTestimonialIndex + 1} / {Math.max(1, testimonials.length - 2)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                     onNavigate('trainings_info', '/skolenia#pricing'); 
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

          <div className="pt-8 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-2 text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">LORD'S BENISON S.R.O. | Váš partner vo svete podnikania</p>
              <div className="flex gap-4 justify-center lg:justify-start">
                <a href="https://www.lordsbenison.sk" target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white transition-colors hover:underline">
                  www.lordsbenison.sk
                </a>
                <span className="text-xs text-white/40">|</span>
                <a href="https://www.moja-stavba.sk" target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white transition-colors hover:underline">
                  www.moja-stavba.sk
                </a>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 text-center lg:text-right">
              <div className="flex gap-4 justify-center lg:justify-end">
                <a href="/kontakt" className="text-xs font-bold uppercase tracking-wider text-brand-orange hover:text-white transition-colors">
                  Napíšte nám
                </a>
              </div>
              <div className="flex gap-4 justify-center lg:justify-end">
                <a href="tel:+421948225713" className="text-xs text-white/60 hover:text-white transition-colors hover:underline">
                  +421 948 225 713
                </a>
                <span className="text-xs text-white/40">|</span>
                <a href="mailto:sluzby@lordsbenison.eu" className="text-xs text-white/60 hover:text-white transition-colors hover:underline">
                  sluzby@lordsbenison.eu
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

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
                  <div className="w-10 h-10 md:w-10 md:h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Lightbulb size={18} className="md:size-20" />
                  </div>
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

      <CookieConsent />
    </div>
  );
};
