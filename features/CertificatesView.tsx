
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CertificateModal } from './EmployeePortalView';
import { 
  Trophy, 
  Award, 
  Download, 
  Search, 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  FileBadge,
  Eye,
  History,
  Clock,
  // Added missing icons
  RefreshCw,
  X
} from 'lucide-react';

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  score: number;
  training_title: string;
  training_category: string;
}

interface EmployeeWithCerts {
  id: string;
  name: string;
  email: string;
  certificates: Certificate[];
}

export const CertificatesView = () => {
  const [employees, setEmployees] = useState<EmployeeWithCerts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithCerts | null>(null);
  
  // State pre modal certifikátu
  const [showCertModal, setShowCertModal] = useState(false);
  const [activeCertData, setActiveCertData] = useState<any>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const user = session.user;
      
      // Získanie tokenu firmy
      const { data: profile } = await supabase.from('employees').select('company_token').eq('id', user.id).maybeSingle();
      const myToken = profile?.company_token || user.user_metadata?.company_token || user.user_metadata?.token;

      if (!myToken) throw new Error("Nepodarilo sa overiť identitu firmy.");

      // Načítanie zamestnancov a ich certifikátov z DB
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          full_name,
          email,
          certificates!left (
            id,
            certificate_number,
            issued_at,
            score,
            training:trainings(title, category)
          )
        `)
        .eq('company_token', myToken)
        .neq('id', user.id); // Vynecháme samotného admina, ak je zamestnancom

      if (error) throw error;

      if (data) {
        setEmployees(data.map((emp: any) => ({
          id: emp.id,
          name: emp.full_name || emp.email,
          email: emp.email,
          certificates: (emp.certificates || []).map((c: any) => ({
            id: c.id,
            certificate_number: c.certificate_number,
            issued_at: new Date(c.issued_at).toLocaleDateString('sk-SK'),
            score: c.score,
            training_title: c.training?.title || 'Neznáme školenie',
            training_category: c.training?.category || 'Všeobecné'
          }))
        })));
      }
    } catch (e: any) {
      console.error("Chyba pri načítaní certifikátov:", e);
    } finally {
      setLoading(false);
    }
  };

  const openPreview = (emp: EmployeeWithCerts, cert: Certificate) => {
    setActiveCertData({
      userName: emp.name,
      trainingTitle: cert.training_title,
      certNumber: cert.certificate_number,
      date: cert.issued_at
    });
    setShowCertModal(true);
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <RefreshCw className="w-12 h-12 text-brand-blue animate-spin" />
      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Sťahujem archív osvedčení...</p>
    </div>
  );

  return (
    <>
      <CertificateModal 
        isOpen={showCertModal} 
        onClose={() => setShowCertModal(false)} 
        data={activeCertData} 
      />

      <div className="space-y-10 animate-fade-in pb-20 text-left">

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Knižnica certifikátov</h1>
              <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Kompletný audit a história absolvovaných školení vášho tímu.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Hľadať zamestnanca..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-8 focus:ring-[#00427a]/5 outline-none transition-all shadow-sm text-left"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {filteredEmployees.map((emp) => (
          <div 
            key={emp.id}
            onClick={() => setSelectedEmployee(emp)}
            className={`bg-white rounded-xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full ${
              selectedEmployee?.id === emp.id ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-lg font-semibold text-white shadow-sm">
                  {emp.name[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-slate-800 transition-colors truncate">{emp.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{emp.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Certifikáty</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    emp.certificates.length > 0 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {emp.certificates.length}
                  </span>
                </div>
                
                {emp.certificates.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {emp.certificates.slice(0, 2).map((c, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                        {c.training_category}
                      </span>
                    ))}
                    {emp.certificates.length > 2 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                        +{emp.certificates.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-slate-100 transition-colors">
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">Zobraziť detail</span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL ZAMESTNANCA S HISTÓRIOU CERTIFIKÁTOV */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="modal-overlay" onClick={() => setSelectedEmployee(null)}></div>
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedEmployee.name}</h2>
                <p className="text-sm text-slate-300 mt-1">{selectedEmployee.email}</p>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <History size={24} className="text-brand-orange" />
                    <h3 className="text-lg font-semibold text-slate-900">Archív absolvovaných kurzov</h3>
                  </div>

                  {selectedEmployee.certificates.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                        <Trophy size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium">Zamestnanec zatiaľ nedokončil žiadne školenie.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {selectedEmployee.certificates.map((cert) => (
                        <div key={cert.id} className="bg-slate-50 rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                                📜
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">{cert.training_title}</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} className="text-brand-orange" />
                                    {cert.issued_at}
                                  </span>
                                  <span className="text-emerald-600 font-medium">ID: {cert.certificate_number.split('-').pop()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openPreview(selectedEmployee, cert)}
                                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all"
                              >
                                <Eye size={16} />
                                Náhľad
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
