import React from 'react';
import { ArrowRight, Building2, Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const LOGO_WHITE = '/biele.png';

type MarketingFooterProps = {
  onNavigate: (view: string, path: string) => void;
  onRegister: () => void;
};

export const MarketingFooter: React.FC<MarketingFooterProps> = ({ onNavigate, onRegister }) => (
  <footer id="footer-info" className="relative overflow-hidden bg-[#071326] text-white border-t border-white/5">
    <svg className="absolute inset-0 hidden h-full w-full pointer-events-none sm:block" viewBox="0 0 1600 560" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="#6b88ae" strokeWidth="1.2" opacity=".13">
        <path d="M0 112h310M0 292h220M1280 92h320M1370 310h230" />
        <path d="M92 42v455M1510 54v420" strokeDasharray="3 13" />
        <circle cx="92" cy="112" r="4" fill="#f7941d" stroke="none" opacity=".7" />
        <circle cx="1510" cy="310" r="4" fill="#f7941d" stroke="none" opacity=".7" />
      </g>
      <g transform="translate(-28 155) rotate(-4 130 150)" fill="none" stroke="#7895ba" strokeWidth="1.4" opacity=".16">
        <rect x="38" y="20" width="184" height="244" rx="9" />
        <path d="M177 20v48h45M72 102h111M72 130h82M72 158h98M72 204h68" />
        <circle cx="57" cy="102" r="5" /><circle cx="57" cy="130" r="5" /><circle cx="57" cy="158" r="5" />
        <path d="m53 102 3 3 6-7m-9 32 3 3 6-7m-9 32 3 3 6-7" stroke="#f7941d" />
      </g>
      <g transform="translate(1378 128) rotate(5 100 160)" fill="none" stroke="#7895ba" strokeWidth="1.4" opacity=".16">
        <path d="M24 12h155l43 43v245H24zM179 12v43h43" />
        <path d="M61 100h121M61 131h91M61 162h121M61 193h106" />
        <path d="M63 245c29-29 52 27 80-3 17-18 31-6 46 4" stroke="#f7941d" opacity=".85" />
        <path d="M61 265h128" />
      </g>
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
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-9 h-9 rounded-lg border border-white/10 text-white/45 flex items-center justify-center hover:text-white hover:border-brand-orange/50 hover:bg-brand-orange/10 transition-all"><Icon size={16} /></a>
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
            <a href="mailto:sluzby@lordsbenison.eu" className="flex gap-3 group"><Mail size={18} className="text-white/30 mt-0.5 group-hover:text-brand-orange transition-colors" /><span><span className="block text-[10px] uppercase tracking-[.16em] text-white/30 font-bold mb-1">E-mail</span><span className="text-sm text-white/75 group-hover:text-white">sluzby@lordsbenison.eu</span></span></a>
            <a href="tel:+421948225713" className="flex gap-3 group"><Phone size={18} className="text-white/30 mt-0.5 group-hover:text-brand-orange transition-colors" /><span><span className="block text-[10px] uppercase tracking-[.16em] text-white/30 font-bold mb-1">Telefón</span><span className="text-sm text-white/75 group-hover:text-white">+421 948 225 713</span></span></a>
            <div className="flex gap-3"><Clock size={18} className="text-white/30 mt-0.5" /><span><span className="block text-[10px] uppercase tracking-[.16em] text-white/30 font-bold mb-1">Pracovná doba</span><span className="text-sm text-white/75">Po – Pi, 08:00 – 16:30</span></span></div>
          </div>
        </div>

        <div className="text-left">
          <h4 className="text-brand-orange text-xs font-semibold uppercase tracking-[.13em] mb-6 after:block after:mt-3 after:h-px after:w-9 after:bg-brand-orange/45">Prevádzkovateľ</h4>
          <div className="flex gap-3 mb-5"><Building2 size={18} className="text-white/30 mt-0.5" /><div><p className="text-sm font-bold text-white/90">LORD'S BENISON s.r.o.</p><p className="text-sm leading-6 text-white/50 mt-2">M. Nandrássyho 654/10<br/>050 01 Revúca</p></div></div>
          <div className="flex gap-3 mb-6"><MapPin size={18} className="text-white/30 mt-0.5" /><p className="text-xs leading-6 text-white/40">IČO: 52404901<br/>DIČ: 2121022992<br/>IČ DPH: SK2121022992</p></div>
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
);
