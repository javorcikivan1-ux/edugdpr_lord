
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

           <img src="/certifikat.png" className="absolute inset-0 w-full h-full object-cover" alt="Background" />
           
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
                      <img src="/peciatka.png" className="w-full h-full object-contain transform -rotate-2 group-hover:rotate-0 transition-transform duration-1000 drop-shadow-2xl" alt="Stamp" />
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
  const [empProfile, setEmpProfile] = useState<any>(null);
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
        .select('company_token, company_name, full_name')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (empProfile) {
        setResolvedCompanyName(empProfile.company_name);
        setEmpProfile(empProfile);
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
      const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
      window.open(viewerUrl, '_blank');
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
  const companyName = empProfile?.company_name || 
                      meta?.companyName || 
                      resolvedCompanyName || 
                      'Priradená spoločnosť';

  // Výpočty pre štatistiky
  const pendingDocs = documents.filter(d => d.status === 'PENDING').length;
  const signedDocs = documents.filter(d => d.status === 'SIGNED').length;
  const validCerts = courses.filter(c => c.status === 'FINISHED' && !c.isExpired).length;
  
  // Nájdi najbližšiu expiráciu
  const expiringCourses = courses
    .filter(c => c.validUntil && !c.isExpired)
    .map(c => ({
      ...c,
      daysUntilExpiry: Math.ceil((new Date(c.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  
  const nextExpiring = expiringCourses[0];

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-left text-slate-900">
      <CertificateModal 
        isOpen={showCert} 
        onClose={() => setShowCert(false)} 
        data={certData} 
      />

      {/* ZJEDNODUŠENÁ NÁSTENKA */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
        <div className="space-y-6">
          {/* Vitaj */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Vitaj, {empProfile?.full_name || `${meta.firstName} ${meta.lastName}` || 'zamestnanec'}
            </h1>
            <p className="text-slate-500 font-medium text-sm ml-18">Prehľad vašich aktuálnych informácií.</p>
          </div>

          {/* Štatistiky */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{pendingDocs}</p>
                  <p className="text-xs text-slate-500">Dokumentov na podpis</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{signedDocs}</p>
                  <p className="text-xs text-slate-500">Podpísaných dokumentov</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Award size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{validCerts}</p>
                  <p className="text-xs text-slate-500">Platných certifikátov</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expirácia školení */}
          {nextExpiring && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertOctagon size={20} className="text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-800">
                    Platnosť školenia "{nextExpiring.title}" skončí o {nextExpiring.daysUntilExpiry} dní.
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Školenie je potrebné obnoviť o {nextExpiring.daysUntilExpiry} dní.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ak žiadne expirácie */}
          {!nextExpiring && validCerts > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-emerald-600" />
                <p className="text-emerald-800 font-medium">
                  Všetky vaše certifikáty sú platné. ✅
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePortalView;
