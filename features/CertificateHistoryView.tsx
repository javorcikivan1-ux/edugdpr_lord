import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CertificateModal } from './EmployeePortalView';
import { 
  History, 
  Award, 
  Calendar, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  FileText, 
  Download, 
  Eye,
  Shield,
  Archive,
  RefreshCw,
  X,
  Check
} from 'lucide-react';

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  valid_until: string;
  score: number;
  training_id: string;
  employee_training_id: string;
  training?: {
    id: string;
    title: string;
    category: string;
  };
}

export const CertificateHistoryView: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'valid' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'issued_at' | 'valid_until'>('issued_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCert, setShowCert] = useState(false);
  const [certData, setCertData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const fetchCertificates = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          training:trainings(id, title, category)
        `)
        .eq('employee_id', session.user.id)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    loadUserData();
  }, []);

  const openCertificate = (cert: Certificate) => {
    if (!user) return;
    
    setCertData({
      userName: `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || user.email}`,
      trainingTitle: cert.training?.title || 'Neznáme skolenie',
      certNumber: cert.certificate_number,
      date: new Date(cert.issued_at).toLocaleDateString('sk-SK'),
      validUntil: cert.valid_until
    });
    setShowCert(true);
  };

  const downloadCertificate = (cert: Certificate) => {
    // Otvoríme certifikát v modálnom okne a potom spustíme tlaèidlo tlaèiarne
    openCertificate(cert);
    
    // Po krátkom oneskorení automaticky spustíme tlaè
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const filteredCertificates = certificates.filter(cert => {
    if (filter === 'all') return true;
    if (filter === 'valid') return !isExpired(cert.valid_until);
    if (filter === 'expired') return isExpired(cert.valid_until);
    return true;
  });

  const getStatusBadge = (cert: Certificate) => {
    if (isExpired(cert.valid_until)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">
          <AlertOctagon size={12} />
          Expirovaný
        </span>
      );
    }
    
    if (isExpiringSoon(cert.valid_until)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
          <Clock size={12} />
          Blízko expirácie
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={12} />
        Platný
      </span>
    );
  };

  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-orange rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium uppercase text-xs tracking-wider animate-pulse">Načítavam certifikáty školení</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-left text-slate-900">
      <CertificateModal 
        isOpen={showCert} 
        onClose={() => setShowCert(false)} 
        data={certData} 
      />
      
      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center">
            <History size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">História certifikátov</h1>
            <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
          </div>
        </div>
        <p className="text-slate-500 font-medium text-sm ml-18">Prehľad certifikátov (expirovaných & aktuálnych)</p>
      </div>

      {/* STATISTIKY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Award size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {certificates.filter(c => !isExpired(c.valid_until)).length}
              </p>
              <p className="text-sm text-slate-600">Platné certifikáty</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {certificates.filter(c => isExpiringSoon(c.valid_until)).length}
              </p>
              <p className="text-sm text-slate-600">Blízko expirácie</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center">
              <Archive size={20} className="text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {certificates.filter(c => isExpired(c.valid_until)).length}
              </p>
              <p className="text-sm text-slate-600">Expirované</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTRE A ZORADENIE */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-brand-orange text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Vsetky ({certificates.length})
            </button>
            <button
              onClick={() => setFilter('valid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'valid' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Platné ({certificates.filter(c => !isExpired(c.valid_until)).length})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'expired' 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Expirované ({certificates.filter(c => isExpired(c.valid_until)).length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50"
            >
              {sortOrder === 'asc' ? 'Najstaršie' : 'Najnovšie'}
            </button>
          </div>
        </div>
      </div>

      {/* ZOZNAM CERTIFIKÁTOV */}
      <div className="space-y-4">
        {filteredCertificates.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center">
            <Archive className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">
              {filter === 'expired' ? 'iadne expirované certifikáty' : 'iadne certifikáty'}
            </p>
          </div>
        ) : (
          filteredCertificates.map((cert) => (
            <div key={cert.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      isExpired(cert.valid_until) 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : isExpiringSoon(cert.valid_until)
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {isExpired(cert.valid_until) ? <X size={20} /> : <Check size={20} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 leading-tight mb-2">
                        {cert.training?.title || 'Neznáme skolenie'}
                      </h4>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          <strong>Číslo certifikátu:</strong> {cert.certificate_number}
                        </p>
                        <p>
                          <strong>Vydaný:</strong> {new Date(cert.issued_at).toLocaleDateString('sk-SK')}
                        </p>
                        <p>
                          <strong>Platnosť do:</strong> {new Date(cert.valid_until).toLocaleDateString('sk-SK')}
                        </p>
                                                {cert.training?.category && (
                          <p>
                            <strong>Kategória:</strong> {cert.training.category}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(cert)}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openCertificate(cert)}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-all"
                      >
                        <Eye size={16} />
                        Zobraziť
                      </button>
                      <button 
                        onClick={() => downloadCertificate(cert)}
                        className="flex items-center justify-center gap-2 bg-brand-orange text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-all"
                      >
                        <Download size={16} />
                        Stiahnuť
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CertificateHistoryView;
