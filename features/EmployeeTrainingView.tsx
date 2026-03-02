
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
  Archive
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

           <img src="./public/certifikat.png" className="absolute inset-0 w-full h-full object-cover" alt="Background" />
           
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
                      <img src="./public/peciatka.png" className="w-full h-full object-contain transform -rotate-2 group-hover:rotate-0 transition-transform duration-700 drop-shadow-xl" alt="Stamp" />
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

  const [expiringSoonList, setExpiringSoonList] = useState<EmployeeTraining[]>([]);
  const [showCert, setShowCert] = useState(false);
  const [certData, setCertData] = useState<any>(null);
  
  const [viewingHistory, setViewingHistory] = useState<EmployeeTraining | null>(null);

  const fetchAssignedTrainings = useCallback(async () => {
    if (!state.user?.id) return;
    setFetchLoading(true);
    try {
      // Stiahneme priradenia a VŠETKY certifikáty k nim (bez limitu)
      const { data, error } = await supabase
        .from('employee_trainings')
        .select(`*, training:trainings(*), certs:certificates(*)`)
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

  useEffect(() => { fetchAssignedTrainings(); }, [fetchAssignedTrainings]);

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
    // Ak je kurz expirovaný, vynulujeme progres a ideme re-certifikovať
    if (employeeTraining.is_expired || employeeTraining.status !== 'completed') {
      setLoading(true);
      try {
        const { data: modulesData, error } = await supabase
          .from('training_modules')
          .select('*')
          .eq('training_id', employeeTraining.training_id)
          .order('order_index', { ascending: true });

        if (error) throw error;
        if (!modulesData?.length) return alert("Obsah školenia sa pripravuje.");

        setModules(modulesData);
        setSelectedTraining(employeeTraining);
        setCurrentModuleIndex(0);
        setShowResults(false);

        await supabase.from('employee_trainings').update({ 
          status: 'in_progress', 
          progress_percentage: 0 
        }).eq('id', employeeTraining.id);

      } catch (error) { console.error(error); } finally { setLoading(false); }
    } else {
      // Ak je platný, otvoríme posledný certifikát
      if (employeeTraining.certs && employeeTraining.certs.length > 0) {
        openSpecificCert(employeeTraining, employeeTraining.certs[0]);
      }
    }
  };

  const nextModule = async () => {
    if (currentModuleIndex < modules.length - 1) {
      const nextIdx = currentModuleIndex + 1;
      const progress = Math.round((nextIdx / modules.length) * 100);
      setCurrentModuleIndex(nextIdx);
      if (selectedTraining) {
        await supabase.from('employee_trainings').update({ progress_percentage: progress }).eq('id', selectedTraining.id);
      }
    } else {
      await completeTraining();
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
      setShowResults(true);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  if (fetchLoading) return <div className="py-40 text-center"><RefreshCw className="animate-spin inline text-brand-blue" size={32}/><p className="mt-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Autorizácia...</p></div>;

  // --- PLAYER UI ---
  if (selectedTraining && modules.length > 0) {
    const currentModule = modules[currentModuleIndex];
    const progress = Math.round(((currentModuleIndex + 1) / modules.length) * 100);

    return (
      <div className="fixed inset-0 z-[5000] bg-white flex flex-col font-sans overflow-hidden text-left text-slate-900 animate-fade-in">
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md shrink-0">
           <div className="flex items-center gap-6">
              <button onClick={() => { setSelectedTraining(null); fetchAssignedTrainings(); }} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all"><X size={20} /></button>
              <div>
                 <h2 className="text-xl font-black text-slate-900 leading-none">{selectedTraining.training?.title}</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                   <Clock size={12} className="text-brand-orange" /> Modul {currentModuleIndex + 1} z {modules.length}
                 </p>
              </div>
           </div>
           <div className="flex-1 max-w-md mx-10 hidden lg:block">
              <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">
                 <span>Pokrok v štúdiu</span><span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-emerald-500' : 'bg-brand-blue'}`} style={{ width: `${progress}%` }}></div>
              </div>
           </div>
           <button onClick={() => { setSelectedTraining(null); fetchAssignedTrainings(); }} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue shadow-lg transition-all">Uložiť a odísť</button>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50 py-12 px-6 no-scrollbar">
           <div className="w-full max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 duration-700 mb-12">
              <div className="p-10 md:p-16 space-y-10">
                 <div className="space-y-4 text-left">
                    <span className="bg-brand-blue/5 text-brand-blue px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-blue/10">MODUL {currentModuleIndex + 1}</span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">{currentModule.title}</h1>
                 </div>
                 <div className="prose prose-slate max-w-none text-left">
                    <div className="text-lg text-slate-600 leading-relaxed font-medium whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: currentModule.content }}></div>
                 </div>
              </div>
           </div>
           <div className="w-full max-w-4xl mx-auto flex justify-between items-center px-4 pb-12">
              <button onClick={() => currentModuleIndex > 0 && setCurrentModuleIndex(currentModuleIndex - 1)} disabled={currentModuleIndex === 0} className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 disabled:opacity-0 transition-all"><ArrowLeft size={16} /> Predchádzajúci</button>
              <button onClick={nextModule} className="flex items-center gap-3 px-10 py-5 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-800 shadow-2xl transition-all active:scale-95 group">
                {currentModuleIndex === modules.length - 1 ? 'Dokončiť školenie' : 'Ďalší modul'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </main>

        {showResults && (
           <div className="fixed inset-0 z-[6000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
              <div className="bg-white rounded-[3.5rem] max-w-lg w-full p-12 text-center space-y-8 shadow-2xl border border-white/20 overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange to-brand-gold"></div>
                 <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl">🏆</div>
                 <h2 className="text-3xl font-black text-slate-900">Certifikácia úspešná!</h2>
                 <p className="text-slate-500 font-medium italic text-center">Vaše osvedčenie je vygenerované a platné na nasledujúcich 6 mesiacov.</p>
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-left">
                    <div className="flex items-center gap-3 mb-2"><CheckCircle2 size={18} className="text-emerald-500" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digitálny certifikát k dispozícii</span></div>
                    <p className="text-sm font-black text-slate-900">{selectedTraining.training?.title}</p>
                 </div>
                 <button onClick={() => { setSelectedTraining(null); fetchAssignedTrainings(); }} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-brand-blue transition-all">Späť do portálu</button>
              </div>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in text-left text-slate-900">
       <CertificateModal isOpen={showCert} onClose={() => setShowCert(false)} data={certData} />
       
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-brand-orange font-black text-[10px] uppercase tracking-[0.3em]"><BookOpen size={14} /> My Learning Hub</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none text-left">Moje kurzy</h1>
            <p className="text-slate-500 font-medium text-left">Správa vzdelávania a história osvedčení.</p>
          </div>
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
                   <button onClick={() => startTraining(expiring)} className="px-10 py-5 bg-white text-brand-orange rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl relative z-10 shrink-0">Obnoviť teraz</button>
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
                  <div key={at.id} className={`bg-white rounded-[2.5rem] border overflow-hidden hover:shadow-2xl transition-all group flex flex-col relative ${isExpired ? 'border-rose-200 ring-4 ring-rose-50' : isCompleted ? 'border-emerald-100' : 'border-slate-100'}`}>
                    <div className="h-44 bg-slate-900 relative flex items-center justify-center overflow-hidden shrink-0">
                       <div className={`absolute inset-0 opacity-80 group-hover:scale-110 transition-transform duration-700 bg-gradient-to-br ${
                         isExpired ? 'from-rose-600 to-rose-900' : 
                         isCompleted ? 'from-emerald-600 to-emerald-900' : 
                         'from-brand-blue to-blue-900'
                       }`}></div>
                       <div className="text-6xl z-10 transform group-hover:scale-110 transition-transform drop-shadow-2xl">
                         {at.training?.category === 'GDPR' ? '🛡️' : '🎓'}
                       </div>
                    </div>

                    <div className="p-8 flex-1 space-y-6 flex flex-col text-left">
                       <div className="space-y-3 text-left">
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-2 leading-tight text-left">{at.training?.title}</h3>
                          {isExpired ? (
                             <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-rose-100">
                                <AlertOctagon size={12}/> Platnosť vypršala
                             </span>
                          ) : (
                             <p className="text-slate-400 text-xs font-medium line-clamp-2 leading-relaxed text-left">{at.training?.description}</p>
                          )}
                       </div>

                       <div className="space-y-3 text-left">
                          <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest text-left">
                             <span>Aktuálny stav</span>
                             <span className={isExpired ? 'text-rose-500' : isCompleted ? 'text-emerald-500' : 'text-brand-blue'}>
                                {isExpired ? 'VYŽADUJE OBNOVU' : `${at.progress_percentage}%`}
                             </span>
                          </div>
                          <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                             <div className={`h-full transition-all duration-1000 ${
                               isExpired ? 'bg-rose-500' : 
                               isCompleted ? 'bg-emerald-500' : 
                               'bg-brand-blue'
                             }`} style={{ width: `${isExpired ? 100 : at.progress_percentage}%` }}></div>
                          </div>
                       </div>

                       {/* TLAČIDLÁ A HISTÓRIA */}
                       <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between gap-4 text-left">
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => setViewingHistory(viewingHistory === at ? null : at)}
                               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${certCount > 1 ? 'bg-brand-blue/5 text-brand-blue border border-brand-blue/10 hover:bg-brand-blue hover:text-white' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}
                               title="Zobraziť históriu certifikátov"
                             >
                               <History size={18} />
                             </button>
                             <div className="text-left">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vydaných</p>
                                <p className="text-xs font-bold text-slate-700">{certCount} pokusy</p>
                             </div>
                          </div>
                          
                          <button 
                            onClick={() => startTraining(at)}
                            disabled={loading}
                            className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg ${
                              isExpired ? 'bg-rose-600 text-white hover:bg-rose-700' :
                              isCompleted ? 'bg-white text-emerald-600 border border-emerald-100 hover:border-emerald-200' :
                              'bg-slate-900 text-white hover:bg-brand-blue shadow-slate-200'
                            }`}
                          >
                            {isExpired ? <><RefreshCw size={14}/> Obnoviť</> : isCompleted ? <><Eye size={14} /> Posledný</> : 'Spustiť'}
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
  );
};

export default EmployeeTrainingView;
