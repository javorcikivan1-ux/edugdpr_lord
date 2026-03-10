
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthService';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Play, 
  HelpCircle, 
  BookOpen,
  Award,
  ChevronRight,
  ShieldCheck,
  X,
  RefreshCw,
  Trophy,
  Download,
  Printer,
  FileText,
  Zap,
  Target,
  AlertTriangle,
  ChevronLeft,
  Loader2,
  Calendar,
  AlertOctagon,
  History,
  Eye,
  Archive,
  Check,
  Layers,
  BadgeCheck,
  CalendarCheck,
  User,
  Info,
  ChevronDown
} from 'lucide-react';

// --- KOMPONENT PROFESIONÁLNEHO CERTIFIKÁTU ---
export const CertificateModal = ({ isOpen, onClose, data }: any) => {
  if (!isOpen || !data) return null;

  // Kontrola expirácie na základe konkrétneho certifikátu
  const isExpired = data.validUntil && new Date(data.validUntil) < new Date();

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 text-left">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        <div className="absolute top-6 right-6 flex gap-2 z-[100] no-print">
          <button onClick={() => window.print()} className="p-4 bg-white/90 text-slate-900 rounded-2xl hover:bg-brand-blue hover:text-white transition-all shadow-xl backdrop-blur-md border border-slate-200">
            <Printer size={22} />
          </button>
          <button onClick={onClose} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-xl">
            <X size={22} />
          </button>
        </div>

        <div className="relative aspect-[1.414/1] w-full bg-slate-100 overflow-hidden print:m-0 shadow-inner text-left text-slate-900">
           {isExpired && (
             <div className="absolute inset-0 flex items-center justify-center z-[50] pointer-events-none">
                <div className="rotate-[35deg] border-[12px] border-rose-600/30 px-16 py-8 rounded-[4rem] bg-white/10 backdrop-blur-[2px]">
                   <span className="text-8xl font-black text-rose-600/20 uppercase tracking-[0.2em] whitespace-nowrap">ARCHÍV / EXPIROVANÉ</span>
                </div>
             </div>
           )}

           <img src="/certifikat.png" className="absolute inset-0 w-full h-full object-cover" alt="Background" />
           
           <div className="absolute inset-0 flex flex-col items-center justify-start text-center p-12 md:p-20 pt-24 md:pt-32 z-10">
              <div className="space-y-1">
                 <h2 className="text-4xl md:text-5xl font-black text-[#437680] tracking-tighter uppercase drop-shadow-sm">CERTIFIKÁT</h2>
                 <p className="text-[10px] md:text-xs font-black text-brand-orange uppercase tracking-[0.5em]">Osvedčenie o absolvovaní odborného školenia</p>
              </div>

              <div className="mt-8 md:mt-10 space-y-1 text-center">
                <p className="text-slate-400 font-serif italic text-base md:text-lg">týmto potvrdzujeme, že</p>
                <h3 className="relative top-2 md:top-3 text-3xl md:text-5xl font-black text-[#437680] tracking-tight leading-tight px-10 border-b-2 border-[#437680]/10 pb-2 inline-block">
                  {data.userName}
                </h3>
              </div>

               <div className="mt-2 md:mt-4 max-w-3xl space-y-1 text-center">
                <p className="text-slate-500 font-medium text-[10px] md:text-xs leading-relaxed uppercase tracking-widest opacity-80">
                  úspešne absolvoval vzdelávací program:
                </p>
                <div className="px-10 translate-y-2 md:translate-y-3">
                  <h4 className="text-xl md:text-2xl font-black text-[#437680] tracking-tight leading-tight">
                    {data.trainingTitle}
                  </h4>
                </div>
              </div>

              <div className="absolute bottom-12 left-12 right-40 flex items-end justify-between">
                <div className="text-left space-y-4">
                   <div className="space-y-1.5 text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Identifikátor certifikátu</p>
                      <p className="font-mono font-bold text-slate-700 text-xs md:text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">{data.certNumber}</p>
                   </div>
                   <div className="space-y-1.5 text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dátum vystavenia</p>
                      <p className="font-mono font-bold text-slate-700 text-xs md:text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">{data.date}</p>
                   </div>
                   {isExpired && (
                     <div className="flex items-center gap-2 text-rose-600 font-black text-[9px] uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                        <AlertOctagon size={12}/> Platnosť skončila: {new Date(data.validUntil).toLocaleDateString('sk-SK')}
                     </div>
                   )}
                </div>

                <div className="relative group flex flex-col items-center">
                   <div className="relative w-32 h-32 md:w-44 md:h-44 flex items-center justify-center">
                      <img src="/peciatka.png" className="w-full h-full object-contain transform -rotate-2 group-hover:rotate-0 transition-transform duration-700 drop-shadow-xl" alt="Stamp" />
                   </div>
                </div>
              </div>

              <p className="absolute bottom-8 left-0 right-0 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Vydané spoločnosťou LORD´S BENISON s.r.o.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- INTERFACES ---
interface Training {
  id: string;
  title: string;
  description: string;
  duration?: number;
  category: string;
}

interface TrainingModule {
  id: string;
  title: string;
  content: string;
  module_type: 'text' | 'video' | 'quiz';
  order_index: number;
}

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  valid_until: string;
  score: number;
}

