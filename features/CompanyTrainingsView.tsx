import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/ToastContext';
import { calculateSmartPricing, validateOrder, formatPrice, getTierDescription } from '../lib/pricing';
import { 
  Search,
  CheckCircle2,
  X,
  RefreshCw,
  Zap,
  ShieldCheck,
  Users,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Calendar,
  Filter,
  User,
  History,
  Camera,
  Archive,
  CreditCard,
  ShoppingBag,
  Printer,
  Award,
  Target,
  Trophy,
  Minus,
  Plus,
  ArrowRight,
  Send,
  Loader2,
  Check,
  Mail,
  CalendarCheck,
  BadgeCheck,
  BookOpen,
  AlertTriangle
} from 'lucide-react';

import { CertificateModal } from './EmployeePortalView';

// Funkcia na výpoet poctu dní do expirácie certifikátu
const getDaysUntilExpiry = (employeeTraining: any): number | null => {
  if (!employeeTraining.certs || employeeTraining.certs.length === 0) {
    return null; // Nemá certifikát
  }
  
  // Najdeme najnovsí certifikát
  const sortedCerts = employeeTraining.certs.sort((a: any, b: any) => 
    new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
  );
  const latestCert = sortedCerts[0];
  
  if (!latestCert?.valid_until) {
    return null; // Nemá dátum platnosti
  }
  
  const now = new Date();
  const expiryDate = new Date(latestCert.valid_until);
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Funkcia na kontrolu, ci certifikát k priradeniu expiroval
const isCertificationExpired = (employeeTraining: any) => {
  if (!employeeTraining.certs || employeeTraining.certs.length === 0) {
    return true; // Ak nemá certifikát, povolíme znovupriradenie
  }
  
  // Najdeme najnovsí certifikát
  const sortedCerts = employeeTraining.certs.sort((a: any, b: any) => 
    new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
  );
  const latestCert = sortedCerts[0];
  
  if (!latestCert?.valid_until) {
    return true; // Ak nemá dátum platnosti, povolíme znovupriradenie
  }
  
  // Skontrolujeme, ci certifikát expiroval
  return new Date(latestCert.valid_until) < new Date();
};

// Funkcia na kontrolu, ci sa má povoli skoré priradenie (teraz vdy pre existujúce certifikáty)
const shouldAllowEarlyRenewal = (employeeTraining: any) => {
  // Ak nemá certifikát, neumovníme skoré obnovenie
  if (!employeeTraining.certs || employeeTraining.certs.length === 0) {
    return false;
  }
  
  // Ak certifikát expiroval, pouije sa iná logika (isCertificationExpired)
  if (isCertificationExpired(employeeTraining)) {
    return false;
  }
  
  // Pre vetky ostatné platné certifikáty umvníme skoré obnovenie
  return true;
};

const CompanyTrainingsView: React.FC = () => {
  const { showToast } = useToast();
  const [quota, setQuota] = useState({ standard: 0, premium: 0, expert: 0, used_standard: 0, used_premium: 0, used_expert: 0 });
  const [baseSeats, setBaseSeats] = useState({ total: 0, experts: 0, expert: 0 });
  const [employeeTrainings, setEmployeeTrainings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSearch, setModalSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'tracking'>('inventory');
  
  // Filtre v modale
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Detail zamestnanca (Modal)
  const [selectedTrackingEmp, setSelectedTrackingEmp] = useState<any | null>(null);
  const [trackingSearch, setTrackingSearch] = useState('');

  const [showCert, setShowCert] = useState(false);
  const [certData, setCertData] = useState<any>(null);

  // Potvrdzovací modál pre opätovné priradenie
  const [showRenewConfirmModal, setShowRenewConfirmModal] = useState(false);
  const [renewingEmployee, setRenewingEmployee] = useState<any | null>(null);
  const [renewingEmployees, setRenewingEmployees] = useState<any[]>([]);
  const [isRenewalMode, setIsRenewalMode] = useState(false);

  // Stavové premenné pre správu kapacity
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [totalQty, setTotalQty] = useState(0);
  const [premiumQty, setPremiumQty] = useState(0);
  const [expertQty, setExpertQty] = useState(0);
  const [usage, setUsage] = useState({ used_standard: 0, used_premium: 0, used_expert: 0 });

  // Fakturačné údaje a modály
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    company_name: '',
    ico: '',
    dic: '',
    icdph: '',
    address: '',
    email: ''
  });

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
    // Validácia objednávky
    const validation = validateOrder(totalQty, premiumQty, expertQty);
    if (!validation.isValid) {
      showToast(validation.error || 'Chyba v objednávke', 'error');
      return;
    }

    if (!invoiceData.company_name || !invoiceData.ico || !invoiceData.address || !invoiceData.email) {
      showToast("Vyplňte všetky povinné fakturačné údaje", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Musíte byť prihlásený");
      
      const { error } = await supabase.from('license_requests').insert({
        company_id: session.user.id,
        quantity: totalQty,
        standard_quantity: totalQty - premiumQty,
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
      await fetchData();
    } catch (err: any) {
      showToast('Chyba: ' + err.message, 'error');
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session found - user not logged in");
        setLoading(false);
        return;
      }
      const userId = session.user.id;
      console.log("User ID:", userId);

      const { data: profile, error: profileError } = await supabase.from('employees').select('company_token, email, company_name').eq('id', userId).maybeSingle();
      if (profileError) {
        console.error("Profile error:", profileError);
        setLoading(false);
        return;
      }
      const companyToken = profile?.company_token;
      console.log("Company token:", companyToken);
      if (!companyToken) { 
        console.error("No company token found for user");
        setLoading(false); 
        return; 
      }

      // Predvyplnenie emailu v fakturačných údajoch
      if (profile?.email && !invoiceData.email) {
        setInvoiceData(prev => ({ ...prev, email: profile.email }));
      }
      if (profile?.company_name && !invoiceData.company_name) {
        setInvoiceData(prev => ({ ...prev, company_name: profile.company_name }));
      }

      const [purchasesRes, coursesRes, teamRes] = await Promise.all([
        supabase.from('company_purchases').select('total_licenses, standard_licenses, premium_licenses, expert_licenses, quantity').eq('company_id', userId).eq('status', 'active'),
        supabase.from('trainings').select('*').neq('status', 'archived').order('title'),
        supabase.from('employees').select('*').eq('company_token', companyToken)
      ]);

      if (purchasesRes.error) {
        console.error("Purchases error:", purchasesRes.error);
      }
      if (coursesRes.error) {
        console.error("Courses error:", coursesRes.error);
      }
      if (teamRes.error) {
        console.error("Team error:", teamRes.error);
      }

      const purchases = purchasesRes.data || [];
      const courses = coursesRes.data || [];
      const team = teamRes.data || [];
      
      const maxEmployees = purchases.reduce((acc, p) => acc + (p.total_licenses || p.quantity || 0), 0);
      const maxStandard = purchases.reduce((acc, p) => acc + (p.standard_licenses || 0), 0);
      const maxPremium = purchases.reduce((acc, p) => acc + (p.premium_licenses || 0), 0);
      const maxExpert = purchases.reduce((acc, p) => acc + (p.expert_licenses || 0), 0);
      
      setBaseSeats({ total: maxStandard, experts: maxPremium, expert: maxExpert });
      setAllCourses(courses);
      setEmployees(team.filter(e => e.id !== userId));

      const teamIds = team.map(e => e.id);
      const { data: assignmentsData } = await supabase
        .from('employee_trainings')
        .select(`
          *,
          training:trainings(*),
          certs:certificates(*)
        `)
        .in('employee_id', teamIds);
      
      const rawAssignments = assignmentsData || [];
      
      let usedS = 0;
      let usedP = 0;
      let usedE = 0;
      rawAssignments.forEach(at => {
        const trainingType = at.training?.training_type || (at.training?.is_premium ? 'premium' : 'standard');
        if (trainingType === 'expert') usedE++;
        else if (trainingType === 'premium') usedP++;
        else usedS++;
      });

      setQuota({ 
        standard: maxStandard, 
        premium: maxPremium, 
        expert: maxExpert,
        used_standard: usedS, 
        used_premium: usedP,
        used_expert: usedE
      });

      setEmployeeTrainings(rawAssignments);

      // Nastavenie hodnôt pre správu kapacity
      setUsage({ used_standard: usedS, used_premium: usedP, used_expert: usedE });
      setTotalQty(maxStandard + maxPremium + maxExpert);
      setPremiumQty(maxPremium);
      setExpertQty(maxExpert);

    } catch (error: any) {
      console.error("Fetch Error:", error);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const groupedTracking = useMemo(() => {
    return employees.map(emp => {
      const myTrainings = employeeTrainings.filter(at => at.employee_id === emp.id);
      return {
        ...emp,
        assignedCount: myTrainings.length,
        completedCount: myTrainings.filter(t => t.status === 'completed').length,
        trainings: myTrainings.map(at => {
          // Nájdeme certifikáty, ktoré patria k tomuto školeniu
          const trainingCerts = (at.certs || []).filter((cert: any) => cert.training_id === at.training_id);
          const sortedCerts = trainingCerts.sort((a: any, b: any) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime());
          const latestCert = sortedCerts[0];
          
          const knowledgeExpiry = latestCert?.valid_until;
          const slotExpiry = at.assigned_at ? new Date(new Date(at.assigned_at).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() : null;

          return { ...at, knowledgeExpiry, slotExpiry, latestCert, allCerts: sortedCerts };
        })
      };
    }).filter(e => 
      e.full_name?.toLowerCase().includes(trackingSearch.toLowerCase()) || 
      e.email?.toLowerCase().includes(trackingSearch.toLowerCase())
    );
  }, [employees, employeeTrainings, trackingSearch]);

  const confirmAssignment = () => {
    console.log('confirmAssignment called', { selectedCourse, selectedEmployees });
    
    if (!selectedCourse || selectedEmployees.length === 0) {
      console.log('Early return - no course or employees');
      return;
    }
    
    const trainingType = selectedCourse.training_type || (selectedCourse.is_premium ? 'premium' : 'standard');
    let maxPerCourse = baseSeats.total;
    
    if (trainingType === 'premium') {
      maxPerCourse = baseSeats.experts;
    } else if (trainingType === 'expert') {
      maxPerCourse = baseSeats.expert;
    }
    
    const currentlyInThisCourse = employeeTrainings.filter(at => at.training_id === selectedCourse.id).length;
    
    if (selectedEmployees.length + currentlyInThisCourse > maxPerCourse) {
      showToast(`Kapacita pre tento kurz je plná. Máte voľných už len ${Math.max(0, maxPerCourse - currentlyInThisCourse)} licencií.`, 'error');
      return;
    }

    // Získame detaily zamestnancov
    const employeesToAssign = selectedEmployees.map(empId => {
      return employees.find(emp => emp.id === empId);
    }).filter(Boolean);

    console.log('Setting modal state', { employeesToAssign, isRenewalMode: false });

    // Nastavíme stav pre potvredzovací modál
    setRenewingEmployee(null); // Pre nové priradenie nemáme jedného zamestnanca
    setRenewingEmployees(employeesToAssign);
    setIsRenewalMode(false); // Nové priradenie
    setShowRenewConfirmModal(true);
    
    console.log('Modal state set');
  };

  const quickRenewAssignment = (employeeId: string, employee: any) => {
    console.log('quickRenewAssignment called', { employeeId, employee });
    
    if (!selectedCourse) {
      console.log('No selected course');
      return;
    }
    
    // Nastavíme zamestnanca a zobrazíme potvredzovací modál
    console.log('Setting renewal modal state', { employee, isRenewalMode: true });
    
    setRenewingEmployee(employee);
    setRenewingEmployees([employee]);
    setIsRenewalMode(true); // Opätovné priradenie
    setShowRenewConfirmModal(true);
    
    console.log('Renewal modal state set');
  };

  const confirmGeneralAssignment = async () => {
    if (!selectedCourse || (!renewingEmployees.length && !renewingEmployee)) return;
    
    setLoading(true);
    try {
      const employeesToProcess = renewingEmployees.length > 0 ? renewingEmployees : [renewingEmployee];
      
      const assignments = employeesToProcess.map(emp => ({
        employee_id: emp.id,
        training_id: selectedCourse.id,
        status: 'assigned',
        progress_percentage: 0,
        assigned_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      const { error } = await supabase.from('employee_trainings').insert(assignments);
      if (error) throw error;
      
      const message = isRenewalMode 
        ? 'Opätovné priradenie bolo úspešné.' 
        : 'Prístup k školeniu bol úspešne aktivovaný.';
      
      showToast(message, 'success');
      await fetchData();
      
      // Zatvoríme modál a resetujeme stav
      setShowRenewConfirmModal(false);
      setRenewingEmployee(null);
      setRenewingEmployees([]);
      setIsRenewalMode(false);
      
      // Ak to bolo nové priradenie, zatvoríme aj pôvodný modál
      if (!isRenewalMode) {
        setShowAssignModal(false);
        setSelectedEmployees([]);
      }
    } catch (error: any) { 
      showToast(error.message, 'error'); 
    } finally { setLoading(false); }
  };

  const openCertFromModal = (at: any, cert: any) => {
    setCertData({
      userName: selectedTrackingEmp.full_name || selectedTrackingEmp.email,
      trainingTitle: at.training?.title,
      certNumber: cert.certificate_number,
      date: new Date(cert.issued_at).toLocaleDateString('sk-SK'),
      validUntil: cert.valid_until
    });
    setShowCert(true);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-left text-slate-900">
      <CertificateModal isOpen={showCert} onClose={() => setShowCert(false)} data={certData} />
      
      {/* HLAVNÝ NADPIS SEKCIE */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-1 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Moje školenia</h1>
              <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Správa školení, priraďovanie a nákup.</p>
        </div>
      </div>
      
      {/* PREHĽAD KAPACITY */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-left">
         <div className="px-10 py-8 text-left">
            <div className="grid md:grid-cols-2 gap-8">
               {/* Ľavá strana - Zjednodušený zoznam školení */}
               <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                     <Users size={18} className="text-gray-600" />
                     Využitie licencií
                  </h3>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Neoprávnené osoby</span>
                        <span className="text-sm font-bold text-gray-900">{baseSeats.total - usage.used_standard} voľných</span>
                     </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-amber-700">Oprávnené osoby</span>
                        <span className="text-sm font-bold text-amber-900">{baseSeats.experts - usage.used_premium} voľných</span>
                     </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-purple-700">Prístup ku kamerám</span>
                        <span className="text-sm font-bold text-purple-900">{baseSeats.expert - usage.used_expert} voľných</span>
                     </div>
                  </div>
               </div>

               {/* Pravá strana - DYNAMICKÁ KAPACITA */}
               <div className="bg-white rounded-[2.5rem] p-10 border border-brand-orange/20 text-slate-900 relative overflow-hidden shadow-xl text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                     <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 text-left text-brand-navy">
                        <RefreshCw size={20} className="text-brand-orange" /> Dynamické licencie
                     </h3>
                     <div className="mt-4 space-y-4">
                        <p className="text-[11px] font-bold text-brand-orange leading-relaxed uppercase tracking-widest">
                          Nové školenia sú pre existujúci tím automaticky bezplatné.
                        </p>
                        <p className="text-slate-500 text-xs leading-relaxed font-medium">
                          V skratke: ak vytvoríme nové školenie, vaši aktuálni zamestnanci ho získajú bezplatne a my vám automaticky navýšime počet potrebných licencií
                        </p>
                        <div className="pt-4">
                           <button 
                             onClick={() => {
                              setTotalQty(0);
                              setPremiumQty(0);
                              setExpertQty(0);
                              setShowQuotaModal(true);
                            }} 
                             className="bg-brand-orange text-white px-8 py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-brand-orange/10 hover:bg-brand-orange/90 transition-all active:scale-95 w-full"
                           >
                             Zakúpiť licencie školení
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      
      {/* PREPÍNAČ TABOV */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2 text-left">
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-1.5 rounded-[2rem] flex w-fit text-left shadow-lg border border-slate-200/50">
          <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-700 shadow-md border border-slate-200' : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'}`}>
            <BookOpen size={16} className={activeTab === 'inventory' ? 'text-brand-orange' : 'text-slate-400'} />
            Katalóg školení
          </button>
          <button onClick={() => setActiveTab('tracking')} className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === 'tracking' ? 'bg-white text-slate-700 shadow-md border border-slate-200' : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'}`}>
            <Users size={16} className={activeTab === 'tracking' ? 'text-brand-orange' : 'text-slate-400'} />
            Sledovanie progresu
          </button>
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder={activeTab === 'inventory' ? "Hľadať školenie..." : "Hľadať kolegu..."}
            value={activeTab === 'inventory' ? searchQuery : trackingSearch}
            onChange={(e) => activeTab === 'inventory' ? setSearchQuery(e.target.value) : setTrackingSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none shadow-sm text-slate-800"
          />
        </div>
      </div>

      {/* INFO TEXTY PRE TABY */}
      <div className="bg-gradient-to-r from-brand-orange/5 to-blue-50 rounded-2xl p-8 border border-brand-orange/10 shadow-sm">
        {activeTab === 'inventory' ? (
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/10">
              <BookOpen size={24} className="text-brand-orange" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">Katalóg školení</h3>
              <p className="text-slate-600 leading-relaxed">Tu sa zobrazia vaše školenia a možnosť priradiť ich konkrétnym zamestnancom.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Users size={24} className="text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">Sledovanie progresu</h3>
              <p className="text-slate-600 leading-relaxed">Tu sa zobrazí prehľad o absolvovaných školeniach vašich zamestnancov.</p>
            </div>
          </div>
        )}
      </div>

      {/* KATALÓG ŠKOLENÍ */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700 text-left text-slate-900">
          {allCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map((course) => {
            const trainingType = course.training_type || (course.is_premium ? 'premium' : 'standard');
            const assignedCount = employeeTrainings.filter(at => at.training_id === course.id).length;
            let courseCap = baseSeats.total;
            
            if (trainingType === 'premium') {
              courseCap = baseSeats.experts;
            } else if (trainingType === 'expert') {
              courseCap = baseSeats.expert;
            }

            return (
              <div key={course.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full relative text-left shadow-sm">
                <div className="h-48 relative overflow-hidden shrink-0">
                   <img src={course.thumbnail || "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&w=800&q=80"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Course" />
                   {/* ZJEMNENÝ OVERLAY FOTKY */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between text-left">
                   <div className="mb-6">
                      <h3 className="text-lg font-bold text-brand-navy leading-tight mb-4 text-left">{course.title}</h3>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 mb-6 text-left">{course.description}</p>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-3">
                            <Users size={16} className="text-slate-400" />
                            <div className="text-left">
                               <p className="text-xs font-medium text-slate-400 uppercase tracking-wider text-left">Aktivované u</p>
                               <p className="text-sm font-black text-slate-900 text-left">{assignedCount} z {courseCap}</p>
                            </div>
                         </div>
                         <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full ${trainingType === 'premium' ? 'bg-brand-orange' : trainingType === 'expert' ? 'bg-purple-600' : 'bg-brand-blue'}`} style={{ width: `${Math.min(100, (assignedCount / (courseCap || 1)) * 100)}%` }}></div>
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={() => { setSelectedCourse(course); setSelectedEmployees([]); setModalSearch(''); setShowAssignModal(true); }} 
                     className="w-full py-4 bg-slate-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                   >
                     Priradiť školenie
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SLEDOVANIE PROGRESU */}
      {activeTab === 'tracking' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {groupedTracking.map(emp => {
            const completionRate = emp.assignedCount > 0 ? (emp.completedCount / emp.assignedCount) * 100 : 0;
            const isCompleted = emp.completedCount === emp.assignedCount && emp.assignedCount > 0;
            const hasNoCertificates = emp.completedCount === 0;
            
            return (
              <div key={emp.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedTrackingEmp(emp)}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 uppercase shadow-sm group-hover:bg-brand-orange group-hover:text-white transition-all">
                        {emp.full_name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-base">{emp.full_name || emp.email}</div>
                        <div className="text-sm text-slate-500 mt-1">{emp.assignedCount} priradených • {emp.completedCount} dokončených</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Progress bar */}
                      {emp.assignedCount > 0 && (
                        <div className="flex-1 max-w-xs">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 font-medium">Priebeh školenia</span>&nbsp;
                            <span className="text-xs font-black text-slate-600">{Math.round(completionRate)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                isCompleted ? 'bg-emerald-500' : 
                                hasNoCertificates ? 'bg-rose-500' : 
                                'bg-orange-500'
                              }`}
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <button className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-orange group-hover:text-white group-hover:shadow-sm transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL ZAMESTNANCA */}
      {selectedTrackingEmp && (
        <div className="fixed inset-0 z-[40000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 text-left">
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedTrackingEmp(null)}></div>
           <div className="bg-white rounded-2xl max-w-4xl w-full shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col z-[40001] text-left">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-5 text-left">
                    <div className="w-14 h-14 bg-brand-orange/10 rounded-xl flex items-center justify-center text-2xl font-semibold text-brand-orange uppercase">
                      {selectedTrackingEmp.full_name?.[0] || 'U'}
                    </div>
                    <div className="text-left">
                       <h2 className="text-xl font-semibold text-white">{selectedTrackingEmp.full_name || selectedTrackingEmp.email}</h2>
                       <p className="text-sm text-white/80 mt-1">{selectedTrackingEmp.email} • {selectedTrackingEmp.position || 'Zamestnanec'}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTrackingEmp(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X size={20} className="text-white" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                 <div className="p-8 space-y-8 text-left">
                    <div className="flex items-center justify-between text-left">
                       <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-3"><History size={20} className="text-brand-orange"/> Prehľad vzdelávania</h3>
                       <div className="flex gap-6">
                          <div className="text-right">
                             <p className="text-xs text-slate-400 uppercase tracking-wider">Kurzy</p>
                             <p className="text-2xl font-bold text-slate-900">{selectedTrackingEmp.assignedCount}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs text-slate-400 uppercase tracking-wider">Platné certifikáty</p>
                             <p className="text-2xl font-bold text-emerald-600">{selectedTrackingEmp.completedCount}</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-left">
                       {selectedTrackingEmp.trainings.length === 0 ? (
                          <div className="col-span-2 py-20 text-center opacity-40 italic text-slate-400 font-bold uppercase text-sm tracking-widest">Žiadne školenia v zozname</div>
                       ) : selectedTrackingEmp.trainings.map((at: any) => (
                          <div key={at.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6 group hover:border-brand-orange/30 transition-all text-left">
                             <div className="flex items-start justify-between gap-4 text-left">
                                <div className="text-left flex-1">
                                   <h4 className="font-bold text-slate-900 text-base leading-tight">{at.training?.title || 'Kurz bol odstránený'}</h4>
                                </div>
                                <div className="text-right shrink-0">
                                   <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest ${at.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-brand-blue animate-pulse'}`}>
                                     {at.status === 'completed' ? 'Hotovo' : 'Prebieha'}
                                   </span>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-6 border-y border-slate-50 py-6 text-left">
                                <div className="space-y-4 text-left">
                                   <div className="text-left">
                                      <p className="text-xs font-medium text-slate-500 mb-1">Priradené</p>
                                      <p className="text-sm font-semibold text-slate-900">{at.assigned_at ? new Date(at.assigned_at).toLocaleDateString('sk-SK') : '—'}</p>
                                   </div>
                                   <div className="text-left">
                                      <p className="text-xs font-medium text-slate-500 mb-1">Certifikát</p>
                                      <p className="text-sm font-semibold text-slate-900">{at.completed_at ? new Date(at.completed_at).toLocaleDateString('sk-SK') : 'V procese'}</p>
                                   </div>
                                </div>
                                <div className="space-y-4 text-left">
                                   <div className="text-left">
                                      <p className="text-xs font-medium text-slate-500 mb-1">Opätovné preškolenie</p>
                                      <p className={`text-sm font-semibold ${at.knowledgeExpiry ? 'text-slate-900' : 'text-slate-900'}`}>
                                         {at.knowledgeExpiry ? 
                                           new Date(at.knowledgeExpiry).toLocaleDateString('sk-SK') : 
                                           at.completed_at ? 
                                             new Date(new Date(at.completed_at).setMonth(new Date(at.completed_at).getMonth() + 6)).toLocaleDateString('sk-SK') : 
                                             'Nebolo stanovené'
                                         }
                                      </p>
                                   </div>
                                   <div className="text-left">
                                      <p className="text-xs font-medium text-slate-500 mb-1">Úplná expirácia</p>
                                      <p className="text-sm font-semibold text-slate-900">{at.slotExpiry ? new Date(at.slotExpiry).toLocaleDateString('sk-SK') : '—'}</p>
                                   </div>
                                </div>
                             </div>

                             {at.status === 'completed' && at.latestCert && (
                                <button 
                                  onClick={() => openCertFromModal(at, at.latestCert)}
                                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-brand-orange transition-all shadow-lg"
                                >
                                   <ExternalLink size={14}/> Zobraziť osvedčenie
                                </button>
                             )}
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-white border-t border-slate-100 flex justify-center text-left">
                 <button onClick={() => setSelectedTrackingEmp(null)} className="px-10 py-4 bg-slate-50 text-slate-500 rounded-2xl font-semibold uppercase text-xs tracking-wide hover:bg-slate-100 transition-all shadow-sm">Zavrieť detail</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL PRIRADENIA */}
      {showAssignModal && selectedCourse && (
        <div className="fixed inset-0 z-[40000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 text-left">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAssignModal(false)}></div>
          <div className="bg-white rounded-xl max-w-4xl w-full shadow-xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh] relative z-[40001] text-left">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-6 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
               <div className="relative z-10 space-y-2">
                  <h2 className="text-2xl font-semibold text-white">Priradiť prístup</h2>
                  <p className="text-white/80 text-sm">{selectedCourse.title}</p>
               </div>
               <div className="text-right relative z-10">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Voľných licencií</p>
                  <p className="text-3xl font-bold text-brand-orange leading-none mt-1">
                    {(() => {
                      const selectedTrainingType = selectedCourse.training_type || (selectedCourse.is_premium ? 'premium' : 'standard');
                      let availableLicenses = baseSeats.total;
                      
                      if (selectedTrainingType === 'premium') {
                        availableLicenses = baseSeats.experts;
                      } else if (selectedTrainingType === 'expert') {
                        availableLicenses = baseSeats.expert;
                      }
                      
                      const usedInThisCourse = employeeTrainings.filter(at => at.training_id === selectedCourse.id).length;
                      return availableLicenses - usedInThisCourse;
                    })()}
                  </p>
               </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 space-y-4">
               <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="relative flex-1 w-full">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input type="text" placeholder="Hľadať meno..." value={modalSearch} onChange={(e) => setModalSearch(e.target.value)} className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                     <select 
                        value={assignmentFilter} 
                        onChange={(e) => setAssignmentFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                     >
                        <option value="all">Všetci zamestnanci</option>
                        <option value="unassigned">Nepriradení</option>
                     </select>
                     
                     <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                     >
                        <option value="name">Zoradiť podľa mena</option>
                        <option value="email">Zoradiť podľa emailu</option>
                        <option value="status">Zoradiť podľa statusu</option>
                     </select>
                  </div>
               </div>
               
               {employees.length > 50 && (
                  <div className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
                     <strong>Tip:</strong> Pre {employees.length} zamestnancov použite filtre pre rýchlejšie nájdenie.
                  </div>
               )}
            </div>

            <div className="p-6 overflow-y-auto no-scrollbar space-y-3 flex-1 bg-white">
               {employees
                 .filter(e => (e.full_name || e.email).toLowerCase().includes(modalSearch.toLowerCase()))
                 .filter(e => {
                    // Získame najnovsí záznam pre tohto zamestnanca a kurz
                    const employeeCourseTrainings = employeeTrainings.filter(at => at.employee_id === e.id && at.training_id === selectedCourse.id);
                    const latestTraining = employeeCourseTrainings.sort((a, b) => 
                      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                    )[0];
                    
                    // Základný filter podla assignment status
                    if (assignmentFilter === 'unassigned') {
                       return !latestTraining;
                    }
                    // 'all' - zobrazi vetkých zamestnancov
                    return true;
                 })
                 .sort((a, b) => {
                    // Zoradenie podľa vybraného kritéria
                    if (sortBy === 'name') {
                       return (a.full_name || a.email).localeCompare(b.full_name || b.email);
                    }
                    if (sortBy === 'email') {
                       return a.email.localeCompare(b.email);
                    }
                    if (sortBy === 'status') {
                       const aAssignment = employeeTrainings.find(at => at.employee_id === a.id && at.training_id === selectedCourse.id);
                       const bAssignment = employeeTrainings.find(at => at.employee_id === b.id && at.training_id === selectedCourse.id);
                       const aStatus = aAssignment ? (isCertificationExpired(aAssignment) ? 2 : shouldAllowEarlyRenewal(aAssignment) ? 1 : 0) : -1;
                       const bStatus = bAssignment ? (isCertificationExpired(bAssignment) ? 2 : shouldAllowEarlyRenewal(bAssignment) ? 1 : 0) : -1;
                       return bStatus - aStatus; // Najprv tí, ktorí potrebujú pozornosť
                    }
                    return 0;
                 })
                 .map(emp => {
                 const existingAssignment = employeeTrainings.find(at => at.employee_id === emp.id && at.training_id === selectedCourse.id);
                 const isAlreadyInThisCourse = existingAssignment && !isCertificationExpired(existingAssignment) && !shouldAllowEarlyRenewal(existingAssignment);
                 const isSelected = selectedEmployees.includes(emp.id);

                 return (
                   <label key={emp.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${isAlreadyInThisCourse ? 'opacity-40 grayscale cursor-not-allowed bg-slate-50' : existingAssignment && shouldAllowEarlyRenewal(existingAssignment) ? 'bg-blue-50 border-blue-200 hover:border-blue-300' : existingAssignment && isCertificationExpired(existingAssignment) ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>{isSelected && <CheckCircle2 size={14} className="text-white" />}</div>
                      <input type="checkbox" className="hidden" disabled={isAlreadyInThisCourse} checked={isSelected} onChange={() => {
                        if (isSelected) setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                        else setSelectedEmployees([...selectedEmployees, emp.id]);
                      }} />
                      <div className="flex-1">
                         <p className="text-sm font-medium text-slate-900">{emp.full_name || emp.email}</p>
                         <p className="text-xs text-slate-500 mt-0.5">{emp.email}</p>
                      </div>
                      {existingAssignment && (
                        <div className="flex flex-col items-end shrink-0 gap-2">
                           {isCertificationExpired(existingAssignment) ? (
                             <>
                               <span className="text-xs text-amber-600">Expirované - môžete znova priradiť</span>
                               <button
                                 onClick={(e) => {
                                   e.preventDefault();
                                   e.stopPropagation();
                                   quickRenewAssignment(emp.id, emp);
                                 }}
                                 className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded text-xs font-medium hover:bg-amber-600 transition-all"
                                 disabled={loading}
                               >
                                 <RefreshCw size={12} />
                                 Opätovne priradiť
                               </button>
                             </>
                           ) : (
                             <>
                               <span className="text-xs text-blue-600 font-medium">
                                 {(() => {
                                   const days = getDaysUntilExpiry(existingAssignment);
                                   return days !== null && days > 0 
                                     ? `Vyprší za ${days} ${days === 1 ? 'deň' : days < 5 ? 'dní' : 'dní'}`
                                     : 'Čoskoro vyprší';
                                 })()}
                               </span>
                               <button
                                 onClick={(e) => {
                                   e.preventDefault();
                                   e.stopPropagation();
                                   quickRenewAssignment(emp.id, emp);
                                 }}
                                 className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-all"
                                 disabled={loading}
                               >
                                 <RefreshCw size={12} />
                                 Opätovne priradiť
                               </button>
                             </>
                           )}
                        </div>
                      )}
                   </label>
                 );
               })}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4 shrink-0">
               <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex gap-2">
                     <button 
                        onClick={() => {
                           const availableEmployees = employees
                              .filter(e => (e.full_name || e.email).toLowerCase().includes(modalSearch.toLowerCase()))
                              .filter(e => {
                                 const employeeCourseTrainings = employeeTrainings.filter(at => at.employee_id === e.id && at.training_id === selectedCourse.id);
                                 const latestTraining = employeeCourseTrainings.sort((a, b) => 
                                    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                                 )[0];
                                 if (assignmentFilter === 'unassigned') {
                                    return !latestTraining;
                                 }
                                 return true; // 'all' - zobrazi vetkých zamestnancov
                              })
                              .filter(e => {
                                 const existingAssignment = employeeTrainings.find(at => at.employee_id === e.id && at.training_id === selectedCourse.id);
                                 const isAlreadyInThisCourse = existingAssignment && !isCertificationExpired(existingAssignment) && !shouldAllowEarlyRenewal(existingAssignment);
                                 return !isAlreadyInThisCourse;
                              })
                              .map(emp => emp.id);
                           setSelectedEmployees(availableEmployees);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        Označiť všetko
                     </button>
                     <button 
                        onClick={() => setSelectedEmployees([])}
                        className="px-4 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
                     >
                        Zrušiť výber
                     </button>
                  </div>
                  <button onClick={confirmAssignment} disabled={loading || selectedEmployees.length === 0} className="w-full md:w-auto bg-slate-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center gap-2 transition-all">
                     {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />} Priradiť školenie
               </button>
               </div>
            </div>
          </div>
        </div>
      )}
      
      {/* MODÁLNE OKNO PRE KONFIGURÁCIU LICENCIÍ */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQuotaModal(false)}></div>
           
           <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6 flex items-center justify-between">
                 <div>
                    <h2 className="text-xl font-semibold text-white">Konfigurácia licencií</h2>
                    <p className="text-sm text-slate-300 mt-1">Tu si viete zakúpiť ročné licencie na školenia pre zamestnancov</p>
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
                             <h3 className="font-semibold text-gray-900 mb-4 text-center">1. Celkový počet zamestnancov</h3>
                             <div className="flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => setTotalQty(Math.max(1, totalQty - 1))}
                                  className="w-8 h-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                  <Minus size={16} className="text-gray-600" />
                                </button>
                                <div className="w-16 text-center">
                                  <input 
                                    type="text" 
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

                          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                             <h3 className="font-semibold text-amber-900 mb-4 text-center">2. Z toho oprávnené osoby</h3>
                             <div className="flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => setPremiumQty(Math.max(0, Math.min(premiumQty - 1, totalQty)))}
                                  className="w-8 h-8 bg-white border border-amber-300 rounded-lg flex items-center justify-center hover:bg-amber-50 transition-colors"
                                >
                                  <Minus size={16} className="text-amber-600" />
                                </button>
                                <div className="w-16 text-center">
                                  <input 
                                    type="text" 
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

                          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                             <h3 className="font-semibold text-purple-900 mb-4 text-center">3. Prístup ku kamerám</h3>
                             <div className="flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => setExpertQty(Math.max(0, Math.min(expertQty - 1, premiumQty)))}
                                  className="w-8 h-8 bg-white border border-purple-300 rounded-lg flex items-center justify-center hover:bg-purple-50 transition-colors"
                                >
                                  <Minus size={16} className="text-purple-600" />
                                </button>
                                <div className="w-16 text-center">
                                  <input 
                                    type="text" 
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

                       {/* Pravá strana - Súhrn a cena */}
                       <div className="space-y-6">
                          <div className="bg-white border border-gray-200 rounded-xl p-6">
                             <h3 className="font-semibold text-gray-900 mb-4">Súhrn licencií</h3>
                             <div className="space-y-1">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                   <span className="text-sm text-gray-600">Neoprávnené osoby</span>
                                   <span className="font-medium text-gray-900">{totalQty - premiumQty}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                   <span className="text-sm text-gray-600">Oprávnené osoby</span>
                                   <span className="font-medium text-amber-900">{premiumQty}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                   <span className="text-sm text-gray-600">Prístup ku kamerám</span>
                                   <span className="font-medium text-purple-900">{expertQty}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
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
                            placeholder="1234567890"
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
                       <label className="text-sm font-medium text-gray-700">Kde pošleme faktúru? *</label>
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
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                       <Mail className="text-gray-600" size={20} />
                       <div>
                          <p className="text-sm text-gray-700 font-medium">Hotovo! Vaša objednávka bude spracovaná do 24 hodín.<br />Faktúru Vám zašleme na e-mail</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                       <BadgeCheck className="text-gray-600" size={20} />
                       <div>
                          <p className="text-sm text-gray-700 font-medium">Licencie školení Vám budú priradené okamžite po prijatí platby.</p>
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
      
      {/* POTVRDZOVACÍ MODÁL PRE OPÄTOVNÉ PRIRADENIE */}
      {showRenewConfirmModal && (renewingEmployee || renewingEmployees.length > 0) && (
        <div className="fixed inset-0 z-[40000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-slate-900/30" onClick={() => setShowRenewConfirmModal(false)}></div>
          
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-500">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                {isRenewalMode ? 'Potvrdiť opätovné priradenie' : 'Potvrdiť priradenie'}
              </h2>
                <button onClick={() => setShowRenewConfirmModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Informácie o zamestnancoch */}
              {isRenewalMode ? (
                // Opätovné priradenie - jeden zamestnanec
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg font-semibold text-blue-600">
                      {renewingEmployee.full_name?.[0]?.toUpperCase() || renewingEmployee.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{renewingEmployee.full_name || renewingEmployee.email}</p>
                      <p className="text-sm text-slate-500">{renewingEmployee.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Nové priradenie - viacerí zamestnanci
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-medium text-slate-900 mb-3">Zamestnanci ({renewingEmployees.length})</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2">
                    {renewingEmployees.map((emp, index) => {
                      const existingAssignment = employeeTrainings.find(at => 
                        at.employee_id === emp.id && at.training_id === selectedCourse.id
                      );
                      const hasHistory = !!existingAssignment;
                      
                      return (
                        <div key={emp.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                            {emp.full_name?.[0]?.toUpperCase() || emp.email?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{emp.full_name || emp.email}</p>
                            <p className="text-xs text-slate-500">{emp.email}</p>
                            {hasHistory && (
                              <p className="text-xs text-amber-600 mt-1">Už priradené v minulosti</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Informácie o kurze */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-medium text-blue-900 mb-1">{selectedCourse?.title}</p>
                <p className="text-sm text-blue-700">
                  {isRenewalMode ? (
                    (() => {
                      const existingAssignment = employeeTrainings.find(at => 
                        at.employee_id === renewingEmployee.id && at.training_id === selectedCourse.id
                      );
                      if (!existingAssignment) return 'Nové priradenie';
                      
                      const days = getDaysUntilExpiry(existingAssignment);
                      if (days === null) return 'Stav neznámy';
                      
                      if (days < 0) {
                        const expiredDays = Math.abs(days);
                        return `Certifikát vypršal pred ${expiredDays} ${expiredDays === 1 ? 'dňom' : expiredDays < 5 ? 'dní' : 'dní'}`;
                      } else if (days === 0) {
                        return 'Certifikát expiruje dnes';
                      } else {
                        return `Certifikát je platný ${days} ${days === 1 ? 'deň' : days < 5 ? 'dní' : 'dní'}`;
                      }
                    })()
                  ) : (
                    'Nové priradenie'
                  )}
                </p>
              </div>

              {/* Varovanie/UPOZORNENIE - len pri opätovnom priraďovaní */}
              {isRenewalMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 mb-1">Upozornenie</p>
                      <p className="text-xs text-amber-700">
                        Opätovné priradenie školenia Vám odpočíta (1) licenciu. Školenie je platné po dobu jedného roka, preto sa uistite, že pôvodná ročná licencia už expirovala, alebo čoskoro vyprší.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Potvrdzovacie tlaidlá */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRenewConfirmModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  disabled={loading}
                >
                  Zrušiť
                </button>
                <button
                  onClick={confirmGeneralAssignment}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Potvrdiť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyTrainingsView;