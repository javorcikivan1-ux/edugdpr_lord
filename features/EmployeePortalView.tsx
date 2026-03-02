
import React, { useEffect, useState } from 'react';
import { supabase, getMyDocuments, signDocument, markAsViewed } from '../lib/supabase';
import { 
  User, 
  FileText, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Award, 
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Calendar,
  PenTool,
  ExternalLink,
  X,
  Trophy,
  Download,
  Printer,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

// --- UNIVERZÁLNY KOMPONENT CERTIFIKÁTU S OCHRANOU PROTI EXPIRÁCII ---
export const CertificateModal = ({ isOpen, onClose, data }: any) => {
  if (!isOpen || !data) return null;

  // Kontrola, či je tento konkrétny certifikát už po lehote platnosti
  const isExpired = data.validUntil && new Date(data.validUntil) < new Date();

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 text-left">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 z-[10]">
        {/* Ovládacie prvky */}
        <div className="absolute top-6 right-6 flex gap-2 z-[100] no-print">
          <button onClick={() => window.print()} className="p-4 bg-white/90 text-slate-900 rounded-2xl hover:bg-brand-blue hover:text-white transition-all shadow-xl backdrop-blur-md border border-slate-200">
            <Printer size={22} />
          </button>
          <button onClick={onClose} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-xl">
            <X size={22} />
          </button>
        </div>

        {/* Samotný dizajn certifikátu */}
        <div className="relative aspect-[1.414/1] w-full bg-slate-100 overflow-hidden print:m-0 shadow-inner text-left text-slate-900">
           
           {/* VEĽKÝ VODOZNAK AK JE EXPIROVANÝ */}
           {isExpired && (
             <div className="absolute inset-0 flex items-center justify-center z-[50] pointer-events-none">
                <div className="rotate-[35deg] border-[12px] border-rose-600/30 px-16 py-8 rounded-[4rem] bg-white/10 backdrop-blur-[2px]">
                   <span className="text-8xl font-black text-rose-600/20 uppercase tracking-[0.2em] whitespace-nowrap">ARCHÍV / EXPIROVANÉ</span>
                </div>
             </div>
           )}

           <img src="./logo/certifikat.png" className="absolute inset-0 w-full h-full object-cover" alt="Background" />
           
           <div className="absolute inset-0 flex flex-col items-center justify-start text-center p-12 md:p-20 pt-24 md:pt-32 z-10">
              <div className="space-y-1">
                 <h2 className="text-4xl md:text-5xl font-black text-[#437680] tracking-tighter uppercase drop-shadow-sm text-center text-[#437680]">CERTIFIKÁT</h2>
                 <p className="text-[10px] md:text-xs font-black text-brand-orange uppercase tracking-[0.5em] text-center">Osvedčenie o absolvovaní odborného školenia</p>
              </div>

              <div className="mt-8 md:mt-10 space-y-1 text-center">
                <p className="text-slate-400 font-serif italic text-base md:text-lg text-center">týmto potvrdzujeme, že</p>
                <h3 className="relative top-2 md:top-3 text-3xl md:text-5xl font-black text-[#437680] tracking-tight leading-tight px-10 border-b-2 border-[#437680]/10 pb-2 inline-block text-center text-[#437680]">
                  {data.userName}
                </h3>
              </div>

               <div className="mt-2 md:mt-4 max-w-3xl space-y-1 text-center">
                <p className="text-slate-500 font-medium text-[10px] md:text-xs leading-relaxed uppercase tracking-widest opacity-80 text-center">
                  úspešne absolvoval vzdelávací program:
                </p>
                <div className="px-10 translate-y-2 md:translate-y-3 text-center">
                  <h4 className="text-xl md:text-2xl font-black text-[#437680] tracking-tight leading-tight text-center text-[#437680]">
                    {data.trainingTitle}
                  </h4>
                </div>
              </div>

              <div className="absolute bottom-12 left-16 right-40 flex items-end justify-between text-left">
                <div className="text-left space-y-4">
                   <div className="space-y-1.5 text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-left">Identifikátor certifikátu</p>
                      <p className="font-mono font-bold text-slate-700 text-xs md:text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-left w-fit">{data.certNumber}</p>
                   </div>
                   <div className="space-y-1.5 text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-left">Dátum vystavenia</p>
                      <p className="font-mono font-bold text-slate-700 text-xs md:text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-left w-fit">{data.date}</p>
                   </div>
                   {isExpired && (
                     <div className="flex items-center gap-2 text-rose-600 font-black text-[9px] uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 no-print">
                        <AlertOctagon size={12}/> Platnosť vypršala: {new Date(data.validUntil).toLocaleDateString('sk-SK')}
                     </div>
                   )}
                </div>

                <div className="relative group flex flex-col items-center">
                   <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
                      <img src="./logo/peciatka.png" className="w-full h-full object-contain transform -rotate-2 group-hover:rotate-0 transition-transform duration-1000 drop-shadow-2xl" alt="Stamp" />
                   </div>
                </div>
              </div>

              <p className="absolute bottom-8 left-0 right-0 text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Vydané spoločnosťou LORD´S BENISON s.r.o.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export const EmployeePortalView = ({ onViewChange }: { onViewChange?: (v: string) => void }) => {
  const [user, setUser] = useState<any>(null);
  const [resolvedCompanyName, setResolvedCompanyName] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [certData, setCertData] = useState<any>(null);
  const [showCert, setShowCert] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const currentUser = session.user;
      setUser(currentUser);
      
      // 1. Získanie tokenu a názvu firmy
      const { data: empProfile } = await supabase
        .from('employees')
        .select('company_token, company_name')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (empProfile) {
        setResolvedCompanyName(empProfile.company_name);
      }

      // 2. Načítanie dokumentov na podpis
      const { data: docs } = await getMyDocuments();
      if (docs) {
        setDocuments(docs.map((d: any) => ({
          id: d.id,
          title: d.document?.title || 'Dokument bez názvu',
          url: d.document?.file_url || '#',
          status: d.status,
          date: new Date(d.signed_at || d.document?.created_at || Date.now()).toLocaleDateString('sk-SK')
        })));
      }

      // 3. Načítanie kurzov s pripojenými certifikátmi (pre valid_until)
      const { data: realCourses } = await supabase
        .from('employee_trainings')
        .select('*, training:trainings(*), certs:certificates(*)')
        .eq('employee_id', currentUser.id);
      
      if (realCourses) {
        const now = new Date();
        setCourses(realCourses.map(rc => {
          // Získame najnovší certifikát pre určenie platnosti
          const latestCert = (rc.certs || []).sort((a: any, b: any) => 
            new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
          )[0];

          const validUntil = latestCert?.valid_until;
          const isExpired = validUntil ? new Date(validUntil) < now : false;

          return {
            id: rc.id,
            training_id: rc.training_id,
            title: rc.training?.title || 'Neznáme školenie',
            progress: rc.progress_percentage || 0,
            status: rc.status === 'completed' ? 'FINISHED' : 'IN_PROGRESS',
            category: rc.training?.category || 'Všeobecné',
            duration: `${rc.training?.duration || 0} min`,
            completedAt: rc.completed_at,
            isExpired,
            validUntil,
            latestCert
          };
        }));
      }
    } catch (err) {
      console.error("Portal fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCert = (course: any) => {
    if (!course.latestCert) return;
    
    setCertData({
      userName: `${user?.user_metadata?.firstName || ''} ${user?.user_metadata?.lastName || user?.email}`,
      trainingTitle: course.title,
      certNumber: course.latestCert.certificate_number,
      date: new Date(course.latestCert.issued_at).toLocaleDateString('sk-SK'),
      validUntil: course.latestCert.valid_until
    });
    setShowCert(true);
  };

  const handleView = async (id: string, url: string) => {
    try {
      await markAsViewed(id);
      window.open(url, '_blank');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleSign = async (id: string) => {
    if (!confirm('Naozaj chcete tento dokument podpísať?')) return;
    try {
      const { error } = await signDocument(id);
      if (error) throw error;
      fetchData();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-blue rounded-full animate-spin"></div>
      <p className="text-slate-400 font-medium uppercase text-xs tracking-wider animate-pulse">Pripravujem váš portál...</p>
    </div>
  );

  const meta = user?.user_metadata || {};

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-left text-slate-900">
      <CertificateModal 
        isOpen={showCert} 
        onClose={() => setShowCert(false)} 
        data={certData} 
      />

      {/* HEADER PROFILU */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative">
          <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-brand-blue to-blue-400 flex items-center justify-center text-white shadow-2xl p-1">
             <div className="w-full h-full bg-brand-blue rounded-[2.2rem] flex items-center justify-center text-4xl font-black border border-white/20 uppercase">
               {meta.firstName?.[0] || meta.full_name?.[0] || user?.email?.[0] || 'U'}
             </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full"></div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-3 relative z-10 text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
             <span className="bg-brand-orange/10 text-brand-orange px-4 py-1 rounded-full text-xs font-medium uppercase tracking-wider">Authority Member</span>
             <span className="text-slate-300 font-medium text-xs uppercase tracking-wider flex items-center gap-1"><Clock size={12}/> {new Date().toLocaleDateString('sk-SK')}</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight text-left leading-none">
            {meta.firstName} {meta.lastName}
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 text-left">
            <div className="bg-slate-50 px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 flex items-center gap-2 border border-slate-100">
              <ShieldCheck size={14} className="text-brand-blue" /> {meta.position || 'Špecialista'}
            </div>
            <div className="bg-blue-50 px-5 py-2.5 rounded-2xl text-xs font-bold text-brand-blue flex items-center gap-2 border border-blue-100">
              <Zap size={14} className="text-brand-orange" /> {resolvedCompanyName || 'Priradená spoločnosť'}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex gap-4">
           <div className="text-center px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white transition-all">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 group-hover:text-brand-blue transition-colors">Vzdelávanie</p>
              <p className="text-xl font-black text-slate-900">{courses.length}</p>
           </div>
           <div className="text-center px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white transition-all">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 group-hover:text-rose-500 transition-colors">Na podpis</p>
              <p className="text-xl font-black text-slate-900">{documents.filter(d => d.status === 'PENDING').length}</p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 text-left">
        <div className="lg:col-span-7 space-y-8 text-left">
           <div className="flex items-center justify-between px-2 text-left">
             <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 text-left uppercase tracking-tight">
               <GraduationCap size={24} className="text-brand-orange" /> Moje vzdelávanie
             </h3>
           </div>

           <div className="grid gap-6 text-left">
              {courses.length === 0 ? (
                <div className="bg-white p-16 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                   <div className="text-4xl grayscale opacity-20 mb-4 mx-auto">📚</div>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Zatiaľ žiadne priradené školenia</p>
                </div>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className={`bg-white p-8 rounded-[2.5rem] border overflow-hidden hover:shadow-2xl transition-all group text-left relative ${course.isExpired ? 'border-rose-100 ring-4 ring-rose-50/50' : 'border-slate-100'}`}>
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center text-left">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform ${course.isExpired ? 'bg-rose-50' : 'bg-blue-50'}`}>
                          {course.isExpired ? '⚠️' : course.progress === 100 ? '🏆' : '📚'}
                        </div>
                        <div className="flex-1 min-w-0 space-y-4 w-full text-left">
                          <div className="flex flex-wrap items-center justify-between gap-4 text-left">
                              <div className="text-left">
                                <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest bg-brand-orange/5 px-2.5 py-1 rounded-lg border border-brand-orange/10 mb-1 inline-block">
                                  {course.category}
                                </span>
                                <h4 className={`text-lg font-black leading-tight text-left ${course.isExpired ? 'text-rose-600' : 'text-slate-900'}`}>{course.title}</h4>
                              </div>
                              <div className="text-right">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                                  course.isExpired ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 
                                  course.status === 'FINISHED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                  'bg-blue-50 text-brand-blue border border-blue-100'
                                }`}>
                                  {course.isExpired ? 'PLATNOSŤ VYPRŠALA' : course.status === 'FINISHED' ? 'DOKONČENÉ' : 'V PROCESE'}
                                </span>
                              </div>
                          </div>
                          
                          <div className="space-y-2 text-left">
                              <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                <span>Pokrok v štúdiu</span>
                                <span>{course.isExpired ? '100' : course.progress}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${
                                  course.isExpired ? 'bg-rose-500' :
                                  course.status === 'FINISHED' ? 'bg-emerald-500' : 
                                  'bg-brand-blue'
                                }`} style={{ width: `${course.isExpired ? 100 : course.progress}%` }}></div>
                              </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 text-left">
                              <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                                {course.validUntil ? (
                                  <span className={`flex items-center gap-1.5 text-left font-black ${course.isExpired ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    <Calendar size={12} /> Platné do: {new Date(course.validUntil).toLocaleDateString('sk-SK')}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-left"><Clock size={12} /> {course.duration}</span>
                                )}
                              </div>
                              
                              <button 
                                onClick={() => {
                                  if (course.isExpired) {
                                    if (onViewChange) onViewChange('employee');
                                  } else if (course.status === 'FINISHED') {
                                    openCert(course);
                                  } else {
                                    if (onViewChange) onViewChange('employee');
                                  }
                                }}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all group/btn active:scale-95 shadow-lg ${
                                  course.isExpired ? 'bg-rose-600 text-white hover:bg-rose-700' :
                                  course.status === 'FINISHED' ? 'bg-slate-900 text-white hover:bg-brand-blue' :
                                  'bg-brand-blue text-white hover:bg-blue-800'
                                }`}
                              >
                                {course.isExpired ? (
                                  <><RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Obnoviť teraz</>
                                ) : course.status === 'FINISHED' ? (
                                  <>Zobraziť Certifikát <Award size={14} /></>
                                ) : (
                                  <>Pokračovať <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" /></>
                                )}
                              </button>
                          </div>
                        </div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>

        <div className="lg:col-span-5 space-y-8 text-left">
           <div className="flex items-center justify-between px-2 text-left">
             <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 text-left uppercase tracking-tight">
               <FileText size={24} className="text-brand-orange" /> Legislatívna agenda
             </h3>
           </div>

           <div className="space-y-4 text-left">
              {documents.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center">
                   <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">Žiadne dokumenty na podpis</p>
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-5 text-left">
                    <div className="flex items-start gap-4 text-left">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${doc.status === 'SIGNED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'}`}>
                          {doc.status === 'SIGNED' ? '✓' : '✍️'}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <h4 className="font-bold text-slate-900 text-sm leading-snug truncate text-left">{doc.title}</h4>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 text-left">Priradené: {doc.date}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                          onClick={() => handleView(doc.id, doc.url)}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 border border-slate-100 transition-all"
                        >
                          <ExternalLink size={12} /> Náhľad
                        </button>
                        {doc.status === 'PENDING' && (
                          <button 
                            onClick={() => handleSign(doc.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-brand-blue text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 shadow-lg shadow-blue-500/10 transition-all active:scale-95"
                          >
                            <PenTool size={12} /> Podpísať
                          </button>
                        )}
                        {doc.status === 'SIGNED' && (
                          <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                             Podpísané
                          </div>
                        )}
                    </div>
                  </div>
                ))
              )}
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 blur-3xl"></div>
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-left uppercase tracking-tighter">
                <ShieldCheck size={20} className="text-brand-orange" /> Právna ochrana
              </h4>
              <p className="text-white/40 text-xs leading-relaxed font-medium mb-6 text-left">
                Všetky osvedčenia a digitálne podpisy sú v reálnom čase monitorované a spĺňajú technické štandardy Úradu pre ochranu osobných údajov.
              </p>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Stiahnuť súhrnný audit log</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortalView;
