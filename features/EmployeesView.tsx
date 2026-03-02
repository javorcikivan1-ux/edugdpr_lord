import React, { useState, useMemo, useEffect } from 'react';
import { Employee } from '../types';
import { supabase, updateEmployeeStatus, deleteEmployee } from '../lib/supabase';
import { useToast } from '../lib/ToastContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Copy, 
  MoreVertical, 
  Mail, 
  CheckCircle2,
  XCircle,
  RefreshCw,
  Shield,
  X,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Calendar,
  FileText,
  Clock,
  Zap,
  Info,
  ClipboardCheck,
  Hash,
  Award,
  BookOpen,
  User as UserIcon,
  Star,
  Link as LinkIcon,
  AlertTriangle
} from 'lucide-react';

const AlertCircleIcon = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

export const EmployeesView = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [activeKebab, setActiveKebab] = useState<string | null>(null);
  const [dbToken, setDbToken] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string, name: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const currentUserId = session.user.id;
        
        const { data: profile } = await supabase
          .from('employees')
          .select('company_token')
          .eq('id', currentUserId)
          .maybeSingle();
        
        const myToken = profile?.company_token || session.user.user_metadata?.company_token || `LB-${currentUserId.slice(0, 8).toUpperCase()}`;
        setDbToken(myToken);

        // Načítanie zamestnancov
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('company_token', myToken)
          .neq('id', currentUserId);

        if (empError) throw empError;
        setEmployees(empData.map((d: any) => ({
          id: d.id,
          name: d.full_name || d.email,
          email: d.email,
          status: d.status || 'ACTIVE',
          joined: d.created_at ? new Date(d.created_at).toLocaleDateString('sk-SK') : 'N/A',
          role: d.position === 'ADMIN_ROOT' ? 'ADMIN' : 'EMPLOYEE',
          courses: [],
          documents: []
        })));

        // Načítanie pozvánok
        console.log('Loading invitations for company token:', myToken);
        const { data: invData, error: invError } = await supabase
          .from('invitations')
          .select('*')
          .eq('company_token', myToken)
          .eq('status', 'PENDING')
          .order('invited_at', { ascending: false });

        console.log('Invitations result:', { invData, invError });

        if (invError) {
          console.error('Error loading invitations:', invError);
        } else {
          console.log('Setting invitations:', invData || []);
          setInvitations(invData || []);
        }
      }
    } catch (err: any) {
      showToast('Chyba pri načítaní: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    fetchData();
    // Získanie názvu firmy pre pozvánky
    const fetchCompanyName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('employees')
            .select('company_name')
            .eq('id', user.id)
            .maybeSingle();
          
          if (profile?.company_name) {
            setCompanyName(profile.company_name);
          }
        }
      } catch (err) {
        console.error('Error fetching company name:', err);
      }
    };
    
    fetchCompanyName();
  }, []);

  const addEmployee = async (employeeData: any) => {
    try {
      const response = await fetch('/api/create-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          ...employeeData,
          company_token: dbToken
        })
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Zamestnanec pridaný', 'success');
        fetchData();
      } else {
        showToast('Chyba: ' + result.error, 'error');
      }
    } catch (err: any) {
      console.error('Add employee error:', err);
      showToast('Chyba pri pridaní: ' + err.message, 'error');
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/?action=join&companyToken=${dbToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    showToast('Odkaz skopírovaný', 'success');
  };

  const copyCompanyId = () => {
    if (dbToken) {
      navigator.clipboard.writeText(dbToken);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
      showToast('ID skopírované', 'success');
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail) return;
    
    setIsSending(true);
    try {
      // Získame aktuálny session token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          email: inviteEmail,
          companyName: companyName || 'LORD´S BENISON s.r.o.', // Fallback ak sa nepodarí získať názov
          companyToken: dbToken,
          employeeName: inviteName || inviteEmail.split('@')[0] // Použi zadané meno alebo získať z emailu
        })
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Pozvánka úspešne odoslaná', 'success');
        setInviteEmail('');
        setInviteName('');
        setShowInvite(false);
        // Znovu načítame dáta, vrátane pozvánok
        fetchData();
      } else {
        showToast('Chyba pri odoslaní: ' + result.error, 'error');
      }
    } catch (err: any) {
      console.error('Send invite error:', err);
      showToast('Chyba pri odoslaní: ' + err.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ id, name });
    setActiveKebab(null);
  };

  const deleteEmployeeHandler = async (id: string) => {
    try {
      console.log('Deleting employee:', id);
      const { error } = await deleteEmployee(id);
      if (error) {
        console.error('Delete error:', error);
        showToast('Chyba pri vymazaní: ' + error.message, 'error');
      } else {
        showToast('Zamestnanec vymazaný', 'success');
        setDeleteModal(null);
        fetchData();
      }
    } catch (err: any) {
      console.error('Delete exception:', err);
      showToast('Chyba pri vymazaní: ' + err.message, 'error');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      console.log('Toggling status for employee:', id);
      const emp = employees.find(e => e.id === id);
      if (!emp) {
        showToast('Zamestnanec nebol nájdený', 'error');
        return;
      }
      const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      console.log('New status:', newStatus);
      
      const { error } = await updateEmployeeStatus(id, newStatus);
      if (error) {
        console.error('Status update error:', error);
        showToast('Chyba pri zmene statusu: ' + error.message, 'error');
      } else {
        showToast(`Status zmenený na ${newStatus}`, 'success');
        fetchData();
      }
    } catch (err: any) {
      console.error('Status toggle exception:', err);
      showToast('Chyba pri zmene statusu: ' + err.message, 'error');
    }
    setActiveKebab(null);
  };

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInvitations = invitations.filter(inv => 
    inv.email.toLowerCase().includes(search.toLowerCase()) || 
    (inv.employee_name && inv.employee_name.toLowerCase().includes(search.toLowerCase()))
  );

  if (selectedEmpId) {
    return <EmployeeProfileDetail empId={selectedEmpId} onBack={() => setSelectedEmpId(null)} />;
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <RefreshCw className="animate-spin text-brand-blue" size={32} />
      <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Sťahujem dáta tímu...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Správa zamestnancov</h1>
              <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Správa členov a audit vzdelávania.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Hľadať zamestnanca..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all shadow-sm text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <button 
            onClick={() => setShowInvite(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 shrink-0"
          >
            <UserPlus size={18} /> Pridať zamestnanca
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(emp => (
          <div 
            key={emp.id}
            onClick={() => setSelectedEmpId(emp.id)}
            className={`group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-orange/20 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full ${emp.status === 'INACTIVE' ? 'opacity-60 grayscale' : ''}`}
          >
            {/* FIX PREKRYVANIA: Status badge a Hamburger v hornom riadku s medzerou */}
            <div className="flex items-start justify-between mb-8 relative z-10">
               <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-all">
                  <UserIcon size={32} strokeWidth={2.5} />
               </div>
               
               <div className="flex items-center gap-3">
                 <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                   emp.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                 }`}>
                   {emp.status === 'ACTIVE' ? 'Aktívny' : 'Deaktivovaný'}
                 </div>
                 
                 <button 
                  onClick={(e) => { e.stopPropagation(); setActiveKebab(activeKebab === emp.id ? null : emp.id); }}
                  className="w-8 h-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 z-20"
                >
                  <MoreVertical size={18} />
                </button>
               </div>
            </div>

            <div className="space-y-1 mb-8 relative z-10 text-left">
               <h3 className="text-xl font-bold text-slate-900 transition-colors truncate">{emp.name}</h3>
               <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                 <Mail size={12} className="text-brand-blue" /> {emp.email}
               </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
               <div className="space-y-1 text-left">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider leading-none">Registrácia</p>
                  <p className="text-xs font-bold text-slate-800">{emp.joined}</p>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-brand-orange group-hover:bg-orange-50 transition-all">
                  <ChevronRight size={20} />
               </div>
            </div>
            
            {activeKebab === emp.id && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setActiveKebab(null); }}></div>
                <div className="absolute right-4 top-20 w-56 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={(e) => { e.stopPropagation(); toggleStatus(emp.id); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-black uppercase tracking-widest flex items-center gap-3 text-slate-700">
                    {emp.status === 'ACTIVE' ? <XCircle size={16} className="text-rose-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                    {emp.status === 'ACTIVE' ? 'Deaktivovať' : 'Aktivovať'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openDeleteModal(emp.id, emp.name); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-50 text-xs font-black uppercase tracking-widest flex items-center gap-3 text-rose-600">
                    <Trash2 size={16} /> Vymazať
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-4xl grayscale opacity-20">👥</div>
             <h4 className="text-lg font-bold text-slate-500 uppercase tracking-widest">Žiadne výsledky</h4>
             <button onClick={() => setSearch('')} className="text-brand-blue font-black text-[10px] uppercase tracking-widest hover:underline">Zrušiť filtre</button>
          </div>
        )}
      </div>

      {/* POZVÁNKY - NEZAREGISTROVANÍ ZAMESTNANCI */}
      {filteredInvitations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Čakajúce pozvánky</h2>
            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
              {filteredInvitations.length}
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvitations.map(inv => (
              <div 
                key={inv.id}
                className="group bg-white/60 p-8 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full opacity-75"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 pointer-events-none"></div>
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Mail size={32} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-200">
                      Nezaregistrovaný
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-8 relative z-10 text-left">
                  <h3 className="text-xl font-bold text-slate-700 transition-colors truncate">
                    {inv.employee_name || inv.email.split('@')[0]}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                    <Mail size={12} className="text-amber-600" /> {inv.email}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-amber-100 flex items-center justify-between relative z-10">
                  <div className="space-y-1 text-left">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider leading-none">Pozvaný</p>
                    <p className="text-xs font-bold text-slate-700">
                      {new Date(inv.invited_at).toLocaleDateString('sk-SK')}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <Clock size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL POZVÁNKY - ŠIROKÉ ROZLOŽENIE */}
      {showInvite && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInvite(false)}></div>
          
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                  <UserPlus size={20} className="text-brand-orange" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Pozvať zamestnanca</h3>
                  <p className="text-sm text-slate-300">Prístup do systému</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInvite(false)} 
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X size={16} strokeWidth={2} className="text-white/80" />
              </button>
            </div>

            <div className="p-4">
              {/* Odporúčaný spôsob - E-mail pozvánka */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-brand-orange/20 rounded-full flex items-center justify-center">
                    <Star size={12} className="text-brand-orange" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">Odporúčaný spôsob</h4>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Mail size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-900 text-sm">E-mail pozvánka</h5>
                      <p className="text-xs text-blue-700">Odošlite pozvánku priamo na e-mail</p>
                    </div>
                  </div>
                  <div className="bg-white border border-blue-300 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block">Meno zamestnanca</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Meno zamestnanca (nepovinné)" 
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block">E-mail *</label>
                        <div className="relative">
                          <input 
                            type="email" 
                            placeholder="zamestnanec@firma.sk" 
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alternatíva - Registračný odkaz */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                    <LinkIcon size={12} className="text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">Alternatíva</h4>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Zap size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 text-sm">Registračný odkaz</h5>
                        <p className="text-xs text-gray-600">Zdieľajte tento odkaz pre registráciu</p>
                      </div>
                    </div>
                    {linkCopied && <span className="text-emerald-600 text-xs font-medium">Skopírované!</span>}
                  </div>
                  <div className="bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between gap-3">
                    <code className="font-mono text-xs text-gray-700 break-all flex-1">{window.location.origin}/?action=join&companyToken={dbToken}</code>
                    <button 
                      onClick={copyInviteLink}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Copy size={12} /> Kopírovať odkaz
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setShowInvite(false)}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Zrušiť
              </button>
              <button 
                onClick={sendInvite}
                disabled={isSending || !inviteEmail}
                className="flex-1 px-6 py-3 bg-brand-orange text-white rounded-xl font-medium text-sm hover:bg-brand-orange/90 transition-colors shadow-lg shadow-brand-orange/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSending ? 'Odosielam...' : 'Odoslať pozvánku'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL - SVETLÝ PEKNÝ DIZAJN */}
      {deleteModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteModal(null)}></div>
          
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Trash2 size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Vymazanie zamestnanca</h3>
                  <p className="text-sm text-rose-100">Potvrďte trvalé odstránenie</p>
                </div>
              </div>
              <button 
                onClick={() => setDeleteModal(null)} 
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X size={16} strokeWidth={2} className="text-white/80" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon size={24} className="text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-lg">{deleteModal.name}</p>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Zamestnanec</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-rose-50 rounded-xl p-6 border border-rose-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-rose-900 text-sm">Táto akcia je nezvratná</p>
                    <p className="text-rose-700 text-xs mt-1">Všetky údaje zamestnanca budú trvalo odstránené zo systému.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Zrušiť
              </button>
              <button 
                onClick={() => deleteEmployeeHandler(deleteModal.id)}
                className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-xl font-medium text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
              >
                Vymazať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * PROFIL ZAMESTNANCA - KOMPAKTNÝ DIZAJN S VYSOKÝM KONTRASTOM
 */
const EmployeeProfileDetail = ({ empId, onBack }: { empId: string, onBack: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [trainingsHistory, setTrainingsHistory] = useState<any[]>([]);
  const [docsHistory, setDocsHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'vzdelavanie' | 'legislativa'>('vzdelavanie');

  const [trainingSearch, setTrainingSearch] = useState('');
  const [trainingStatus, setTrainingStatus] = useState<'all' | 'completed' | 'assigned'>('all');

  const [docSearch, setDocSearch] = useState('');
  const [docOnlyUnsigned, setDocOnlyUnsigned] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const [empRes, trainRes, docRes] = await Promise.all([
          supabase.from('employees').select('*').eq('id', empId).single(),
          supabase.from('employee_trainings').select('*, training:trainings(*)').eq('employee_id', empId).order('assigned_at', { ascending: false }),
          supabase.from('assigned_documents').select('*, document:document_id ( id, title )').eq('employee_id', empId).order('created_at', { ascending: false })
        ]);

        if (empRes.data) setEmployee(empRes.data);
        if (trainRes.data) setTrainingsHistory(trainRes.data);
        if (docRes.data) setDocsHistory(docRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [empId]);

  const filteredTrainings = useMemo(() => {
    return trainingsHistory.filter(t => {
      const matchesSearch = t.training?.title?.toLowerCase().includes(trainingSearch.toLowerCase());
      const matchesStatus = trainingStatus === 'all' || t.status === trainingStatus;
      return matchesSearch && matchesStatus;
    });
  }, [trainingsHistory, trainingSearch, trainingStatus]);

  const filteredDocs = useMemo(() => {
    return docsHistory.filter(d => {
      const matchesSearch = d.document?.title?.toLowerCase().includes(docSearch.toLowerCase());
      const matchesUnsigned = !docOnlyUnsigned || d.status !== 'SIGNED';
      return matchesSearch && matchesUnsigned;
    });
  }, [docsHistory, docSearch, docOnlyUnsigned]);

  if (loading) return (
    <div className="p-40 flex justify-center flex-col items-center gap-4">
      <RefreshCw className="animate-spin text-brand-blue" size={32} />
      <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Generujem profil...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto text-left">
      <button onClick={onBack} className="group flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-600 hover:text-[#00427a] transition-all">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Späť na zoznam
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div className="space-y-1 text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight text-left leading-none">{employee.full_name || employee.email}</h1>
        </div>
      </div>

      {/* KARTA ZAMESTNANCA */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
            <UserIcon size={18} className="text-brand-orange" />
          </div>
          <h2 className="text-lg font-semibold text-white">Profil zamestnanca</h2>
        </div>
        
        <div className="p-6 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-[#00427a] p-1 shadow-lg">
              <div className="w-full h-full bg-[#00427a] rounded-lg flex items-center justify-center text-white border border-white/20">
                <UserIcon size={36} strokeWidth={2.5} />
              </div>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full shadow-lg flex items-center justify-center ${employee.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              <CheckCircle2 size={10} className="text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-lg text-xs font-medium uppercase tracking-wider border border-brand-orange/10">Zamestnanec</span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-medium uppercase tracking-wider border border-slate-200">ID: {employee.id.slice(0,8)}</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-medium uppercase tracking-wider border ${
                employee.status === 'ACTIVE' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                {employee.status === 'ACTIVE' ? 'Aktívny' : 'Neaktívny'}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
              <div className="bg-slate-50 px-4 py-2 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-2 border border-slate-200">
                <Mail size={12} className="text-brand-blue" /> {employee.email}
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-2 border border-slate-200">
                <Calendar size={12} className="text-brand-orange" /> Od {new Date(employee.created_at).toLocaleDateString('sk-SK')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-blue-50 px-6 py-4 rounded-lg border border-blue-100 text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Školenia</p>
              <p className="text-xl font-black text-[#00427a]">{trainingsHistory.length}</p>
            </div>
            <div className="bg-emerald-50 px-6 py-4 rounded-lg border border-emerald-100 text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Podpisy</p>
              <p className="text-xl font-black text-emerald-700">{docsHistory.filter(d => d.status === 'SIGNED').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABY */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row border-b border-slate-200">
          <button
            onClick={() => setActiveTab('vzdelavanie')}
            className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all shrink-0 border-b-2 relative ${
              activeTab === 'vzdelavanie' 
                ? 'border-brand-orange text-slate-900' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Award 
              size={18} 
              className={`transition-colors ${activeTab === 'vzdelavanie' ? 'text-brand-orange' : 'text-slate-400'}`} 
            />
            <span className={activeTab === 'vzdelavanie' ? 'text-slate-900 font-semibold' : ''}>Vzdelávanie</span>
            {activeTab === 'vzdelavanie' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('legislativa')}
            className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all shrink-0 border-b-2 relative ${
              activeTab === 'legislativa' 
                ? 'border-brand-orange text-slate-900' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Shield 
              size={18} 
              className={`transition-colors ${activeTab === 'legislativa' ? 'text-brand-orange' : 'text-slate-400'}`} 
            />
            <span className={activeTab === 'legislativa' ? 'text-slate-900 font-semibold' : ''}>Legislatíva</span>
            {activeTab === 'legislativa' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange"></div>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-8 text-left">
        {activeTab === 'vzdelavanie' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-brand-orange" />
              </div>
              <h2 className="text-lg font-semibold text-white">Zoznam školení</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Hľadať školenie..." 
                    value={trainingSearch}
                    onChange={(e) => setTrainingSearch(e.target.value)}
                    className="pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#00427a]/5 transition-all w-48 text-slate-800"
                  />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {[
                    { id: 'all', label: 'Všetko' },
                    { id: 'completed', label: 'Ukončené' },
                    { id: 'assigned', label: 'Nedokončené' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setTrainingStatus(tab.id as any)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${trainingStatus === tab.id ? 'bg-white text-[#00427a] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                 {filteredTrainings.map((item, idx) => (
                   <div key={item.id || idx} className="bg-slate-50 p-6 rounded-lg border border-slate-200 hover:border-brand-blue/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${item.status === 'completed' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                           {item.status === 'completed' ? '🏆' : '📚'}
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900 text-lg">{item.training?.title}</h4>
                           <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 uppercase tracking-wider">
                              <span className="flex items-center gap-1.5"><Calendar size={12} className="text-brand-orange"/> Priradené: {new Date(item.assigned_at).toLocaleDateString('sk-SK')}</span>
                              <span className={`flex items-center gap-1.5 ${item.status === 'completed' ? 'text-emerald-700' : 'text-brand-blue'}`}>
                                <Zap size={12} fill="currentColor"/> {item.status === 'completed' ? 'UKONČENÉ' : 'NEDOKONČENÉ'}
                              </span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 shrink-0">
                         <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Progres</div>
                         <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-900">{item.progress_percentage}%</span>
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                               <div className={`h-full transition-all duration-1000 ${item.status === 'completed' ? 'bg-emerald-500' : 'bg-brand-blue'}`} style={{ width: `${item.progress_percentage}%` }}></div>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
                 
                 {filteredTrainings.length === 0 && (
                   <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                      <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Nenašli sa žiadne školenia</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'legislativa' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-brand-orange" />
              </div>
              <h2 className="text-lg font-semibold text-white">Priradené Informačné povinnosti (IP)</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Hľadať dokument..." 
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#00427a]/5 transition-all w-48 text-slate-800"
                  />
                </div>
                <button 
                  onClick={() => setDocOnlyUnsigned(!docOnlyUnsigned)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider border transition-all ${docOnlyUnsigned ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'}`}
                >
                  <AlertTriangle size={14} /> Len nepodpísané
                </button>
              </div>
              
              <div className="space-y-3">
                 {filteredDocs.map((item, idx) => (
                   <div key={item.id || idx} className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex items-center justify-between group hover:border-brand-blue/20 transition-all">
                      <div className="flex items-center gap-5">
                         <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.status === 'SIGNED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                           {item.status === 'SIGNED' ? <CheckCircle2 size={24}/> : <Clock size={24}/>}
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-900">{item.document?.title}</h4>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Priradené: {new Date(item.created_at).toLocaleDateString('sk-SK')}</p>
                         </div>
                      </div>
                      
                      <div className="text-right">
                         <span className={`px-4 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider border ${
                           item.status === 'SIGNED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                         }`}>
                           {item.status === 'SIGNED' ? 'Podpísané' : 'Nepodpísané'}
                         </span>
                         {item.signed_at && <p className="text-xs font-medium text-slate-600 uppercase mt-1.5">Dátum: {new Date(item.signed_at).toLocaleDateString('sk-SK')}</p>}
                      </div>
                   </div>
                 ))}
                 
                 {filteredDocs.length === 0 && (
                   <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                      <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Nenašli sa žiadne dokumenty</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesView;