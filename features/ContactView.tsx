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
  Building,
  Info,
  ShieldAlert,
  ArrowUpRight,
  HandCoins,
  FileSignature,
  Scale,
  Clock,
  ShoppingCart,
  Fingerprint,
  IdCard,
  MapPin,
  Facebook,
  Linkedin,
  Instagram,
  Globe
} from 'lucide-react';
import { COMMON_NAV_LINKS, NAV_CSS_CLASSES, AUTH_BUTTON_TEXT, NAV_FONT_FAMILY } from '../common/navigation';
import CookieConsent from './CookieConsent';

const LOGO_WHITE = "/biele.png";
const LOGO_BLUE = "/landing.png";
const LOGO_MOBIL = "/mobilemenu.png";

export const ContactView: React.FC<{ 
  onBack: () => void, 
  onNavigate: (view: string, path: string) => void,
  onAuth: () => void,
  onRegister: () => void
}> = ({ onBack, onNavigate, onAuth, onRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [formData, setFormData] = useState({
    nazov: '',
    ico: '',
    email: '',
    telefon: '',
    oblast: 'GDPR - Ochrana údajov',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const particlesInitRef = useRef(false);

  useEffect(() => {
    setIsLoaded(true);
    window.scrollTo(0, 0);

    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);

    // Inicializácia hviezd pre hlavičku
    if (!particlesInitRef.current && (window as any).tsParticles) {
      const headerParticlesConfig = {
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
      (window as any).tsParticles.load("contact-header-particles", headerParticlesConfig);
      particlesInitRef.current = true;
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = COMMON_NAV_LINKS.WITH_HREF(onNavigate, onRegister, 'contact');

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
          oblast: 'GDPR - Ochrana údajov',
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

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-brand-orange/30">
      {/* Dynamic Floating Navigation wrapper - High Z-index fix */}
      <div className={`fixed inset-x-0 z-[2000] flex justify-center transition-all duration-700 ${scrolled ? 'lg:top-4 lg:px-6 top-0 px-0' : 'top-0 px-0'}`}>
        {/* Full-width background container when not scrolled */}
        <nav 
          className={`w-full transition-all duration-700 relative overflow-visible ${
            scrolled 
              ? 'lg:bg-white/95 lg:backdrop-blur-md lg:max-w-[95%] lg:h-16 lg:rounded-full lg:shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:border lg:border-slate-100 bg-[#002b4e] lg:h-24 h-16 border-b border-white/5' 
              : 'w-full lg:h-24 h-16 border-b border-white/5 bg-[#002b4e]'
          }`}
        >
          {/* Particles Container */}
          <div 
            id="contact-header-particles" 
            className={`absolute inset-0 z-0 pointer-events-none transition-all duration-700 ${scrolled ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
          ></div>

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
                    <button className={`${NAV_CSS_CLASSES.DESKTOP_BUTTON} ${scrolled ? 'text-brand-navy hover:text-brand-orange' : 'text-white/90 hover:text-brand-orange'}`} style={{ fontFamily: NAV_FONT_FAMILY }}>
                      {link.name} <ChevronDown size={14} className="group-hover/parent:rotate-180 transition-transform" />
                    </button>
                  ) : (
                    <a 
                      onClick={(e) => {
                        if (link.active) e.preventDefault();
                        if (link.action) { e.preventDefault(); link.action(); }
                      }}
                      className={`${NAV_CSS_CLASSES.DESKTOP_LINK} ${link.active ? 'text-brand-orange' : (scrolled ? 'text-brand-navy hover:text-brand-orange' : 'text-white/90 hover:text-brand-orange')}`}
                      style={{ fontFamily: NAV_FONT_FAMILY }}
                    >
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
              <button 
                onClick={onAuth} 
                className={`${NAV_CSS_CLASSES.DESKTOP_AUTH_BUTTON} ${scrolled ? 'shadow-orange-500/25' : 'shadow-black/20'}`}
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
      
      {/* Content Section */}
      <section className="pt-24 md:pt-48 pb-20 bg-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F7941D 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-24 items-start text-left">
            <div className={`transition-all duration-1000 transform space-y-12 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-brand-orange to-orange-400 rounded-full"></div>
                  <span className="text-brand-orange font-medium text-sm uppercase tracking-wider">Kontaktujte nás</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-[#002b4e] tracking-tighter leading-[1.1]">
                  Poďme spolu <span className="text-brand-orange whitespace-nowrap">vylepšiť váš biznis</span>
                </h1>
                <p className="max-w-md text-slate-500 text-lg font-medium leading-relaxed text-left">
                  Kontaktujte nás a radi vám pomôžeme s Ochranou údajov, Obchodnými podmienkami alebo inými legislatívnymi požiadavkami pre vaše podnikanie.
                </p>
                
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                    <div>
                      <span className="font-black text-[#002b4e]">Mgr. Ivan Javorčík</span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <a href="tel:0948225713" className="text-sm text-slate-600 hover:text-brand-orange transition-colors">0948 225 713</a>
                        <a href="mailto:sluzby@lordsbenison.eu" className="text-sm text-slate-600 hover:text-brand-orange transition-colors">sluzby@lordsbenison.eu</a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                    <div>
                      <span className="font-black text-[#002b4e]">Mariana Urbowicz</span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <a href="tel:0915577927" className="text-sm text-slate-600 hover:text-brand-orange transition-colors">0915 577 927</a>
                        <a href="mailto:office@lordsbenison.eu" className="text-sm text-slate-600 hover:text-brand-orange transition-colors">office@lordsbenison.eu</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile form - hneď za kontakt informáciami */}
                <div className="lg:hidden">
                  <div className="bg-white p-4 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,43,78,0.12)] border border-slate-50 relative overflow-hidden group mt-8 mb-6">
                    <div className="mb-6 text-left relative">
                      <h3 className="text-xl font-black text-[#002b4e] tracking-tight">Nezáväzný dopyt</h3>
                      <p className="text-slate-400 text-xs font-medium mt-1">Vyplňte formulár a my sa vám ozveme späť.</p>
                    </div>
                    
                    <form id="contact-form-mobile" className="space-y-3 font-sans" onSubmit={handleSubmit}>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Názov organizácie</label>
                          <input 
                            type="text" 
                            name="nazov"
                            value={formData.nazov || ''}
                            onChange={handleChange}
                            placeholder="Firma s.r.o." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" 
                            required 
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Váš e-mail</label>
                          <input 
                            type="email" 
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            placeholder="vas@email.sk" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" 
                            required 
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider ml-1">IČO</label>
                          <input 
                            type="text" 
                            name="ico"
                            value={formData.ico || ''}
                            onChange={handleChange}
                            placeholder="12345678" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" 
                            required 
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Telefón</label>
                          <input 
                            type="tel" 
                            name="telefon"
                            value={formData.telefon || ''}
                            onChange={handleChange}
                            placeholder="+421 XXX XXX XXX" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all" 
                            required 
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Oblasť záujmu</label>
                          <div className="relative">
                            <select 
                              name="oblast"
                              value={formData.oblast}
                              onChange={handleChange}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-normal text-slate-700 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all cursor-pointer appearance-none"
                            >
                              <option value="GDPR - Ochrana údajov">GDPR - Ochrana údajov</option>
                              <option value="Všeobecné obchodné podmienky">Všeobecné obchodné podmienky</option>
                              <option value="AML - Program vlastnej činnosti">AML - Program vlastnej činnosti</option>
                              <option value="Konzultácia & Audit">Konzultácia & Audit</option>
                              <option value="Iná požiadavka">Iná požiadavka</option>
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" size={14} />
                          </div>
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Správa</label>
                          <textarea 
                            rows={3} 
                            name="message"
                            value={formData.message || ''}
                            onChange={handleChange}
                            placeholder="Stručne popíšte vašu požiadavku..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all resize-none"
                            required
                          ></textarea>
                        </div>
                        
                        <div className="flex items-start gap-2 mb-3">
                          <input 
                            type="checkbox" 
                            id="gdpr-consent-mobile"
                            checked={gdprConsent}
                            onChange={(e) => setGdprConsent(e.target.checked)}
                            className="mt-0.5 w-3 h-3 text-brand-orange border-gray-300 rounded focus:ring-brand-orange focus:ring-2"
                            required
                          />
                          <label htmlFor="gdpr-consent-mobile" className="text-[10px] text-slate-600 leading-relaxed">
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
                          className="w-full py-3 bg-brand-orange text-white rounded-lg font-semibold uppercase text-[10px] tracking-wider shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                        >
                          {isSubmitting ? (
                            <><RefreshCw className="animate-spin" size={14} /> Odosielam...</>
                          ) : (
                            <>Odoslať <Send size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /></>
                          )}
                        </button>
                      </form>
                      
                      {/* Success/Error Messages for mobile */}
                      {submitStatus === 'success' && (
                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <CheckCircle2 className="text-emerald-500" size={18} />
                            <h4 className="text-sm font-semibold text-emerald-800">Správa odoslaná!</h4>
                          </div>
                          <p className="text-xs text-emerald-600">Ozveme sa vám čo najskôr.</p>
                        </div>
                      )}
                      
                      {submitStatus === 'error' && (
                        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <AlertCircle className="text-rose-500" size={18} />
                            <h4 className="text-sm font-semibold text-rose-800">Chyba</h4>
                          </div>
                          <p className="text-xs text-rose-600">Skúste to prosím znova.</p>
                        </div>
                      )}
                  </div>
                </div>
                </div>

              {/* Company Details Block */}
              <div className="space-y-8 pt-6 border-t border-slate-100">
                {/* Mobile verzia - jednoduchšia */}
                <div className="lg:hidden">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-[#002b4e] mb-4">Údaje spoločnosti</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 py-2 border-b border-slate-100">
                        <Building2 size={16} className="text-brand-orange mt-1" />
                        <div>
                          <span className="text-xs font-medium text-slate-600">Názov</span>
                          <div className="text-sm font-bold text-[#002b4e]">LORD'S BENISON s.r.o.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2 border-b border-slate-100">
                        <MapPin size={16} className="text-brand-orange mt-1" />
                        <div>
                          <span className="text-xs font-medium text-slate-600">Adresa</span>
                          <div className="text-sm font-bold text-[#002b4e]">
                            M. Nandrássyho 654/10<br />
                            050 01 Revúca
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2 border-b border-slate-100">
                        <Fingerprint size={16} className="text-brand-orange mt-1" />
                        <div>
                          <span className="text-xs font-medium text-slate-600">IČO</span>
                          <div className="text-sm font-bold text-[#002b4e]">52404901</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2 border-b border-slate-100">
                        <IdCard size={16} className="text-brand-orange mt-1" />
                        <div>
                          <span className="text-xs font-medium text-slate-600">DIČ</span>
                          <div className="text-sm font-bold text-[#002b4e]">2121022992</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2 border-b border-slate-100">
                        <ShieldCheck size={16} className="text-brand-orange mt-1" />
                        <div>
                          <span className="text-xs font-medium text-slate-600">IČ DPH</span>
                          <div className="text-sm font-bold text-[#002b4e]">SK2121022992</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2">
                        <Globe size={16} className="text-brand-orange mt-1" />
                        <div>
                          <span className="text-xs font-medium text-slate-600">Naše weby</span>
                          <div className="space-y-1">
                            <a href="https://www.lordsbenison.sk" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#002b4e] hover:text-brand-orange transition-colors">
                              www.lordsbenison.sk
                            </a>
                            <a href="https://www.moja-stavba.sk" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#002b4e] hover:text-brand-orange transition-colors block">
                              www.moja-stavba.sk
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop verzia - pôvodná */}
                <div className="hidden lg:block">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Identifikačné údaje:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Fingerprint size={14} className="text-brand-orange" />
                          <span className="text-xs font-bold text-slate-700">IČO: 52404901</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <IdCard size={14} className="text-brand-orange" />
                          <span className="text-xs font-bold text-slate-700">DIČ: 2121022992</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <ShieldCheck size={14} className="text-brand-orange mt-0.5" />
                          <span className="text-xs font-bold text-slate-700 leading-relaxed">
                            IČ DPH: SK2121022992
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Adresa spoločnosti:</h4>
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-brand-orange mt-1" />
                        <div className="text-xs font-bold text-slate-700 space-y-2">
                          <div className="leading-relaxed">LORD'S BENISON s.r.o.</div>
                          <div className="leading-relaxed">M. Nandrássyho 654/10</div>
                          <div className="leading-relaxed">050 01 Revúca</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Naše weby Section - len pre desktop */}
                <div className="hidden lg:block space-y-4 pt-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-brand-orange/50 to-brand-orange"></div>
                    <h4 className="text-brand-orange font-bold text-xs uppercase tracking-wider whitespace-nowrap">Naše weby</h4>
                    <div className="w-12 h-px bg-gradient-to-l from-transparent via-brand-orange/50 to-brand-orange"></div>
                  </div>
                  <div className="space-y-4 pl-4">
                    <div className="flex items-center gap-4 group">
                      <div className="w-2.5 h-2.5 bg-brand-orange rounded-full group-hover:scale-125 transition-transform"></div>
                      <a href="https://www.lordsbenison.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-[#002b4e] hover:text-brand-orange transition-colors">
                        www.lordsbenison.sk
                      </a>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-2.5 h-2.5 bg-brand-orange rounded-full group-hover:scale-125 transition-transform"></div>
                      <a href="https://www.moja-stavba.sk" target="_blank" rel="noopener noreferrer" className="font-bold text-[#002b4e] hover:text-brand-orange transition-colors">
                        www.moja-stavba.sk
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>


                      

            <div className={`hidden lg:block transition-all duration-1000 delay-300 transform ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,43,78,0.12)] border border-slate-50 relative overflow-hidden group">
                <div className="mb-10 text-left relative">
                  <h3 className="text-3xl font-black text-[#002b4e] tracking-tight">Nezáväzný dopyt</h3>
                  <p className="text-slate-400 text-sm font-medium mt-2">Vyplňte formulár a my sa vám ozveme späť.</p>
                  <div className="absolute -bottom-4 left-0 h-0.5 bg-gradient-to-r from-brand-orange via-brand-orange/50 to-transparent rounded-full transition-all duration-[1500ms] ease-out" 
                       style={{ width: isLoaded ? '120px' : '0px' }}></div>
                </div>
                
                <form id="contact-form" className="space-y-4 font-sans" onSubmit={handleSubmit}>
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
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Oblasť záujmu</label>
                      <div className="relative">
                        <select 
                          name="oblast"
                          value={formData.oblast}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all cursor-pointer appearance-none"
                        >
                          <option value="GDPR - Ochrana údajov">GDPR - Ochrana údajov</option>
                          <option value="Všeobecné obchodné podmienky">Všeobecné obchodné podmienky</option>
                          <option value="AML - Program vlastnej činnosti">AML - Program vlastnej činnosti</option>
                          <option value="Konzultácia & Audit">Konzultácia & Audit</option>
                          <option value="Iná požiadavka">Iná požiadavka</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" size={18} />
                      </div>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider ml-1">Vaša správa</label>
                      <textarea 
                        rows={4} 
                        name="message"
                        value={formData.message || ''}
                        onChange={handleChange}
                        placeholder="Stručne popíšte vašu požiadavku..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-normal text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all resize-none"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex items-start gap-3 mb-4">
                      <input 
                        type="checkbox" 
                        id="gdpr-consent"
                        checked={gdprConsent}
                        onChange={(e) => setGdprConsent(e.target.checked)}
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
                      className="w-full py-4 bg-brand-orange text-white rounded-xl font-bold uppercase text-xs tracking-wider shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                    >
                      {isSubmitting ? (
                        <><RefreshCw className="animate-spin" size={18} /> Odosielam...</>
                      ) : (
                        <>Odoslať správu <Send size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /></>
                      )}
                    </button>
                  </form>
                  
                  {/* Success/Error Messages */}
                  {submitStatus === 'success' && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                        <h4 className="text-lg font-semibold text-emerald-800">Správa odoslaná!</h4>
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
                      <p className="text-sm text-rose-600">Nepodarilo sa odoslať správu. Skúste to prosím znova.</p>
                    </div>
                  )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <footer id="footer-info" className="bg-[#001c36] text-white py-12 relative overflow-hidden border-t border-white/5 text-left">
        <div className="max-w-7xl mx-auto px-10 relative z-10">
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
                  href="/zasady-cookies.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white/40 hover:text-white transition-colors cursor-pointer text-center lg:text-left"
                >
                  Zásady Cookies
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex justify-start items-center gap-8">
            <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-brand-orange">LORD'S BENISON S.R.O. | Váš partner vo svete podnikania</p>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </div>
  );
};