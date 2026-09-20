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
  FileCheck2,
  MapPin,
  Building2,
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
    "/obrazok6.png"
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
        <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl relative flex items-center justify-center">
          <img
            src={images[currentIndex]}
            alt={`Náhľad ${currentIndex + 1}`}
            className="max-w-full max-h-full w-auto h-auto object-contain animate-in zoom-in-95 fade-in duration-500"
            onError={(e) => {
               (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80";
            }}
          />
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
      <div className="absolute bottom-[30px] flex items-center gap-4">
        <div className="flex gap-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
              className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-10 bg-brand-orange' : 'w-2 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
        <span className="text-[11px] font-medium text-white/70">{currentIndex + 1} z {images.length}</span>
      </div>
    </div>
  );
};

const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth < 768;

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
      title: "Školenia zamestnancov — v oblasti GDPR",
      highlight: "GDPR",
      subtitle: "Školenia sú dôležitou súčasťou GDPR",
      description: "Vďaka našej školiacej platforme budete mať kompletný prehľad o stave vzdelávania Vašich zamestnancov.",
      target: { view: 'trainings_info', path: '/skolenia' }
    },
    {
      title: "GDPR dokumentácia na mieru — za rozumnú cenu",
      highlight: "GDPR",
      subtitle: "Využite teraz našu bezplatnú konzultáciu",
      description: "S nami zistíte, nakoľko sa Vás GDPR reálne týka a ako sa chrániť pred zbytočnými pokutami.",
      target: { view: 'gdpr', path: '/gdpr' }
    },
    {
      title: "Obchodné podmienky podľa — zák. 108/2024 Z. z.",
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
          events: { onHover: { enable: true, mode: "repulse" },  resize: true },
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
          events: { onHover: { enable: true, mode: "repulse" },  resize: true },
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

      // Načítaj particles len ak kontajnery existujú v DOM
      if (document.getElementById("landing-nav-particles")) {
        (window as any).tsParticles.load("landing-nav-particles", headerConfig);
      }
      if (document.getElementById("hero-particles")) {
        (window as any).tsParticles.load("hero-particles", heroParticlesConfig);
      }
      if (document.getElementById("dark-particles-why")) {
        (window as any).tsParticles.load("dark-particles-why", darkParticlesConfig);
      }
      if (document.getElementById("dark-particles-vop")) {
        (window as any).tsParticles.load("dark-particles-vop", darkParticlesConfig);
      }
      if (document.getElementById("light-particles-platform")) {
        (window as any).tsParticles.load("light-particles-platform", lightParticlesConfig);
      }
      if (document.getElementById("light-particles-gdpr")) {
        (window as any).tsParticles.load("light-particles-gdpr", lightParticlesConfig);
      }
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
    { name: 'Cenník', href: '/skolenia#pricing', action: () => onNavigate('trainings_info', '/skolenia#pricing'), type: 'link' },
    { name: 'Blog', href: '/blog', action: () => onNavigate('blog', '/blog'), type: 'link' },
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
          <img src="/question-icon.png" alt="" aria-hidden="true" className="w-10 h-10 object-contain drop-shadow-md" />
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
    <div className="marketing-page min-h-screen font-sans overflow-x-hidden scroll-smooth bg-white text-left">
      <ImageGalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />

      {/* Navigation */}
      <div className={`fixed inset-x-0 z-[2000] flex justify-center transition-all duration-700 ${scrolled ? 'lg:top-4 lg:px-6 top-0 px-0' : 'top-0 px-0'}`}>
        <nav 
          className={`w-full transition-all duration-700 relative overflow-visible ${
            scrolled 
              ? 'lg:bg-white/95 lg:backdrop-blur-md lg:max-w-[95%] lg:h-16 lg:rounded-full lg:shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:border lg:border-slate-100 bg-[#002b4e] h-16 border-b border-white/5' 
              : 'w-full lg:h-24 h-16 border-b border-white/10 bg-[#002b4e]/35 backdrop-blur-md shadow-[0_10px_35px_rgba(0,20,38,0.10)]'
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
      {/* Reversible hero experiment: remove the next background layer and restore particle opacity to return to the original. */}
      <section className="landing-hero landing-hero-legal-experiment relative h-[100svh] min-h-[800px] lg:min-h-[640px] w-full flex items-center bg-[#002b4e] overflow-hidden">
        <div
          className="hero-legal-experiment-bg absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/hero-legal-experiment-v5.png')" }}
        ></div>
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,43,78,.58)_0%,rgba(0,43,78,.36)_45%,rgba(0,31,57,.18)_72%,rgba(0,31,57,.08)_100%)] pointer-events-none"></div>
        <div id="hero-particles" className="absolute inset-0 z-[2] w-full h-full opacity-35"></div>
        <div className="absolute inset-0 z-[3] bg-gradient-to-b from-[#003d6d]/15 via-transparent to-[#002b4e]/45 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full h-full flex lg:items-center pt-24 lg:pt-0">
          <div className="max-w-4xl h-[400px] relative w-full text-left">
            {heroSlides.map((slide, idx) => (
              <div key={idx} className={`absolute inset-0 flex flex-col justify-start pt-4 transition-all duration-1000 transform ${activeSlide === idx ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}>
                {idx === 0 && (
                  <>
                    <h2 className="landing-hero-title text-[28px] sm:text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-6 drop-shadow-2xl">
                       <span className="sm:hidden">
                         <span className="block">Školenia <span className="text-brand-orange">GDPR</span> pre Vašich</span>
                         <span className="block">zamestnancov cez</span>
                         <span className="block">online platformu</span>
                       </span>
                       <span className="hidden sm:block">
                         <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Školenia zamestnancov</span>
                         <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">v oblasti <span className="text-brand-orange [-webkit-text-fill-color:#f7941d]">GDPR</span></span>
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
                    <h2 className="landing-hero-title text-3xl sm:text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-6 drop-shadow-2xl">
                       <span className="block"><span className="text-brand-orange">GDPR</span> dokumentácia na mieru</span>
                       <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">za rozumnú cenu</span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/40 font-medium mb-10 max-w-xl text-left border-l-[3px] border-brand-orange/30 pl-3">
                      <span className="sm:hidden">S nami zistíte, nakoľko sa Vás GDPR reálne týka a ako sa chrániť pred zbytočnými pokutami.</span>
                      <span className="hidden sm:inline">S nami zistíte, nakoľko sa Vás GDPR reálne týka a ako sa chrániť pred zbytočnými pokutami.</span>
                    </p>
                  </>
                )}
                {idx === 2 && (
                  <>
                    <h2 className="landing-hero-title text-3xl sm:text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-6 drop-shadow-2xl">
                       <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Obchodné podmienky podľa</span>
                       <span className="block"><span className="text-brand-orange">zák. 108/2024</span> Z. z.</span>
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
            <div className="absolute top-[15.5rem] left-0 right-0 flex flex-row justify-center gap-3 sm:top-[17.25rem] sm:justify-start sm:gap-5 pointer-events-none px-0">
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
          <div className="lg:hidden absolute top-[26.5rem] left-0 right-0">
            <div className="space-y-2 max-w-sm mx-auto px-6">
              {/* GDPR bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2.5 sm:p-3 shadow-lg hover:shadow-blue-500/25 hover:border-blue-500/30 transition-all cursor-pointer group hover:scale-102 hover:bg-white/10 animate-breathing" onClick={() => onNavigate('gdpr', '/gdpr')}>
                  <div className="flex items-center gap-3">
                    <img src="/landing_icons/gdpr.webp" alt="" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-xs group-hover:text-blue-300 transition-colors">Ochrana osobných údajov | GDPR</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Poradenstvo v oblasti ochrany údajov</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Obchodné podmienky bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2.5 sm:p-3 shadow-lg hover:shadow-purple-500/25 hover:border-purple-500/30 transition-all cursor-pointer group hover:scale-102 hover:bg-white/10 animate-breathing" style={{ animationDelay: '0.5s' }} onClick={() => onNavigate('vop', '/vop')}>
                  <div className="flex items-center gap-3">
                    <img src="/landing_icons/vop.webp" alt="" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-xs group-hover:text-purple-300 transition-colors">Obchodné podmienky | VOP</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Podľa nového zákona 108/2024 Z.z.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Poradenstvo bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2.5 sm:p-3 shadow-lg hover:shadow-green-500/25 hover:border-green-500/30 transition-all cursor-pointer group hover:scale-102 hover:bg-white/10 animate-breathing" style={{ animationDelay: '1s' }} onClick={() => onNavigate('contact', '/kontakt')}>
                  <div className="flex items-center gap-3">
                    <img src="/landing_icons/kontrola esopu.webp" alt="" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-xs group-hover:text-green-300 transition-colors">Bezplatná kontrola e-shopu</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Spĺňate všetky legislatívne požiadavky?</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AML bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2.5 sm:p-3 shadow-lg hover:shadow-orange-500/25 hover:border-orange-500/30 transition-all cursor-pointer group hover:scale-102 hover:bg-white/10 animate-breathing" style={{ animationDelay: '1.5s' }} onClick={() => onNavigate('aml', '/aml')}>
                  <div className="flex items-center gap-3">
                    <img src="/landing_icons/aml.webp" alt="" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-xs group-hover:text-orange-300 transition-colors">Anti Money Laundering | AML</p>
                      <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Program vlastnej činnosti (§20)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Školenia bublina */}
              <div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2.5 sm:p-3 shadow-lg hover:shadow-pink-500/25 hover:border-pink-500/30 transition-all cursor-pointer group hover:scale-102 hover:bg-white/10 animate-breathing" style={{ animationDelay: '2s' }} onClick={() => onNavigate('trainings_info', '/skolenia')}>
                  <div className="flex items-center gap-3">
                    <img src="/landing_icons/skolenia complyo.webp" alt="" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
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
                    <img src="/landing_icons/gdpr.webp" alt="" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
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
                    <img src="/landing_icons/vop.webp" alt="" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
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
                    <img src="/landing_icons/kontrola esopu.webp" alt="" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
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
                    <img src="/landing_icons/aml.webp" alt="" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
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
                    <img src="/landing_icons/skolenia complyo.webp" alt="" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
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
          <div className="hidden lg:flex absolute lg:bottom-[10.5rem] lg:left-8 flex items-center gap-1">
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
                {/* Skrytý H1 tag pre SEO */}
                <h1 className="sr-only">GDPR služby pre firmy a živnostníkov</h1>
                
                {/* Vizuálny nadpis pre používateľa */}
                <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black text-[#002b4e] leading-[1.05] tracking-tighter text-left">
                  GDPR povinnosti <span className="text-brand-orange italic">rýchlo a efektívne</span>
                </h2>
                <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed text-left">
                  Pridajte svojich zamestnancov, priraďte im <a href="/skolenia" className="text-brand-orange hover:text-brand-orange/80 font-semibold">školenia</a>, sledujte priebeh a exportujte certifikáty na zopár klikov. Splňte si povinnosti podľa <a href="/gdpr" className="text-brand-orange hover:text-brand-orange/80 font-semibold transition-all duration-300">GDPR</a> rýchlo a jednoducho.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-0">
                {[
                  { t: "GDPR školenia", d: "(nielen) pre zamestnávateľov", Icon: GraduationCap },
                  { t: "Správa školení", d: "Intuitívne rozhranie systému", Icon: Layout },
                  { t: "Automatizácia", d: "Notifikácie a prehľad", Icon: Zap },
                  { t: "5000+ klientov", d: "Dôvera lídrov na trhu", Icon: Users },
                  { t: "10+ rokov praxe", d: "Odbornosť v compliance", Icon: Trophy }
                ].map((item, i) => (
                  <div key={i} className="group flex items-center gap-4 py-5 border-t border-slate-200/80 transition-colors hover:border-brand-orange/40">
                    <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border border-[#002b4e]/10 bg-[#002b4e]/[0.035] text-[#002b4e]/70 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-brand-orange/30 group-hover:bg-brand-orange/[0.06] group-hover:text-brand-orange">
                      <item.Icon size={19} strokeWidth={1.7} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-bold text-[#002b4e] text-[0.95rem] leading-snug">{item.t}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.d}</p>
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
                className="bg-[#eef3f8] rounded-[2rem] shadow-2xl overflow-hidden aspect-[2/1] border border-slate-200/70 relative group cursor-pointer active:scale-95 transition-transform"
              >
                <img src="/complyo-platform-preview.webp" className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.015]" alt="Náhľad školiacej platformy Complyo – detail GDPR školenia" />
                <div className="absolute bottom-8 right-8">
                   <span className="bg-[#002b4e]/85 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/15 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">Otvoriť galériu</span>
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
          <div className="text-left">
            <div className="max-w-4xl mb-10 sm:mb-14">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-tight">
                <span className="block">Prečo si vybrať</span>
                <span className="block text-brand-orange italic">Complyo?</span>
              </h2>
              <p className="mt-5 text-base sm:text-lg text-white/55 leading-relaxed font-medium max-w-3xl">
                Jedinečný spôsob, ako si zamestnávateľ môže splniť povinnosti podľa GDPR a zákona č. 18/2018 Z. z. jednoducho, preukázateľne a online.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 lg:gap-x-20">
              {[
                { title: "Prehľadné prostredie", description: "Správa GDPR povinností podnikateľa na jednom mieste.", icon: "/why-icons/prostredie.png" },
                { title: "Certifikáty a história školení", description: "Doklady o absolvovaní máte vždy poruke pre prípad kontroly.", icon: "/why-icons/certifikaty.png" },
                { title: "Automatické pripomienky", description: "Pomáhajú udržiavať vaše GDPR povinnosti vždy aktuálne.", icon: "/why-icons/pripomienky.png" },
                { title: "Elektronické oboznamovanie", description: "Školenia, testy a smernice jednoducho a preukázateľne.", icon: "/why-icons/oboznamovanie.png" },
                { title: "Aktuálne školenia", description: "Vždy podľa GDPR a zákona č. 18/2018 Z. z.", icon: "/why-icons/skolenia.png" },
                { title: "Preukázateľné plnenie povinností", description: "Podľa článkov 13 a 14 nariadenia GDPR.", icon: "/why-icons/plnenie.png" }
              ].map((item, i) => (
                <div key={item.title} className={`group flex gap-4 py-5 border-b border-white/10 ${i < 4 ? '' : 'md:border-b-0'}`}>
                  <div className="w-14 h-14 flex items-center justify-center shrink-0">
                    <img src={item.icon} alt="" aria-hidden="true" className="w-16 h-16 max-w-none object-contain transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="text-base sm:text-lg font-bold text-white/90 group-hover:text-white transition-colors">{item.title}</h3>
                    <p className="mt-1 text-sm sm:text-base text-white/45 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 sm:mt-16 relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_20px_60px_rgba(0,0,0,0.14)]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-brand-orange/[0.08] pointer-events-none"></div>
              <div className="relative grid lg:grid-cols-2">
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <img src="/question-icon.png" alt="" aria-hidden="true" className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-md" />
                    <div>
                      <p className="text-brand-orange text-xs font-black uppercase tracking-[0.16em]">Vedeli ste, že?</p>
                      <p className="mt-3 text-sm sm:text-base text-white/65 leading-relaxed">
                        Väčšina firiem nedokáže pri kontrole preukázať riadne preškolenie zamestnancov a splnenie informačných povinností.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative border-t border-white/10 lg:border-t-0 lg:border-l p-6 sm:p-8 lg:p-10">
                  <div className="absolute left-0 top-1/2 hidden lg:block h-16 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-orange"></div>
                  <div className="flex items-start gap-4 sm:gap-5">
                    <img src="/solution-lightbulb.png" alt="" aria-hidden="true" className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 drop-shadow-lg" />
                    <div>
                      <p className="text-brand-orange text-xs font-black uppercase tracking-[0.16em]">Riešenie Complyo</p>
                      <h3 className="mt-2 text-xl sm:text-2xl font-black text-white">Majte všetko pod kontrolou</h3>
                      <p className="mt-2 text-sm sm:text-base text-white/60 leading-relaxed">
                        Efektívne a preukázateľné plnenie GDPR povinností na jednom mieste.
                      </p>
                      <button onClick={() => onNavigate('contact', '/kontakt')} className="mt-5 inline-flex items-center gap-2 text-brand-orange font-bold text-sm hover:text-white transition-colors">
                        Získať riešenie <ArrowRight size={17} />
                      </button>
                    </div>
                  </div>
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
            <div className="space-y-10 order-2 lg:order-2 text-left">
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-3xl font-bold text-white mb-2">
                  Čo od nás dostanete?
                </h3>
                <div className="w-20 h-1 bg-brand-orange mx-auto rounded-full"></div>
              </div>
              <div className="grid gap-4 sm:gap-6">
                {[
                  { t: "Obchodné podmienky & Reklamačný poriadok", d: "Podľa nového zákona č. 108/2024 Z. z. od 1.7.2024." },
                  { t: "Individuálny a hlavne ľudský prístup", d: "Náš prístup je jedinečný tak, ako každý náš klient." },
                  { t: "Všetky formuláre a súčasti VOP", d: "Všetky dôležité informačné povinnosti a formuláre v cene." },
                  { t: "Dodanie do 7 pracovných dní", d: "Rýchle a precízne spracovanie dokumentov." },
                  { t: "Platba až po kompletnom dodaní", d: "Dôvera na oboch stranách - platíte až po odovzdaní diela." }
                ].map((item, i) => (
                  <div key={i} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 text-left transition-all hover:border-brand-orange/30 hover:bg-white/[0.04] sm:px-5 sm:py-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-orange/20 bg-brand-orange/[0.06] text-[10px] font-black tracking-wider text-brand-orange">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold leading-snug text-left sm:text-base">{item.t}</h4>
                      <p className="mt-1 text-xs font-medium leading-relaxed text-white/40 text-left break-words [overflow-wrap:anywhere] hyphens-auto sm:hyphens-none sm:text-[13px]">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <DidYouKnowCard onClick={() => onNavigate('vop', '/vop')} showMoreInfo={false}>
                Zákon ukladá presné znenie objednávkového tlačidla a prináša nové informačné povinnosti. Neriskujte pokuty od SOI kopírovaním cudzích VOP!
              </DidYouKnowCard>
            </div>

            <div className="space-y-8 order-1 lg:order-1 text-left">
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
                style={{ transform: `translateX(-${currentTestimonialIndex * (isMobileViewport() ? 100 : 33.333)}%)` }}
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

      {/* Footer concept: documentation, clarity and compliance */}
      <footer id="footer-info" className="relative overflow-hidden bg-[#071326] text-white border-t border-white/5">
        {/* Quiet editorial line-art: documents, clauses and verified steps. */}
        <svg className="absolute inset-0 hidden h-full w-full pointer-events-none sm:block" viewBox="0 0 1600 560" preserveAspectRatio="none" aria-hidden="true">
          <g fill="none" stroke="#6b88ae" strokeWidth="1.2" opacity=".13">
            <path d="M0 112h310M0 292h220M1280 92h320M1370 310h230" />
            <path d="M92 42v455M1510 54v420" strokeDasharray="3 13" />
            <circle cx="92" cy="112" r="4" fill="#f7941d" stroke="none" opacity=".7" />
            <circle cx="1510" cy="310" r="4" fill="#f7941d" stroke="none" opacity=".7" />
          </g>

          {/* GDPR records — left edge */}
          <g transform="translate(-28 155) rotate(-4 130 150)" fill="none" stroke="#7895ba" strokeWidth="1.4" opacity=".16">
            <rect x="38" y="20" width="184" height="244" rx="9" />
            <path d="M177 20v48h45M72 102h111M72 130h82M72 158h98M72 204h68" />
            <circle cx="57" cy="102" r="5" /><circle cx="57" cy="130" r="5" /><circle cx="57" cy="158" r="5" />
            <path d="m53 102 3 3 6-7m-9 32 3 3 6-7m-9 32 3 3 6-7" stroke="#f7941d" />
          </g>

          {/* VOP / AML documentation — right edge */}
          <g transform="translate(1378 128) rotate(5 100 160)" fill="none" stroke="#7895ba" strokeWidth="1.4" opacity=".16">
            <path d="M24 12h155l43 43v245H24zM179 12v43h43" />
            <path d="M61 100h121M61 131h91M61 162h121M61 193h106" />
            <path d="M63 245c29-29 52 27 80-3 17-18 31-6 46 4" stroke="#f7941d" opacity=".85" />
            <path d="M61 265h128" />
          </g>

          {/* Compliance blueprint: structured process lines instead of decorative waves. */}
          <g fill="none" stroke="#7895ba" strokeWidth="1.15" opacity=".16">
            <path d="M0 466h116l34-28h158l28 22h118" />
            <path d="M1145 462h112l30-26h165l31 24h117" />
            <path d="M0 486h365M1236 486h364" strokeDasharray="5 12" />
            <path d="M245 438v-28h48M1355 436v-30h-49" />
          </g>
          <g fill="#f7941d" opacity=".5">
            <circle cx="150" cy="438" r="3" /><circle cx="336" cy="460" r="3" />
            <circle cx="1287" cy="436" r="3" /><circle cx="1483" cy="460" r="3" />
          </g>

          {/* Faint review marks and a contractual signature detail. */}
          <g transform="translate(1040 350)" fill="none" stroke="#7895ba" strokeWidth="1.2" opacity=".12">
            <path d="M0 0h118v66H0zM14 17h68M14 31h91M14 45h48" />
            <path d="M137 15h76M137 31h58M137 47h84" />
            <circle cx="228" cy="31" r="19" />
            <path d="m218 31 7 7 14-17" stroke="#f7941d" opacity=".75" />
          </g>
          <g transform="translate(470 427)" fill="none" stroke="#7895ba" strokeWidth="1.05" opacity=".11">
            <path d="M0 24h120M16 7c18-20 26 30 50 3 14-15 27 8 44-7" stroke="#f7941d" opacity=".7" />
            <path d="M143 0v31M154 0v31M165 0v31" />
          </g>
          <g fill="#7895ba" opacity=".27">
            {[[302,76],[328,76],[354,76],[380,76],[302,96],[328,96],[354,96],[380,96],[1218,78],[1244,78],[1270,78],[1296,78],[1218,98],[1244,98],[1270,98],[1296,98]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2.3" />)}
          </g>
        </svg>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-14 sm:pt-16 lg:pt-20 pb-28 sm:pb-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.35fr_.9fr_1fr_1fr] gap-10 lg:gap-14 pb-14">
            <div className="flex flex-col items-center text-center">
              <img src={LOGO_WHITE} alt="LORD'S BENISON" className="w-[245px] max-w-full h-auto object-contain mb-6 opacity-95" />
              <div className="flex items-center justify-center gap-3 mb-6">
                {[{ href: 'https://www.facebook.com', Icon: Facebook, label: 'Facebook' }, { href: 'https://www.linkedin.com', Icon: Linkedin, label: 'LinkedIn' }, { href: 'https://www.instagram.com', Icon: Instagram, label: 'Instagram' }].map(({ href, Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-9 h-9 rounded-lg border border-white/10 text-white/45 flex items-center justify-center hover:text-white hover:border-brand-orange/50 hover:bg-brand-orange/10 transition-all">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
              <button onClick={onRegister} className="group inline-flex items-center gap-3 rounded-lg border border-brand-orange/65 bg-brand-orange/[0.08] px-5 py-3 text-sm font-semibold text-white transition-all hover:border-brand-orange hover:bg-brand-orange/[0.15] hover:shadow-[0_0_22px_rgba(247,148,29,0.12)]">
                Chcem sa registrovať
                <ArrowRight size={16} className="text-brand-orange/80 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="text-left">
              <h4 className="text-brand-orange text-xs font-semibold uppercase tracking-[.13em] mb-6 after:block after:mt-3 after:h-px after:w-9 after:bg-brand-orange/45">Dôležité informácie</h4>
              <div className="space-y-3.5 text-sm">
                <button onClick={() => onNavigate('trainings_info', '/skolenia')} className="block text-white/65 hover:text-white transition-colors">Školenia a cenník</button>
                <button onClick={() => onNavigate('gdpr', '/gdpr')} className="block text-white/65 hover:text-white transition-colors">GDPR dokumentácia</button>
                <button onClick={() => onNavigate('vop', '/vop')} className="block text-white/65 hover:text-white transition-colors">Obchodné podmienky</button>
                <button onClick={() => onNavigate('aml', '/aml')} className="block text-white/65 hover:text-white transition-colors">AML dokumentácia</button>
                <button onClick={() => onNavigate('blog', '/blog')} className="block text-white/65 hover:text-white transition-colors">Odborný blog</button>
              </div>
            </div>

            <div className="text-left">
              <h4 className="text-brand-orange text-xs font-semibold uppercase tracking-[.13em] mb-6 after:block after:mt-3 after:h-px after:w-9 after:bg-brand-orange/45">Kontakt</h4>
              <div className="space-y-5">
                <a href="mailto:sluzby@lordsbenison.eu" className="flex gap-3 group">
                  <Mail size={18} className="text-white/30 mt-0.5 group-hover:text-brand-orange transition-colors" />
                  <span><span className="block text-[10px] uppercase tracking-[.16em] text-white/30 font-bold mb-1">E-mail</span><span className="text-sm text-white/75 group-hover:text-white">sluzby@lordsbenison.eu</span></span>
                </a>
                <a href="tel:+421948225713" className="flex gap-3 group">
                  <Phone size={18} className="text-white/30 mt-0.5 group-hover:text-brand-orange transition-colors" />
                  <span><span className="block text-[10px] uppercase tracking-[.16em] text-white/30 font-bold mb-1">Telefón</span><span className="text-sm text-white/75 group-hover:text-white">+421 948 225 713</span></span>
                </a>
                <div className="flex gap-3">
                  <Clock size={18} className="text-white/30 mt-0.5" />
                  <span><span className="block text-[10px] uppercase tracking-[.16em] text-white/30 font-bold mb-1">Pracovná doba</span><span className="text-sm text-white/75">Po – Pi, 08:00 – 16:30</span></span>
                </div>
              </div>
            </div>

            <div className="text-left">
              <h4 className="text-brand-orange text-xs font-semibold uppercase tracking-[.13em] mb-6 after:block after:mt-3 after:h-px after:w-9 after:bg-brand-orange/45">Prevádzkovateľ</h4>
              <div className="flex gap-3 mb-5">
                <Building2 size={18} className="text-white/30 mt-0.5" />
                <div><p className="text-sm font-bold text-white/90">LORD'S BENISON s.r.o.</p><p className="text-sm leading-6 text-white/50 mt-2">M. Nandrássyho 654/10<br/>050 01 Revúca</p></div>
              </div>
              <div className="flex gap-3 mb-6">
                <MapPin size={18} className="text-white/30 mt-0.5" />
                <p className="text-xs leading-6 text-white/40">IČO: 52404901<br/>DIČ: 2121022992<br/>IČ DPH: SK2121022992</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-7">
            <div className="flex flex-wrap justify-start gap-x-6 gap-y-2 text-xs text-left">
              <a href="/zasady-ochrany-osobnych-udajov-gdpr.html" target="_blank" rel="noopener noreferrer" className="text-white/35 hover:text-white transition-colors">Ochrana osobných údajov</a>
              <a href="/podmienky-pouzivania.html" target="_blank" rel="noopener noreferrer" className="text-white/35 hover:text-white transition-colors">Podmienky používania</a>
              <a href="https://www.lordsbenison.sk" target="_blank" rel="noopener noreferrer" className="text-brand-orange/80 hover:text-brand-orange transition-colors">lordsbenison.sk</a>
              <a href="https://www.moja-stavba.sk" target="_blank" rel="noopener noreferrer" className="text-brand-orange/80 hover:text-brand-orange transition-colors">moja-stavba.sk</a>
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

      <CookieConsent showReopenButton />
    </div>
  );
};
