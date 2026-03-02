
import React, { useState, useEffect } from 'react';
import { useTraining, Training } from './TrainingStore';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/ToastContext';
import { calculateSmartPricing, validateOrder, formatPrice, getTierDescription } from '../lib/pricing';
import { 
  Search, 
  Clock, 
  Zap, 
  ChevronRight,
  CheckCircle2,
  X,
  BookOpen,
  HelpCircle,
  Send,
  Loader2,
  ArrowLeft,
  Target,
  Minus,
  Plus,
  Layers,
  ShieldCheck,
  Info,
  CreditCard,
  Building2,
  Trophy,
  Mail,
  CalendarCheck,
  BadgeCheck,
  Camera,
  ShoppingCart,
  Check,
  Sparkles,
  ArrowRight,
  Play,
  Users,
  StickyNote,
  User,
  FileBadge,
  ChevronDown,
  Star
} from 'lucide-react';

export const TrainingMarketplace = () => {
  const { state } = useTraining();
  const { showToast } = useToast();
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [activeTab, setActiveTab] = useState<'popis' | 'obsah' | 'faq' | 'poznámka'>('popis');
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set([0]));
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fakturačné údaje
  const [invoiceData, setInvoiceData] = useState({
    company_name: '',
    ico: '',
    dic: '',
    icdph: '',
    address: '',
    email: ''
  });
  
  const [totalQty, setTotalQty] = useState(10);
  const [premiumQty, setPremiumQty] = useState(2);
  const [expertQty, setExpertQty] = useState(1);
  const [baseSeats, setBaseSeats] = useState({ total: 0, experts: 0 });
  const [usage, setUsage] = useState({ used_standard: 0, used_premium: 0 });

  useEffect(() => {
    if (selectedTraining) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTraining]);

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const userId = session.user.id;
      
      // Načítanie emailu pre fakturačné údaje
      const { data: profile } = await supabase.from('employees').select('company_token, email, company_name').eq('id', userId).maybeSingle();
      const companyToken = profile?.company_token;
      
      // Predvyplnenie emailu v fakturačných údajoch
      if (profile?.email && !invoiceData.email) {
        setInvoiceData(prev => ({ ...prev, email: profile.email }));
      }
      if (profile?.company_name && !invoiceData.company_name) {
        setInvoiceData(prev => ({ ...prev, company_name: profile.company_name }));
      }
      
      // Získať zamestnancov s rovnakým company_token
      const { data: teamData } = await supabase.from('employees').select('id').eq('company_token', companyToken);
      const teamIds = teamData?.map(e => e.id) || [];
      
      const [purchasesRes, assignmentsData] = await Promise.all([
        supabase.from('company_purchases').select('*').eq('company_id', userId).eq('status', 'active'),
        supabase.from('employee_trainings').select('*, training:trainings(*)').in('employee_id', teamIds)
      ]);

      const totalS = (purchasesRes.data || []).reduce((acc, p) => acc + (p.total_licenses || p.quantity || 0), 0);
      const totalP = (purchasesRes.data || []).reduce((acc, p) => acc + (p.premium_licenses || 0), 0);
      
      // Oprava: Štandardné licencie = celkový počet - premium - expert
      const standardSeats = totalS - totalP - expertQty;
      
      setBaseSeats({ total: standardSeats, experts: totalP, expert: expertQty });

      if (teamIds.length > 0 && assignmentsData?.data) {
        let usedS = 0, usedP = 0, usedE = 0;
        assignmentsData.data.forEach((at: any) => {
          const trainingType = at.training?.training_type || (at.training?.is_premium ? 'premium' : 'standard');
          if (trainingType === 'expert') usedE++;
          else if (trainingType === 'premium') usedP++;
          else usedS++;
        });
        setUsage({ used_standard: usedS, used_premium: usedP, used_expert: usedE });
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (state.trainings.length > 0) fetchStats(); }, [state.trainings]);

  const pricing = calculateSmartPricing(totalQty, premiumQty, expertQty);

  const handleRequestQuota = async () => {
    // Validácia objednávky
    const validation = validateOrder(totalQty, premiumQty, expertQty);
    if (!validation.isValid) {
      showToast(validation.error || 'Chyba v objednávke', 'error');
      return;
    }

    setShowQuotaModal(false);
    setShowInvoiceModal(true);
  };

  const handleFinalSubmit = async () => {
    // Validácia fakturačných údajov
    if (!invoiceData.company_name || !invoiceData.ico || !invoiceData.address || !invoiceData.email) {
      showToast("Vyplňte všetky povinné fakturačné údaje", 'error');
      return;
    }

    // Validácia objednávky
    const validation = validateOrder(totalQty, premiumQty, expertQty);
    if (!validation.isValid) {
      showToast(validation.error || 'Chyba v objednávke', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Musíte byť prihlásený");
      
      const { error } = await supabase.from('license_requests').insert({
        company_id: session.user.id,
        quantity: totalQty,
        premium_quantity: premiumQty,
        expert_quantity: expertQty,
        estimated_price: pricing.total,
        status: 'pending',
        // Pridanie fakturačných údajov
        invoice_company_name: invoiceData.company_name,
        invoice_ico: invoiceData.ico,
        invoice_dic: invoiceData.dic,
        invoice_icdph: invoiceData.icdph,
        invoice_address: invoiceData.address,
        invoice_email: invoiceData.email
      });
      
      if (error) throw error;
      
      setShowInvoiceModal(false);
      setShowSuccessModal(true);
      
      // Reset fakturačných údajov
      setInvoiceData({
        company_name: '',
        ico: '',
        dic: '',
        icdph: '',
        address: '',
        email: ''
      });
      
    } catch (err: any) {
      showToast("Chyba: " + err.message, 'error');
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const toggleLesson = (idx: number) => {
    const next = new Set(expandedLessons);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedLessons(next);
  };

  const formatDuration = (mins: number) => {
    if (mins === 60) return "1 hodina";
    if (mins > 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h} ${h === 1 ? 'hod' : 'hod'} ${m > 0 ? m + ' min' : ''}`;
    }
    return `${mins} minút`;
  };

  const filteredTrainings = state.trainings.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedTraining) {
    const rawObjectives = selectedTraining.objectives || (selectedTraining as any).learning_objectives || [];
    const currentObjectives = Array.isArray(rawObjectives) 
      ? rawObjectives.filter(o => typeof o === 'string' && o.trim() !== '') 
      : [];

    return (
      <div className="animate-fade-in space-y-8 pb-20 text-left text-slate-900 max-w-7xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">
                {selectedTraining.title}
              </h1>
              <p className="text-base text-slate-500 leading-relaxed max-w-2xl font-medium">
                {selectedTraining.description}
              </p>
            </div>

            <div className="pt-4">
              <div className="flex border-b border-slate-200 gap-8">
                {[
                  { id: 'popis', label: 'O školení' },
                  { id: 'obsah', label: 'Osnova' },
                  { id: 'faq', label: 'Časté otázky' },
                  { id: 'poznámka', label: 'Dôležité' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 font-bold text-[11px] uppercase tracking-widest border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-brand-orange text-slate-900'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="py-8 animate-in fade-in duration-500 text-left">
                {activeTab === 'popis' && (
                  <div className="space-y-12 max-w-3xl text-left">
                    <div className="prose prose-slate max-w-none">
                       <p className="text-slate-600 text-base leading-relaxed font-medium whitespace-pre-wrap">
                         {selectedTraining.full_description || selectedTraining.description}
                       </p>
                    </div>

                    {currentObjectives.length > 0 && (
                      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00427a]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-opacity opacity-50 group-hover:opacity-100"></div>
                        <div className="p-10 relative z-10">
                          <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00427a] flex items-center justify-center shadow-sm border border-blue-100">
                              <Star size={24} fill="currentColor" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Čo sa u nás naučíte</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Kľúčové ciele vzdelávania</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
                            {currentObjectives.map((obj, i) => (
                              <div key={i} className="flex gap-4 group/item items-start">
                                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all duration-300">
                                  <Check size={14} strokeWidth={4} />
                                </div>
                                <span className="text-[14px] font-bold text-slate-700 leading-snug group-hover/item:text-[#00427a] transition-colors">{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'obsah' && (
                  <div className="space-y-3 max-w-3xl">
                    {selectedTraining.lessons?.length ? (
                      selectedTraining.lessons.map((l, i) => {
                        const isExpanded = expandedLessons.has(i);
                        return (
                          <div key={i} className={`bg-white rounded-2xl border transition-all overflow-hidden ${isExpanded ? 'border-brand-blue shadow-lg' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}>
                            <button 
                              onClick={() => toggleLesson(i)}
                              className="w-full p-5 flex items-center justify-between text-left group"
                            >
                              <div className="flex items-center gap-5">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black transition-all ${isExpanded ? 'bg-brand-blue text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                  {i+1}
                                </span>
                                <span className="font-bold text-slate-900 text-sm uppercase tracking-tight group-hover:text-brand-blue transition-colors">{l.title}</span>
                              </div>
                              <ChevronDown size={18} className={`text-slate-300 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-brand-blue' : ''}`} />
                            </button>
                            {isExpanded && (
                              <div className="px-5 pb-6 pt-0 animate-in slide-in-from-top-2 duration-500">
                                <div className="ml-13 border-l-2 border-slate-50 pl-5">
                                   <div className="text-slate-500 text-sm leading-relaxed font-medium prose prose-sm py-2" dangerouslySetInnerHTML={{ __html: l.description }}></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-bold uppercase text-[10px] tracking-widest">Osnova sa pripravuje.</div>
                    )}
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="space-y-6 max-w-3xl">
                    {selectedTraining.faq?.length ? (
                      selectedTraining.faq.map((f, i) => (
                        <div key={i} className="text-left space-y-3 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                          <h4 className="font-black text-slate-900 text-base flex gap-3 leading-tight uppercase tracking-tight text-left">
                             <HelpCircle size={20} className="text-brand-orange shrink-0" /> {f.question}
                          </h4>
                          <p className="text-slate-500 text-sm ml-8 leading-relaxed font-medium border-l-2 border-slate-50 pl-4 text-left">{f.answer}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic font-bold uppercase text-[10px] tracking-widest text-center py-16">Bez doplňujúcich otázok.</p>
                    )}
                  </div>
                )}

                {activeTab === 'poznámka' && (
                   <div className="p-8 bg-[#00427a]/5 rounded-[2.5rem] border border-[#00427a]/10 text-[#00427a] text-sm leading-relaxed max-w-3xl relative overflow-hidden">
                     <p className="font-semibold text-[#00427a] mb-4 uppercase text-xs tracking-wider flex items-center gap-2"><Info size={14}/> Odborná záruka</p>
                     <div className="font-medium italic border-l-2 border-[#00427a]/20 pl-6 text-left">
                        {selectedTraining.note || "Školenie je pravidelne aktualizované podľa platnej judikatúry k roku 2025."}
                     </div>
                   </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10 overflow-visible">
            <button 
              onClick={() => setSelectedTraining(null)} 
              className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all flex items-center justify-center gap-3 group shadow-sm"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Späť do katalógu
            </button>

            {/* BOX DETAILE ŠKOLENIA */}
            <div className="text-left bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col relative">
               <div className="p-8 pb-4">
                  <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-3 mb-8 text-left">
                    <Target size={18} className="text-brand-orange" /> Detaily školenia
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4 text-left">
                         <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-brand-blue transition-colors"><Clock size={18}/></div>
                         <span className="text-sm font-medium text-slate-600 text-left">Dĺžka</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-base text-right">{formatDuration(selectedTraining.duration)}</span>
                    </div>

                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4 text-left">
                         <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-brand-blue transition-colors"><Layers size={18}/></div>
                         <span className="text-sm font-medium text-slate-600 text-left">Lekcie</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-base text-right">{selectedTraining.lessons?.length || 0}</span>
                    </div>

                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4 text-left">
                         <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-brand-blue transition-colors"><HelpCircle size={18}/></div>
                         <span className="text-sm font-medium text-slate-600 text-left">Kvízy</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-base text-right">Obsiahnuté</span>
                    </div>

                    <div className="pt-6 border-t border-slate-50 space-y-4 text-left">
                       <div className="flex items-center gap-4 text-emerald-600 text-left">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><BadgeCheck size={18} /></div>
                          <span className="text-sm font-medium text-emerald-700 leading-normal text-left">Školenie obsahuje digitálny certifikát</span>
                       </div>
                       <div className="flex items-center gap-4 text-brand-blue text-left">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><CalendarCheck size={18} /></div>
                          <span className="text-sm font-medium text-blue-700 leading-normal text-left">Platná licencia na 12 mesiacov</span>
                       </div>
                    </div>
                  </div>
               </div>

               {/* SEKCIA ODBORNÝ GARANT - VNÚTRI BOXU DETAILE */}
               <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 relative overflow-visible">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-blue border border-slate-200 shadow-sm shrink-0">
                      <User size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-left flex-1 relative">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Vypracoval:</p>
                      <div className="relative">
                        <p className="font-black text-slate-900 text-lg tracking-tight whitespace-nowrap relative z-10">Mgr. Ivan Javorčík</p>
                        <img 
                          src="./public/podpis.png" 
                          alt="Podpis odborného garanta" 
                          className="absolute -right-16 -top-14 h-48 w-auto object-contain pointer-events-none z-[100] rotate-[-12deg] opacity-90 mix-blend-multiply transition-all duration-700 group-hover:scale-110 group-hover:rotate-[-8deg] group-hover:opacity-100" 
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 pb-20 text-left text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Nákup školení</h1>
              <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Vyberte si školenia, ktoré chcete aktivovať pre váš tím.</p>
        </div>
        <button onClick={() => setShowQuotaModal(true)} className="bg-slate-700 text-white px-8 py-3.5 rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 shrink-0 w-full md:w-auto">Zakúpiť licencie školení</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        {filteredTrainings.map(training => (
          <div 
            key={training.id} 
            onClick={() => setSelectedTraining(training)} 
            className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-brand-blue/30 transition-all group flex flex-col h-full relative cursor-pointer shadow-sm text-left"
          >
            <div className="h-44 relative overflow-hidden bg-slate-900 shrink-0">
               <img src={training.thumbnail || "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80"} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-[1.5s]" alt={training.title} />
               {training.category && training.category !== 'GDPR' && (
                 <div className="absolute top-5 left-5">
                   <span className="px-4 py-1.5 bg-brand-orange text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-xl">{training.category}</span>
                 </div>
               )}
               {training.is_premium && (
                 <div className="absolute top-5 right-5">
                   <span className="px-3 py-1.5 bg-slate-900 text-brand-orange rounded-xl text-[8px] font-black uppercase tracking-widest border border-brand-orange/20 shadow-xl flex items-center gap-1"><Zap size={10} fill="currentColor" /> Expert</span>
                 </div>
               )}
            </div>
            <div className="p-8 flex-1 flex flex-col space-y-6 text-left">
               <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight text-left">{training.title}</h3>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-3 leading-relaxed text-left">{training.description}</p>
               </div>
               <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-left">
                  <div className="text-left">
                     <span className="text-sm font-semibold text-brand-orange uppercase tracking-wide flex items-center gap-2 text-left hover:text-brand-orange/80 transition-colors relative">
                        zobraziť detail
                        <div className="absolute -bottom-0.5 left-0 right-0 h-px bg-slate-700"></div>
                     </span>
                  </div>
                  <button className="w-11 h-11 rounded-[1.2rem] bg-slate-950 text-white flex items-center justify-center group-hover:bg-brand-orange group-hover:scale-110 transition-all shadow-xl">
                    <ChevronRight size={20} />
                  </button>
               </div>
            </div>
         </div>
        ))}
      </div>

      {showQuotaModal && (
        <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQuotaModal(false)}></div>
           
           <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6 flex items-center justify-between">
                 <div>
                    <h2 className="text-xl font-semibold text-white">Konfigurácia licencií</h2>
                    <p className="text-sm text-slate-300 mt-1">Nastavte počet licencií pre vašu firmu</p>
                 </div>
                 <button onClick={() => setShowQuotaModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X size={20} className="text-white" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                 <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                       {/* Ľavá strana - Konfigurácia */}
                       <div className="space-y-6">
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                             <div className="flex items-center justify-between mb-4">
                                <div>
                                   <h3 className="font-semibold text-gray-900">1. Celkový počet zamestnancov</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                   <button 
                                     onClick={() => setTotalQty(Math.max(1, totalQty - 1))}
                                     className="w-8 h-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                                   >
                                     <Minus size={16} className="text-gray-600" />
                                   </button>
                                   <div className="w-16 text-center">
                                     <input 
                                       type="number" 
                                       value={totalQty} 
                                       onChange={e => setTotalQty(Math.max(1, parseInt(e.target.value) || 0))}
                                       className="w-full text-center text-lg font-semibold bg-transparent border-none outline-none"
                                     />
                                   </div>
                                   <button 
                                     onClick={() => setTotalQty(totalQty + 1)}
                                     className="w-8 h-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                                   >
                                     <Plus size={16} className="text-gray-600" />
                                   </button>
                                </div>
                             </div>
                          </div>

                          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                             <div className="flex items-center justify-between mb-4">
                                <div>
                                   <h3 className="font-semibold text-amber-900">2. Z toho oprávnené osoby</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                   <button 
                                     onClick={() => setPremiumQty(Math.max(0, Math.min(premiumQty - 1, totalQty)))}
                                     className="w-8 h-8 bg-white border border-amber-300 rounded-lg flex items-center justify-center hover:bg-amber-50 transition-colors"
                                   >
                                     <Minus size={16} className="text-amber-600" />
                                   </button>
                                   <div className="w-16 text-center">
                                     <input 
                                       type="number" 
                                       value={premiumQty} 
                                       onChange={e => setPremiumQty(Math.min(totalQty, Math.max(0, parseInt(e.target.value) || 0)))}
                                       className="w-full text-center text-lg font-semibold bg-transparent border-none outline-none text-amber-900"
                                     />
                                   </div>
                                   <button 
                                     onClick={() => setPremiumQty(Math.min(totalQty, premiumQty + 1))}
                                     className="w-8 h-8 bg-white border border-amber-300 rounded-lg flex items-center justify-center hover:bg-amber-50 transition-colors"
                                   >
                                     <Plus size={16} className="text-amber-600" />
                                   </button>
                                </div>
                             </div>
                          </div>

                          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                             <div className="flex items-center justify-between mb-4">
                                <div>
                                   <h3 className="font-semibold text-purple-900">3. Prístup ku kamerám</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                   <button 
                                     onClick={() => setExpertQty(Math.max(0, Math.min(expertQty - 1, premiumQty)))}
                                     className="w-8 h-8 bg-white border border-purple-300 rounded-lg flex items-center justify-center hover:bg-purple-50 transition-colors"
                                   >
                                     <Minus size={16} className="text-purple-600" />
                                   </button>
                                   <div className="w-16 text-center">
                                     <input 
                                       type="number" 
                                       value={expertQty} 
                                       onChange={e => setExpertQty(Math.min(premiumQty, Math.max(0, parseInt(e.target.value) || 0)))}
                                       className="w-full text-center text-lg font-semibold bg-transparent border-none outline-none text-purple-900"
                                     />
                                   </div>
                                   <button 
                                     onClick={() => setExpertQty(Math.min(premiumQty, expertQty + 1))}
                                     className="w-8 h-8 bg-white border border-purple-300 rounded-lg flex items-center justify-center hover:bg-purple-50 transition-colors"
                                   >
                                     <Plus size={16} className="text-purple-600" />
                                   </button>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Pravá strana - Súhrn a cena */}
                       <div className="space-y-6">
                          <div className="bg-white border border-gray-200 rounded-xl p-6">
                             <h3 className="font-semibold text-gray-900 mb-4">Súhrn licencií</h3>
                             <div className="space-y-2">
                                <div className="flex justify-between items-center py-1">
                                   <span className="text-sm text-gray-600">Štandardné licencie</span>
                                   <span className="font-medium text-gray-900">{totalQty - premiumQty}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                   <span className="text-sm text-gray-600">Oprávnené osoby</span>
                                   <span className="font-medium text-amber-900">{premiumQty}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                   <span className="text-sm text-gray-600">Prístup ku kamerám</span>
                                   <span className="font-medium text-purple-900">{expertQty}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                   <span className="text-sm text-gray-600">Celkom zamestnancov</span>
                                   <span className="font-semibold text-gray-900">{totalQty}</span>
                                </div>
                             </div>
                          </div>

                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-blue-700 font-medium">Ročná cena</span>
                                <span className="bg-blue-200 px-2 py-1 rounded text-xs text-blue-800">12 mesiacov</span>
                             </div>
                             <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                   <span className="text-sm text-blue-600">Základ dane</span>
                                   <span className="text-2xl font-bold text-blue-900">
                                      {pricing.isCustom ? 'Dohodou' : `${pricing.total} €`}
                                   </span>
                                </div>
                                <div className="flex justify-between items-center">
                                   <span className="text-sm text-blue-600">DPH (23%)</span>
                                   <span className="text-lg font-semibold text-blue-800">
                                      {pricing.isCustom ? 'Dohodou' : `${(pricing.total * 0.23).toFixed(2)} €`}
                                   </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                                   <span className="text-sm font-medium text-blue-700">Cena s DPH</span>
                                   <span className="text-2xl font-bold text-blue-900">
                                      {pricing.isCustom ? 'Dohodou' : `${(pricing.total * 1.23).toFixed(2)} €`}
                                   </span>
                                </div>
                             </div>
                             {!pricing.isCustom && (
                                <div className="text-sm text-blue-600 mt-2">
                                   Priemer: {((pricing.total * 1.23) / totalQty).toFixed(2)} € / zamestnanec
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="border-t border-gray-100 px-8 py-4 bg-gray-50">
                 <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setShowQuotaModal(false)}
                      className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                       Zrušiť
                    </button>
                    <button 
                      onClick={handleRequestQuota}
                      className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center gap-2"
                    >
                       Pokračovať na fakturačné údaje
                       <ArrowRight size={18} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInvoiceModal(false)}></div>
           
           <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <div className="border-b border-gray-100 px-8 py-6 flex items-center justify-between">
                 <div>
                    <h2 className="text-xl font-semibold text-gray-900">Fakturačné údaje</h2>
                    <p className="text-sm text-gray-500 mt-1">Doplňte informácie pre vystavenie faktúry</p>
                 </div>
                 <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X size={20} className="text-gray-400" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                 <div className="p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Názov firmy *</label>
                          <input 
                            type="text" 
                            value={invoiceData.company_name}
                            onChange={e => setInvoiceData({...invoiceData, company_name: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="Názov spoločnosti s.r.o."
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">IČO *</label>
                          <input 
                            type="text" 
                            value={invoiceData.ico}
                            onChange={e => setInvoiceData({...invoiceData, ico: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="12345678"
                          />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">DIČ</label>
                          <input 
                            type="text" 
                            value={invoiceData.dic}
                            onChange={e => setInvoiceData({...invoiceData, dic: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="SK1234567890"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">IČ DPH</label>
                          <input 
                            type="text" 
                            value={invoiceData.icdph}
                            onChange={e => setInvoiceData({...invoiceData, icdph: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="SK1234567890"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-700">Sídlo firmy *</label>
                       <input 
                         type="text" 
                         value={invoiceData.address}
                         onChange={e => setInvoiceData({...invoiceData, address: e.target.value})}
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                         placeholder="Hlavná 123, 811 02 Bratislava"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-700">E-mail pre faktúru *</label>
                       <input 
                         type="email" 
                         value={invoiceData.email}
                         onChange={e => setInvoiceData({...invoiceData, email: e.target.value})}
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                         placeholder="faktura@firma.sk"
                       />
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                       <h3 className="font-semibold text-gray-900 mb-4">Súhrn objednávky</h3>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-gray-600">Celkový počet zamestnancov</span>
                             <span className="font-medium text-gray-900">{totalQty} osôb</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-gray-600">Oprávnené osoby</span>
                             <span className="font-medium text-amber-900">{premiumQty} osôb</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-gray-600">Prístup ku kamerám</span>
                             <span className="font-medium text-purple-900">{expertQty} osôb</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                             <span className="text-sm font-medium text-gray-900">Základ dane</span>
                             <span className="font-medium text-gray-900">{pricing.total} €</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-gray-600">DPH (23%)</span>
                             <span className="font-medium text-gray-900">{(pricing.total * 0.23).toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                             <span className="font-medium text-gray-900">Celková cena s DPH</span>
                             <span className="text-lg font-bold text-blue-900">{(pricing.total * 1.23).toFixed(2)} €</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="border-t border-gray-100 px-8 py-4 bg-gray-50">
                 <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setShowInvoiceModal(false)}
                      className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                       Späť
                    </button>
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                       Odoslať dopyt
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[60000] flex items-center justify-center p-4 animate-in fade-in duration-500">
           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}></div>
           
           <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-500 p-8">
              <div className="text-center">
                 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={32} strokeWidth={3} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Dopyt odoslaný</h2>
                 <p className="text-gray-600 mb-8">Vaša požiadavka bola úspešne zaznamenaná v systéme</p>
                 
                 <div className="space-y-4 text-left mb-8">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                       <Mail className="text-blue-600" size={20} />
                       <div>
                          <h4 className="font-semibold text-blue-900">Faktúra e-mailom</h4>
                          <p className="text-sm text-blue-700">Na vašu adresu sme odoslali faktúru s informáciami k platbe</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                       <CalendarCheck className="text-gray-600" size={20} />
                       <div>
                          <h4 className="font-semibold text-gray-900">Spracovanie</h4>
                          <p className="text-sm text-gray-700">Vaša objednávka bude spracovaná do 24 hodín</p>
                       </div>
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => setShowSuccessModal(false)}
                   className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                 >
                    Rozumiem
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default TrainingMarketplace;