interface EmployeeTraining {
  id: string;
  training_id: string;
  status: 'assigned' | 'in_progress' | 'completed';
  progress_percentage: number;
  completed_at?: string;
  training?: Training;
  is_expired?: boolean;
  valid_until?: string;
  certs?: Certificate[]; // Pole všetkých certifikátov pre históriu
}

export const EmployeeTrainingView: React.FC = () => {
  const { state } = useAuth();
  const [assignedTrainings, setAssignedTrainings] = useState<EmployeeTraining[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<EmployeeTraining | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'popis' | 'obsah' | 'faq' | 'poznámka'>('popis');
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set([0]));

  const [expiringSoonList, setExpiringSoonList] = useState<EmployeeTraining[]>([]);
  const [showCert, setShowCert] = useState(false);
  const [certData, setCertData] = useState<any>(null);
  
  const [viewingHistory, setViewingHistory] = useState<EmployeeTraining | null>(null);

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [gdprTestCompleted, setGdprTestCompleted] = useState(false);

  const formatDuration = (mins: number) => {
    if (mins === 60) return "1 hodina";
    if (mins > 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h} ${h === 1 ? 'hod' : 'hod'} ${m > 0 ? m + ' min' : ''}`;
    }
    return `${mins} minút`;
  };

  const toggleLesson = (idx: number) => {
    const next = new Set(expandedLessons);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedLessons(next);
  };

  const fetchAssignedTrainings = useCallback(async () => {
    if (!state.user?.id) return;
    setFetchLoading(true);
    try {
      // Stiahneme priradenia a VŠETKY certifikáty k nim (bez limitu)
      const { data, error } = await supabase
        .from('employee_trainings')
        .select(`*, training:trainings(*, lessons:training_modules(*)), certs:certificates(*)`)
        .eq('employee_id', state.user.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      
      const now = new Date();
      const enriched = (data || []).map(at => {
        // Sortujeme certifikáty od najnovšieho
        const sortedCerts = (at.certs || []).sort((a: any, b: any) => 
          new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
        );

        const latestCert = sortedCerts[0];
        const validUntil = latestCert?.valid_until;
        const isExpired = validUntil ? new Date(validUntil) < now : false;

        return { ...at, is_expired: isExpired, valid_until: validUntil, certs: sortedCerts };
      });

      setAssignedTrainings(enriched);

      const expiring = enriched.filter(at => {
        if (at.status !== 'completed' || !at.valid_until) return false;
        const vUntil = new Date(at.valid_until);
        const diffDays = Math.ceil((vUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
      });
      setExpiringSoonList(expiring);

    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setFetchLoading(false);
    }
  }, [state.user?.id]);

  // useEffect pre automatické načítanie modulov - odstránené, lebo nechceme automaticky spúšťať player
  // Moduly sa budú načítavať až po kliknutí na tlačidlo v detail view
  
  // useEffect pre reset modulov keď sa zmení selectedTraining (pre zabezpečenie čistého stavu)
  useEffect(() => {
    if (selectedTraining) {
      // Resetujeme moduly keď sa otvorí detail, aby sa zabezpečilo čistý stav
      setModules([]);
      setCurrentModuleIndex(0);
      setShowResults(false);
      console.log('🔄 Resetovaný stav pre detail kurzu:', selectedTraining.training?.title);
    }
  }, [selectedTraining?.id]);

  const loadModulesForTraining = async (employeeTraining: EmployeeTraining) => {
    try {
      setLoading(true);
      const { data: modulesData, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('training_id', employeeTraining.training_id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (!modulesData?.length) {
        console.error("Žiadne moduly nájdené");
        return;
      }
      
      console.log('📦 Načítané moduly:', modulesData.length, 'modulov');
      
      // Vypočítaj aktuálny modul na základe progressu
      const currentProgress = employeeTraining.progress_percentage || 0;
      // Opačný výpočet ako v nextModule: progress = ((index + 1) / modules.length) * 100
      // Preto: index = (progress / 100 * modules.length) - 1
      let currentModuleIdx = Math.round((currentProgress / 100) * modulesData.length) - 1;
      if (currentModuleIdx < 0) currentModuleIdx = 0;
      if (currentModuleIdx >= modulesData.length) currentModuleIdx = modulesData.length - 1;
      
      console.log('📊 Aktualny progress:', currentProgress + '%', '-> modul:', currentModuleIdx, '(max:', modulesData.length - 1, ')');
      
      setModules(modulesData);
      setCurrentModuleIndex(currentModuleIdx);
      setShowResults(false);

    } catch (error) {
      console.error('Chyba pri načítaní modulov:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignedTrainings(); }, [fetchAssignedTrainings]);

  // Počúvanie na udalosť z GDPR testu
  useEffect(() => {
    const handleGdprTestCompleted = (event: any) => {
      console.log('🎯 GDPR test bol vyhodnotený!', event.detail);
      setGdprTestCompleted(true);
    };

    const handleSecurityTestCompleted = (event: any) => {
      console.log('� Security test bol vyhodnotený!', event.detail);
      setGdprTestCompleted(true);
    };

    console.log('� Nastavujem listener na gdprTestCompleted a securityTestCompleted');
    window.addEventListener('gdprTestCompleted', handleGdprTestCompleted);
    window.addEventListener('securityTestCompleted', handleSecurityTestCompleted);
    
    return () => {
      console.log('🔇 Odstraňujem listener na gdprTestCompleted a securityTestCompleted');
      window.removeEventListener('gdprTestCompleted', handleGdprTestCompleted);
      window.removeEventListener('securityTestCompleted', handleSecurityTestCompleted);
    };
  }, []);

  // Debug useEffect pre sledovanie gdprTestCompleted stavu
  useEffect(() => {
    console.log('🎯 gdprTestCompleted stav sa zmenil:', gdprTestCompleted);
    console.log('📋 Aktuálne selectedTraining:', selectedTraining?.training?.title);
    const isSecurityTraining = selectedTraining?.training?.title?.toLowerCase().includes('security') || selectedTraining?.training?.title?.toLowerCase().includes('bezpečnosť');
    const isGdprTraining = selectedTraining?.training?.title?.toLowerCase().includes('gdpr');
    const shouldBeDisabled = loading || ((isGdprTraining || isSecurityTraining) && !gdprTestCompleted);
    console.log('🔒 Tlačidlo by malo byť disabled:', shouldBeDisabled, { loading, isGdprTraining, isSecurityTraining, gdprTestCompleted });
  }, [gdprTestCompleted, selectedTraining, loading]);

  // LocalStorage polling pre odomknutie testu (každých 50ms)
  useEffect(() => {
    console.log('🔄 Spúšťam localStorage polling pre test odomknutie');
    const interval = setInterval(() => {
      if (selectedTraining) {
        const securityFlag = localStorage.getItem('securityTestUnlocked');
        const gdprFlag = localStorage.getItem('gdprTestUnlocked');
        console.log('🔍 Kontrolujem localStorage:', { securityFlag, gdprFlag, gdprTestCompleted });
        
        if (securityFlag === 'true' || gdprFlag === 'true') {
          console.log('✅ Našiel som flag v localStorage, odomykam tlačidlo');
          
          // Načítaj výsledky z localStorage ak existujú
          const savedResults = localStorage.getItem('testResults');
          if (savedResults) {
            console.log('📊 Načítavam uložené výsledky testu:', JSON.parse(savedResults));
            setTestResults(JSON.parse(savedResults));
            console.log('📊 Načítal som uložené výsledky testu');
          } else {
            console.log('📊 Žiadne uložené výsledky testu');
          }
          
          setGdprTestCompleted(true);
          clearInterval(interval);
        } else {
          // Ak nie je flag, vymaž výsledky (pre prípad nového kurzu)
          setTestResults(null);
        }
      }
    }, 50);

    return () => {
      console.log('🛑 Zastavujem localStorage polling');
      clearInterval(interval);
    };
  }, [selectedTraining]);

  const openSpecificCert = (at: EmployeeTraining, cert: Certificate) => {
    setCertData({
      userName: `${state.user?.firstName} ${state.user?.lastName}`,
      trainingTitle: at.training?.title,
      certNumber: cert.certificate_number,
      date: new Date(cert.issued_at).toLocaleDateString('sk-SK'),
      validUntil: cert.valid_until
    });
    setShowCert(true);
  };

  const startTraining = async (employeeTraining: EmployeeTraining) => {
    console.log('🚀 Otváram detail kurzu:', employeeTraining.training?.title);
    
    // VŽDY len zobrazíme detail pohľad - player sa spustí až po kliknutí na tlačidlo v detail
    setSelectedTraining(employeeTraining);
  };

  const launchTrainingPlayer = async (employeeTraining: EmployeeTraining) => {
    console.log('🎮 Spúšťam player pre kurz:', employeeTraining.training?.title);
    
    // Vyčistíme localStorage pri každom novom spustení kurzu
    localStorage.removeItem('securityTestUnlocked');
    localStorage.removeItem('gdprTestUnlocked');
    localStorage.removeItem('testResults');
    setTestResults(null);
    setGdprTestCompleted(false);
    console.log('🧹 Vyčistené localStorage pred spustením kurzu');
    
    setLoading(true);
    try {
      const { data: modulesData, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('training_id', employeeTraining.training_id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (!modulesData?.length) return alert("Obsah školenia sa pripravuje.");
      
      console.log('🎯 Načítané moduly:', modulesData.length);
      
      // Vypočítaj správny modul na základe progressu
      const currentProgress = employeeTraining.progress_percentage || 0;
      let currentModuleIdx = 0;
      
      if (currentProgress > 0) {
        currentModuleIdx = Math.round((currentProgress / 100) * modulesData.length) - 1;
        if (currentModuleIdx < 0) currentModuleIdx = 0;
        if (currentModuleIdx >= modulesData.length) currentModuleIdx = modulesData.length - 1;
        console.log('📊 Pokračujem v module:', currentModuleIdx, 'podľa progress:', currentProgress + '%');
      } else {
        console.log('📊 Začínam od začiatku, progress = 0%');
      }
      
      setModules(modulesData);
      setSelectedTraining(employeeTraining);
      setCurrentModuleIndex(currentModuleIdx);
      setShowResults(false);

      // Aktualizujeme status na in_progress
      const { error: updateError } = await supabase.from('employee_trainings').update({ 
        status: 'in_progress'
      }).eq('id', employeeTraining.id);

      if (updateError) {
        console.error('Chyba pri aktualizácii statusu:', updateError);
      }

    } catch (error) { 
      console.error('Chyba pri spúšťaní kurzu:', error);
      alert('Nastala chyba pri spúšťaní kurzu.');
    } finally { 
      setLoading(false); 
    }
  };

  const nextModule = async () => {
    if (currentModuleIndex < modules.length - 1) {
      const nextIdx = currentModuleIndex + 1;
      setCurrentModuleIndex(nextIdx);
      const progress = Math.round(((nextIdx + 1) / modules.length) * 100);
      await supabase.from('employee_trainings').update({ progress_percentage: progress }).eq('id', selectedTraining?.id);
    } else {
      await completeTraining();
    }
  };

  const prevModule = async () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const completeTraining = async () => {
    if (!selectedTraining) return;
    setLoading(true);
    try {
      const completedAt = new Date().toISOString();
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + 6);

      const certNumber = `LB-${selectedTraining.id.slice(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      await supabase.from('employee_trainings').update({
        status: 'completed',
        progress_percentage: 100,
        completed_at: completedAt
      }).eq('id', selectedTraining.id);

      await supabase.from('certificates').insert({
        employee_id: state.user?.id,
        training_id: selectedTraining.training_id,
        employee_training_id: selectedTraining.id,
        certificate_number: certNumber,
        score: 100,
        issued_at: completedAt,
        valid_until: validUntil.toISOString()
      });

      setCertData({
        userName: `${state.user?.firstName} ${state.user?.lastName}`,
        trainingTitle: selectedTraining.training?.title,
        certNumber: certNumber,
        date: new Date().toLocaleDateString('sk-SK'),
        validUntil: validUntil.toISOString()
      });
      
      // Zatvoríme player a zobrazíme certifikát
      setModules([]);
      setSelectedTraining(null);
      setShowCert(true);
      
      // Vyčistíme localStorage po úspešnom dokončení
      localStorage.removeItem('securityTestUnlocked');
      localStorage.removeItem('gdprTestUnlocked');
      localStorage.removeItem('testResults');
      console.log('🧹 Vyčistené localStorage po dokončení kurzu');
      
      // Po zobrazení certifikátu obnovíme dáta
      setTimeout(() => {
        fetchAssignedTrainings();
      }, 1000);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // Reset GDPR test stavu keď sa mení vybrané školenie
  useEffect(() => {
    if (selectedTraining) {
      // Vždy resetujeme testResults pri zmene kurzu
      setTestResults(null);
      
      // Skontrolujeme, či už bol test dokončený (flag v localStorage)
      const securityFlag = localStorage.getItem('securityTestUnlocked');
      const gdprFlag = localStorage.getItem('gdprTestUnlocked');
      
      if (securityFlag === 'true' || gdprFlag === 'true') {
        console.log('🎯 Test už bol dokončený pre tento kurz, zachovávam stav');
        setGdprTestCompleted(true);
      } else {
        // Resetujeme GDPR test stav pre nové školenie
        console.log('🔄 Resetujem test stav pre nový kurz');
        setGdprTestCompleted(false);
      }
    }
  }, [selectedTraining]);

  if (fetchLoading) return <div className="py-40 text-center"><RefreshCw className="animate-spin inline text-brand-blue" size={32}/><p className="mt-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Autorizácia...</p></div>;

  // --- PLAYER UI ---
  if (selectedTraining && modules.length > 0) {
    const currentModule = modules[currentModuleIndex];
    const progress = Math.round(((currentModuleIndex + 1) / modules.length) * 100);

    return (
      <div className="fixed inset-0 z-[5000] bg-white flex flex-col font-sans overflow-hidden text-left text-slate-900 animate-fade-in">
        <header className="w-full border-b border-slate-100 bg-white shrink-0">
          <div className="w-full px-8 lg:px-12 py-4 flex items-center justify-between">
              <div className="flex items-center gap-8">
                 <div className="relative">
                    <h1 className="text-3xl font-semibold text-slate-900 leading-none tracking-tight">{selectedTraining.training?.title}</h1>
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-brand-orange/50 rounded-full"></div>
                 </div>
                 <p className="text-base font-semibold text-slate-600 mt-2 flex items-center gap-2">
                      <Clock size={16} className="text-brand-orange" /> 
                      Modul {currentModuleIndex + 1} z {modules.length}
                    </p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="hidden lg:block">
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-3">
                       <span>Pokrok v školení</span>
                       <span className="text-brand-orange font-black">{progress}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden w-48">
                       <div className="h-full bg-gradient-to-r from-brand-orange to-orange-500 transition-all duration-700 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                 </div>
                 <button 
                   onClick={() => setShowExitConfirm(true)} 
                   className="w-10 h-10 rounded-xl bg-slate-100/80 border border-slate-200/50 flex items-center justify-center text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all hover:scale-110 hover:shadow-md backdrop-blur-sm"
                 >
                   <X size={20} strokeWidth={2.5} />
                 </button>
              </div>
           </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden">
           <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
              <div className="max-w-7xl mx-auto">
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 lg:p-8">
                       <div className="flex items-start gap-6 mb-4">
                          <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                             <div className="w-6 h-6 bg-brand-orange rounded-lg flex items-center justify-center text-white font-black text-sm">
                               {currentModuleIndex + 1}
                             </div>
                          </div>
                          <div className="flex-1 min-w-0">
                             <h2 className="text-xl lg:text-2xl font-bold text-slate-900 leading-tight mb-1">{currentModule.title}</h2>
                             <div className="h-0.5 bg-gradient-to-r from-brand-orange to-orange-500 rounded-full w-32"></div>
                          </div>
                       </div>
                       
                       <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentModule.content }}></div>
                       
                       {/* Zobrazenie uložených výsledkov testu */}
                       {(() => {
                         if (testResults) {
                           console.log('📊 Zobrazujem výsledky testu:', testResults);
                           return (
                             <div className="mt-8 p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                               <div className="flex items-center gap-2 mb-4">
                                 <Award size={18} className={testResults.success ? "text-emerald-600" : "text-rose-600"} />
                                 <h3 className="text-lg font-semibold text-slate-900">Výsledky testu</h3>
                               </div>
                               
                               <div className="space-y-3">
                                 <div className="flex justify-between py-2 border-b border-slate-100">
                                   <span className="text-slate-600">Celkom otázok:</span>
                                   <span className="font-medium text-slate-900">{testResults.total}</span>
                                 </div>
                                 
                                 <div className="flex justify-between py-2 border-b border-slate-100">
                                   <span className="text-slate-600">Správne odpovede:</span>
                                   <span className="font-medium text-emerald-600">{testResults.correct}</span>
                                 </div>
                                 
                                 <div className="flex justify-between py-2 border-b border-slate-100">
                                   <span className="text-slate-600">Nesprávne odpovede:</span>
                                   <span className="font-medium text-rose-600">{testResults.wrong}</span>
                                 </div>
                                 
                                 <div className="flex justify-between py-2 border-b border-slate-100">
                                   <span className="text-slate-600">Úspešnosť:</span>
                                   <span className={`font-semibold ${testResults.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                                     {testResults.score}%
                                   </span>
                                 </div>
                                 
                                 <div className="pt-3 border-t border-slate-200">
                                   <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                     testResults.success 
                                       ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                       : 'bg-rose-50 text-rose-700 border border-rose-200'
                                   }`}>
                                     {testResults.success ? (
                                       <CheckCircle2 size={14} />
                                     ) : (
                                       <X size={14} />
                                     )}
                                     {testResults.success ? 'Test úspešne absolvovaný' : 'Test neúspešne absolvovaný'}
                                   </div>
                                 </div>
                               </div>
                             </div>
                           );
                         }
                         return null;
                       })()}
                    </div>
                 </div>
              </div>
           </div>

           <div className="border-t border-slate-100 p-3 lg:p-4 bg-white/95 backdrop-blur-md">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                   <button 
                   onClick={prevModule} 
                   disabled={currentModuleIndex === 0}
                   className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-orange hover:border-brand-orange/20 hover:bg-brand-orange/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-sm disabled:shadow-none"
                 >
                    <ArrowLeft size={20} /> {currentModuleIndex === 0 ? 'Začiatok' : 'Predchádzajúci modul'}
                 </button>

                 {currentModuleIndex === modules.length - 1 ? (
                   <div className="flex items-center gap-3">
                     {/* Kontrola pre GDPR alebo Security školenie */}
                     {(selectedTraining.training?.title?.toLowerCase().includes('gdpr') || selectedTraining.training?.title?.toLowerCase().includes('security') || selectedTraining.training?.title?.toLowerCase().includes('bezpečnosť')) && !gdprTestCompleted && (
                      <div className="flex items-center gap-1.5 px-7 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-700 text-base font-semibold shadow-sm">
                      <Info size={18} />
                         Najprv vyhodnoťte test
                       </div>
                     )}
                     <button 
                       onClick={completeTraining}
                       disabled={loading || ((selectedTraining.training?.title?.toLowerCase().includes('gdpr') || selectedTraining.training?.title?.toLowerCase().includes('security') || selectedTraining.training?.title?.toLowerCase().includes('bezpečnosť')) && !gdprTestCompleted)}
                       className="px-8 py-3 rounded-xl bg-brand-orange text-white font-semibold text-base hover:bg-orange-600 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                     >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Trophy size={20} />}
                      Dokončiť školenie
                     </button>
                   </div>
                 ) : (
                   <button 
                     onClick={nextModule} 
                     className="px-8 py-3 rounded-xl bg-brand-orange text-white font-semibold text-base hover:bg-orange-600 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
                   >
                      Ďalší modul <ArrowRight size={20} />
                   </button>
                 )}
              </div>
           </div>
        </div>

        {/* POTVRDZOVACÍ DIALÓG PRE UKONČENIE */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-[6000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto">
                  <X size={32} className="text-brand-orange" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-slate-900">Chcete ukončiť školenie?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Váš progres sa uloží a po opätovnom spustení vás vráti do aktuálneho modulu.
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 hover:text-slate-700 transition-all font-medium text-sm"
                  >
                    Pokračovať v školení
                  </button>
                  <button
                    onClick={() => {
                      setShowExitConfirm(false);
                      setSelectedTraining(null);
                      fetchAssignedTrainings();
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-800 transition-all text-sm"
                  >
                    Uložiť a odísť
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- DETAIL VIEW PRE ZAMESTNANCA ---
  if (selectedTraining && selectedTraining.training) {
    const rawObjectives = selectedTraining.training.objectives || (selectedTraining.training as any).learning_objectives || [];
    const currentObjectives = Array.isArray(rawObjectives) 
      ? rawObjectives.filter(o => typeof o === 'string' && o.trim() !== '') 
      : [];

    const isCompleted = selectedTraining.status === 'completed';
    const isExpired = selectedTraining.is_expired;

    return (
      <>
        <div className="animate-fade-in space-y-8 pb-20 text-left text-slate-900 max-w-7xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight relative inline-block">
                {selectedTraining.training.title}
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-orange rounded-full"></div>
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-2xl font-medium">
                {selectedTraining.training.description}
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
                         {selectedTraining.training.full_description || selectedTraining.training.description}
                       </p>
                    </div>

                    {currentObjectives.length > 0 && (
                      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00427a]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-opacity opacity-50 group-hover:opacity-100"></div>
                        <div className="p-10 relative z-10">
                          <div className="text-left mb-10">
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Čo sa u nás naučíte</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Kľúčové ciele vzdelávania</p>
                        </div>

                          <div className="space-y-4">
                            {currentObjectives.map((obj, i) => (
                              <div key={i} className="flex gap-4 group/item items-center">
                                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all duration-300">
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
                    {selectedTraining.training.lessons?.length ? (
                      selectedTraining.training.lessons.map((l: any, i: number) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                          <div className="flex items-center gap-5">
                            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black bg-slate-50 text-slate-400 border border-slate-100">
                              {i+1}
                            </span>
                            <span className="font-bold text-slate-900 text-sm uppercase tracking-tight">{l.title}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-bold uppercase text-[10px] tracking-widest">Osnova sa pripravuje.</div>
                    )}
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="space-y-6 max-w-3xl">
                    {selectedTraining.training.faq?.length ? (
                      (selectedTraining.training.faq as any[]).map((f, i) => (
                        <div key={i} className="text-left space-y-3 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                          <h4 className="font-semibold text-slate-800 text-[15px] flex gap-3 leading-normal text-left">
                             <HelpCircle size={18} className="text-brand-orange shrink-0" /> {f.question}
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
                     <p className="font-semibold text-[#00427a] mb-4 uppercase text-xs tracking-wider flex items-center gap-2"><Info size={14}/> Dodatočné informácie </p>
                     <div className="font-medium italic border-l-2 border-[#00427a]/20 pl-6 text-left">
                        {selectedTraining.training.note || "Školenie je pravidelne aktualizované podľa platnej judikatúry k roku 2025."}
                     </div>
                   </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10 overflow-visible">
            {/* TLAČIDLO NA SPUSTENIE/KONTINUÁCIU */}
            <button 
              onClick={() => {
                if (isCompleted) {
                  // Načítaj certifikát a zobraz ho
                  const loadCertificate = async () => {
                    console.log('🔍 Hľadám certifikát pre training ID:', selectedTraining.id);
                    const { data: certs, error } = await supabase
                      .from('certificates')
                      .select('*')
                      .eq('employee_training_id', selectedTraining.id)
                      .order('issued_at', { ascending: false }); // Najnovší prvý
                    
                    if (error) {
                      console.error('❌ Chyba pri načítaní certifikátu:', error);
                      alert('Nepodarilo sa načítať certifikát. Kontaktujte administrátora.');
                      return;
                    }
                    
                    if (certs && certs.length > 0) {
                      const cert = certs[0]; // Vezmeme najnovší certifikát
                      console.log('✅ Certifikát nájdený:', cert.certificate_number, `(celkom: ${certs.length})`);
                      setCertData({
                        userName: `${state.user?.firstName} ${state.user?.lastName}`,
                        trainingTitle: selectedTraining.training?.title,
                        certNumber: cert.certificate_number,
                        date: new Date(cert.issued_at).toLocaleDateString('sk-SK'),
                        validUntil: cert.valid_until
                      });
                      setShowCert(true);
                    } else {
                      console.warn('⚠️ Certifikát nebol nájdený pre training ID:', selectedTraining.id);
                      alert('Certifikát nebol nájdený. Skúste školenie dokončiť znova.');
                    }
                  };
                  loadCertificate();
                } else {
                  launchTrainingPlayer(selectedTraining);
                }
              }}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-semibold uppercase text-sm tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl ${
                isExpired ? 'bg-slate-700 text-white hover:bg-slate-800' :
                isCompleted ? 'bg-slate-700 text-white hover:bg-slate-800' :
                'bg-slate-700 text-white hover:bg-slate-800'
              }`}
            >
              {isExpired ? (
                <><RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> Obnoviť školenie</>
              ) : isCompleted ? (
                <><Eye size={20} /> Zobraziť certifikát</>
              ) : selectedTraining.progress_percentage === 0 ? (
                <><Play size={20} /> Začať školenie</>
              ) : (
                <><Play size={20} /> Pokračovať v školení</>
              )}
            </button>

            <button 
              onClick={() => setSelectedTraining(null)} 
              className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all flex items-center justify-center gap-3 group shadow-sm"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Späť na kurzy
            </button>

            {/* BOX DETAILE ŠKOLENIA */}
            <div className="text-left bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col relative">
               <div className="p-8 pb-4">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-2 text-left">
                    <Target size={18} className="text-brand-orange" /> Detaily školenia
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="pt-6 border-t border-slate-50 space-y-4 text-left">
                       <div className="flex items-center gap-4 text-slate-600 text-left">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center"><Layers size={18} /></div>
                          <span className="text-sm font-medium text-slate-600 leading-normal text-left">Počet lekcií: {selectedTraining.training.lessons?.length || 0}</span>
                       </div>
                       <div className="flex items-center gap-4 text-slate-600 text-left">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center"><Clock size={18} /></div>
                          <span className="text-sm font-medium text-slate-600 leading-normal text-left">Dĺžka trvania: {formatDuration(selectedTraining.training.duration || 0)}</span>
                       </div>
                       <div className="flex items-center gap-4 text-slate-600 text-left">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center"><BadgeCheck size={18} /></div>
                          <span className="text-sm font-medium text-slate-600 leading-normal text-left">Školenie obsahuje certifikát</span>
                       </div>
                       <div className="flex items-center gap-4 text-slate-600 text-left">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center"><HelpCircle size={18} /></div>
                          <span className="text-sm font-medium text-slate-600 leading-normal text-left">Školenie obsahuje testy</span>
                       </div>
                       <div className="flex items-center gap-4 text-slate-600 text-left">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center"><CalendarCheck size={18} /></div>
                          <span className="text-sm font-medium text-slate-600 leading-normal text-left">Platná licencia na 12 mesiacov</span>
                       </div>
                       <div className="flex items-center gap-4 text-slate-600 text-left">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center"><Clock size={18} /></div>
                          <span className="text-sm font-medium text-slate-600 leading-normal text-left">opakovanie: 6 mesiacov</span>
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
                          src="/podpis.png" 
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
      
      <CertificateModal isOpen={showCert} onClose={() => setShowCert(false)} data={certData} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-10 animate-fade-in text-left text-slate-900">
       <div className="space-y-2">
         <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center">
             <BookOpen size={24} className="text-white" />
           </div>
           <div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Moje kurzy</h1>
             <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
           </div>
         </div>
         <p className="text-slate-500 font-medium text-sm ml-18">Správa vzdelávania a história osvedčení.</p>
       </div>

       {expiringSoonList.length > 0 && (
          <div className="space-y-4">
             {expiringSoonList.map(expiring => (
                <div key={expiring.id} className="bg-gradient-to-r from-brand-orange to-amber-500 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-8 animate-pulse relative overflow-hidden">
                   <div className="flex items-center gap-6 relative z-10 text-left">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0"><AlertTriangle size={32} /></div>
                      <div className="text-left">
                         <h4 className="text-xl font-black uppercase tracking-tight leading-none mb-1 text-left">Blížiaca sa expirácia certifikátu</h4>
                         <p className="text-white/80 text-sm font-medium text-left leading-relaxed">
                           Platnosť pre <span className="font-black underline">{expiring.training?.title}</span> vyprší čoskoro. <br/>
                           Odporúčame obnoviť školenie pre udržanie súladu s GDPR.
                         </p>
                      </div>
                   </div>
                   <button onClick={() => startTraining(expiring)} className="px-6 py-3 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg relative z-10 shrink-0">Obnoviť teraz</button>
                </div>
             ))}
          </div>
       )}

       {assignedTrainings.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 border border-slate-100 shadow-sm text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-5xl grayscale opacity-30 shadow-inner mb-6">📚</div>
             <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest text-center">Nemáte žiadne priradené kurzy</h3>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
             {assignedTrainings.map(at => {
                const isCompleted = at.status === 'completed';
                const isExpired = at.is_expired;
                const certCount = at.certs?.length || 0;
                
                return (
                  <div key={at.id} className={`bg-white rounded-[2.5rem] border overflow-hidden hover:shadow-2xl hover:border-brand-blue/30 transition-all group flex flex-col h-full relative shadow-sm text-left ${isExpired ? 'border-rose-100 ring-4 ring-rose-50/50' : isCompleted ? 'border-emerald-100' : 'border-slate-100'}`}>
                    <div className="h-44 relative overflow-hidden bg-slate-900 shrink-0">
                       <img src={at.training?.thumbnail || "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80"} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-[1.5s]" alt={at.training?.title} />
                    </div>

                    <div className="p-8 flex-1 flex flex-col space-y-6 text-left">
                       <div className="text-left">
                          <h3 className={`font-bold text-lg leading-tight text-left ${isExpired ? 'text-rose-600' : 'text-slate-900'}`}>{at.training?.title}</h3>
                          <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-3 leading-relaxed text-left">
                            {isExpired ? `Platnosť kurzu vypršala dňa ${new Date(at.valid_until).toLocaleDateString('sk-SK')}` : `${at.training?.duration || 0} min • ${at.training?.category}`}
                          </p>
                       </div>

                       {!isExpired && (
                         <div className="space-y-2">
                           <div className="flex justify-between text-[12px] font-bold text-slate-600 uppercase tracking-wide">
                             <span className="font-semibold">Pokrok v štúdiu</span>
                             <span className="font-black text-brand-orange">{at.progress_percentage}%</span>
                           </div>
                           <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-1000 ${
                               isCompleted ? 'bg-slate-700' : 'bg-slate-700'
                             }`} style={{ width: `${at.progress_percentage}%` }}></div>
                           </div>
                         </div>
                       )}

                       <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-left">
                          <div className="text-left">
                             {at.valid_until && !isExpired && (
                               <div className="text-left">
                                 <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Platné do:</p>
                                 <p className="text-sm font-bold text-slate-700">{new Date(at.valid_until).toLocaleDateString('sk-SK')}</p>
                               </div>
                             )}
                             {isExpired && (
                               <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1 text-left">
                                 <AlertOctagon size={10} /> Vypršaná platnosť
                               </span>
                             )}
                          </div>
                          
                          <button 
                            onClick={() => {
                              // Vyčistíme localStorage pred spustením kurzu
                              console.log('🧹 Čistím localStorage pred spustením kurzu:', at.training?.title);
                              localStorage.removeItem('testResults');
                              localStorage.removeItem('securityTestUnlocked');
                              localStorage.removeItem('gdprTestUnlocked');
                              console.log('✅ localStorage vyčistený');
                              
                              // Krátke oneskorenie aby sa zmena localStorage propagovala
                              setTimeout(() => {
                                setSelectedTraining(at);
                              }, 10);
                            }}
                            className={`px-6 py-2.5 rounded-lg font-bold uppercase text-[12px] tracking-wide transition-all active:scale-95 flex items-center gap-2 shadow-lg ${
                              isExpired ? 'bg-slate-700 text-white hover:bg-slate-800' :
                              isCompleted ? 'bg-slate-700 text-white hover:bg-slate-800' :
                              'bg-slate-700 text-white hover:bg-slate-800'
                            }`}
                          >
                            {isExpired ? (
                              <><RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Obnoviť</>
                            ) : isCompleted ? (
                              <>Certifikát <Award size={14} /></>
                            ) : (
                              <>ZAČAŤ <Play size={14} /></>
                            )}
                          </button>
                       </div>

                       {/* ROZBALENÁ HISTÓRIA */}
                       {viewingHistory === at && (
                         <div className="pt-4 space-y-2 animate-in slide-in-from-top-2 duration-300 text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 pb-2">Kompletná história osvedčení:</p>
                            {at.certs?.map((cert, idx) => {
                               const certExpired = new Date(cert.valid_until) < new Date();
                               return (
                                 <div key={cert.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all group/item ${certExpired ? 'bg-slate-50 border-slate-100 grayscale-[0.5]' : 'bg-emerald-50/30 border-emerald-100'}`}>
                                    <div className="flex items-center gap-3 text-left">
                                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${certExpired ? 'bg-slate-200 text-slate-400' : 'bg-emerald-500 text-white shadow-sm'}`}>
                                          {certExpired ? <Archive size={14}/> : <Award size={14}/>}
                                       </div>
                                       <div className="text-left">
                                          <p className={`text-[10px] font-black leading-none ${certExpired ? 'text-slate-500' : 'text-emerald-700'}`}>
                                            {certExpired ? 'EXPIROVANÉ' : 'AKTUÁLNE PLATNÉ'}
                                          </p>
                                          <p className="text-[9px] font-bold text-slate-400 mt-1">{new Date(cert.issued_at).toLocaleDateString('sk-SK')}</p>
                                       </div>
                                    </div>
                                    <button 
                                      onClick={() => openSpecificCert(at, cert)}
                                      className="p-2 bg-white rounded-lg text-slate-400 hover:text-brand-blue border border-slate-100 shadow-sm transition-all"
                                    >
                                      <Download size={14}/>
                                    </button>
                                 </div>
                               );
                            })}
                         </div>
                       )}
                    </div>
                  </div>
                );
             })}
          </div>
       )}
    </div>
    
    <CertificateModal isOpen={showCert} onClose={() => setShowCert(false)} data={certData} />
    </>
  );
};

export default EmployeeTrainingView;
