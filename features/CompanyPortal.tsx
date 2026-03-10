
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthService';
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  ShoppingBag,
  FileText,
  Trophy,
  Activity,
  RefreshCw,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Info,
  X,
  AlertCircle,
  TrendingUp,
  Target,
  BarChart3,
  Star,
  Bell,
  Settings,
  Plus,
  Eye,
  Download,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  GraduationCap,
  Award,
  Lightbulb,
  Rocket,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

interface CompanyPortalProps {
  onViewChange?: (view: string) => void;
}

export const CompanyPortal: React.FC<CompanyPortalProps> = ({ onViewChange }) => {
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Získanie názvu firmy z metadát
  const [companyName, setCompanyName] = useState('Vaša firma');
  
  useEffect(() => {
    const fetchCompanyName = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // Získanie názvu firmy z tabuľky employees (rovnako ako v EmployeePortalView)
      const { data: empProfile } = await supabase
        .from('employees')
        .select('company_name')
        .eq('id', session.user.id)
        .maybeSingle();
      
      console.log('Employee profile:', empProfile); // Debug výpis
      
      if (empProfile?.company_name) {
        setCompanyName(empProfile.company_name);
      } else {
        // Fallback - skúsime metadáta
        const userMeta = session.user.user_metadata || {};
        console.log('User metadata fallback:', userMeta);
        setCompanyName(userMeta.companyName || userMeta.full_name || 'Vaša firma');
      }
    };
    
    fetchCompanyName();
  }, []);
  const [stats, setStats] = useState({
    employees: 0,
    courses: 0,
    pendingDocs: 0,
    certificates: 0,
    completionRate: 0,
    monthlyGrowth: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTrainings, setActiveTrainings] = useState(0);
  const [signedDocs, setSignedDocs] = useState(0);
  const [pendingDocs, setPendingDocs] = useState(0);

  const handleNavigate = (view: string) => {
    onViewChange?.(view);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const userId = sessionData.session.user.id;

      const { data: empRecord } = await supabase
        .from('employees')
        .select('company_token')
        .eq('id', userId)
        .single();

      if (!empRecord?.company_token) return;
      const companyToken = empRecord.company_token;

      // Filter pre logy: posledných 10 dní
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      // 1. ZÍSKANIE DÁT
      const [empRes, courseRes, docRes, certRes, activityRes, trainingRes] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact', head: true }).eq('company_token', companyToken),
        supabase.from('company_purchases').select('total_licenses, quantity').eq('company_id', userId).eq('status', 'active'),
        supabase.from('assigned_documents').select('*, document:document_id!inner(company_id)').eq('document.company_id', userId),
        supabase.from('certificates').select('id, employee:employee_id!inner(company_token)', { count: 'exact', head: true }).eq('employee.company_token', companyToken),
        supabase.from('activity_log')
          .select('*')
          .eq('company_token', companyToken)
          .gt('created_at', tenDaysAgo.toISOString())
          .order('created_at', { ascending: false }),
        supabase.from('employee_trainings').select('*, employee:employees(*), training:trainings(*), certs:certificates(*)').eq('employee.company_token', companyToken)
      ]);

      // OPRAVA: Sčítavanie licencií (total_licenses má prednosť, inak quantity)
      const totalLicensesSum = (courseRes.data || []).reduce((acc, p) => {
        const val = (p.total_licenses !== null && p.total_licenses > 0) ? p.total_licenses : (p.quantity || 0);
        return acc + val;
      }, 0);

      // 4. RÝCHLE AKCIE - DYNAMICKÉ PODLA DÁT
      const dynamicQuickActions = [
        { 
          id: 'add_employee', 
          title: 'Pridať zamestnanca', 
          desc: 'Rozšírte tím o nového člena', 
          icon: <Plus size={20}/>, 
          color: 'blue', 
          action: () => handleNavigate('employees'),
          priority: 'high'
        },
        { 
          id: 'assign_training', 
          title: 'Priradiť školenie', 
          desc: 'Naplánujte vzdelávanie', 
          icon: <GraduationCap size={20}/>, 
          color: 'orange', 
          action: () => handleNavigate('trainings'),
          priority: stats.pendingDocs > 0 ? 'high' : 'medium'
        },
        { 
          id: 'sign_documents', 
          title: 'Dokumenty na podpis', 
          desc: `${stats.pendingDocs} čaká na podpis`, 
          icon: <FileText size={20}/>, 
          color: stats.pendingDocs > 0 ? 'rose' : 'emerald', 
          action: () => handleNavigate('ip_management'),
          priority: stats.pendingDocs > 0 ? 'urgent' : 'low'
        },
        { 
          id: 'expiring_certs', 
          title: 'Expirácie certifikátov', 
          desc: `${expiringItems.length} vyprší`, 
          icon: <AlertTriangle size={20}/>, 
          color: expiringItems.length > 0 ? 'orange' : 'emerald', 
          action: () => handleNavigate('certificates'),
          priority: expiringItems.length > 0 ? 'urgent' : 'low'
        }
      ];
      
      setQuickActions(dynamicQuickActions);

      // 5. INŠIGHTY A TIPY
      const completionRate = trainingRes.data && trainingRes.data.length > 0 
        ? Math.round((trainingRes.data.filter((t: any) => t.status === 'completed').length / trainingRes.data.length) * 100)
        : 0;

      setInsights([
        {
          type: 'success',
          icon: <TrendingUp size={16} />,
          title: 'Vysoká miera dokončenia',
          value: `${completionRate}%`,
          desc: 'Váš tím má nadpriemernú mieru dokončenia školení'
        },
        {
          type: 'warning',
          icon: <AlertTriangle size={16} />,
          title: 'Potrebná obnova',
          value: `${expiringItems.length} certifikátov`,
          desc: 'Blíži sa expirácia certifikátov - naplánujte obnovu'
        },
        {
          type: 'info',
          icon: <Lightbulb size={16} />,
          title: 'Optimalizácia licencií',
          value: `${Math.round((stats.courses / stats.employees) * 100)}%`,
          desc: 'Využitie licencií - zvážte optimalizáciu'
        }
      ]);

      // 6. REALNE NOTIFIKÁCIE Z DÁT
      const realNotifications: any[] = [];
      
      // Expirácie certifikátov
      expiringItems.forEach(item => {
        realNotifications.push({
          id: `exp-${item.id}`,
          type: item.type === 'CRITICAL' ? 'urgent' : 'warning',
          title: 'Expirácia certifikátu',
          desc: `${item.user} - ${item.title} (za ${item.daysLeft} dní)`,
          time: item.daysLeft <= 7 ? 'ihneď' : `${item.daysLeft} dní`,
          read: false,
          action: () => handleNavigate('trainings')
        });
      });
      
      // Dokumenty na podpis
      if (stats.pendingDocs > 0) {
        realNotifications.push({
          id: 'pending-docs',
          type: 'info',
          title: 'Dokumenty na podpis',
          desc: `${stats.pendingDocs} dokumentov čaká na podpis zamestnancov`,
          time: 'dnes',
          read: false,
          action: () => handleNavigate('ip_management')
        });
      }
      
      // Nové zamestnanci (posledných 7 dní)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentEmployees = activityRes.data?.filter((a: any) => 
        a.action_text?.includes('pridaný') && 
        new Date(a.created_at) > sevenDaysAgo
      ).length || 0;
      
      if (recentEmployees > 0) {
        realNotifications.push({
          id: 'new-employees',
          type: 'info',
          title: 'Noví zamestnanci',
          desc: `${recentEmployees} nových zamestnancov pridaných tento týždeň`,
          time: 'tento týždeň',
          read: false,
          action: () => handleNavigate('employees')
        });
      }
      
      setNotifications(realNotifications.slice(0, 5)); // Najviac 5 notifikácií

      // Vypočítanie štatistík pre hlavný row a notifikácie
      const completedTrainings = trainingRes.data?.filter((t: any) => t.status === 'completed').length || 0;
      const totalTrainings = trainingRes.data?.length || 0;
      const expiringCritical = expiringItems.filter(item => item.type === 'CRITICAL').length;
      const expiringWarning = expiringItems.filter(item => item.type === 'WARNING').length;
      
      // Výpočet aktívnych školení (s platnými certifikátmi)
      const activeTrainingsCount = trainingRes.data?.filter((t: any) => {
        const sortedCerts = (t.certs || []).sort((a: any, b: any) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime());
        const latestCert = sortedCerts[0];
        if (!latestCert || !latestCert.valid_until) return false;
        const validUntil = new Date(latestCert.valid_until);
        const now = new Date();
        return validUntil > now;
      }).length || 0;
      
      // Výpočet podpísaných a čakajúcich dokumentov
      const signedDocsCount = docRes.data?.filter((d: any) => d.status === 'SIGNED').length || 0;
      const pendingDocsCount = docRes.data?.filter((d: any) => d.status === 'PENDING').length || 0;
      
      // Nastavenie state premenných
      setActiveTrainings(activeTrainingsCount);
      setSignedDocs(signedDocsCount);
      setPendingDocs(pendingDocsCount);
      
      // Pridaj štatistiku dokončenia do notifikácií
      if (completedTrainings > 0) {
        realNotifications.push({
          id: 'completion-stats',
          type: 'success',
          title: 'Štatistika školení',
          desc: `${completedTrainings}/${totalTrainings} školení ukončených (${Math.round((completedTrainings/totalTrainings)*100)}%)`,
          time: 'tento týždeň',
          read: true,
          action: () => handleNavigate('trainings')
        });
      }
      
      setStats({
        employees: empRes.count ?? 0,
        courses: totalLicensesSum,
        pendingDocs: docRes.data?.filter((d: any) => d.status === 'PENDING').length ?? 0,
        certificates: certRes.count ?? 0,
        completionRate: totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 0,
        monthlyGrowth: 12 // Simulovaný rast
      });

      setRecentActivity(activityRes.data || []);

      // 2. LOGIKA EXPIRÁCIÍ (30 / 60 dní)
      const now = new Date();
      const alerts: any[] = [];

      (trainingRes.data || []).forEach(at => {
        const sortedCerts = (at.certs || []).sort((a: any, b: any) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime());
        const latestCert = sortedCerts[0];

        if (latestCert && latestCert.valid_until && at.status === 'completed') {
          const validUntil = new Date(latestCert.valid_until);
          const diffDays = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 60) {
            alerts.push({
              id: at.id,
              user: at.employee?.full_name || at.employee?.email,
              title: at.training?.title,
              type: diffDays <= 30 ? 'CRITICAL' : 'WARNING',
              daysLeft: diffDays
            });
          }
        }
      });
      
      setExpiringItems(alerts.sort((a, b) => a.daysLeft - b.daysLeft));

    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  return (
    <div className="space-y-8 pb-20 animate-fade-in text-left text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <LayoutDashboard size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Nástenka</h1>
              <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Vitaj, {companyName}</p>
        </div>
        <button onClick={fetchDashboardData} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand-blue hover:shadow-lg transition-all">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* TABUĽKA ŠKOLENÍ */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
            <GraduationCap size={20} className="text-brand-orange" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Stav školení</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="border-b border-orange-200 pb-2 mb-3">
              <p className="text-sm font-medium text-slate-900">Platné certifikáty</p>
            </div>
            <div className="flex items-center gap-4 p-4 pt-0">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-slate-900 leading-tight">{loading ? '—' : activeTrainings}</p>
                <p className="text-sm text-slate-500">Aktívne</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="border-b border-orange-200 pb-2 mb-3">
              <p className="text-sm font-medium text-slate-900">Vyprší platnosť</p>
            </div>
            <div className="flex items-center gap-4 p-4 pt-0">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-orange-600" />
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-slate-900 leading-tight">{loading ? '—' : expiringItems.filter(item => item.type === 'WARNING').length}</p>
                <p className="text-sm text-slate-500">Expirujú do 30 dní</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="border-b border-orange-200 pb-2 mb-3">
              <p className="text-sm font-medium text-slate-900">Neplatné certifikáty</p>
            </div>
            <div className="flex items-center gap-4 p-4 pt-0">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-rose-600" />
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-slate-900 leading-tight">{loading ? '—' : expiringItems.filter(item => item.type === 'CRITICAL').length}</p>
                <p className="text-sm text-slate-500">Expirované</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABUĽKA INFORMAČNÝCH POVINNOSTÍ */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-brand-blue" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Informačné povinnosti (IP)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="border-b border-orange-200 pb-2 mb-3">
              <p className="text-sm font-medium text-slate-900">Dokončené dokumenty</p>
            </div>
            <div className="flex items-center gap-4 p-4 pt-0">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-slate-900 leading-tight">{loading ? '—' : signedDocs}</p>
                <p className="text-sm text-slate-500">Podpísané</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="border-b border-orange-200 pb-2 mb-3">
              <p className="text-sm font-medium text-slate-900">Nedokončené dokumenty</p>
            </div>
            <div className="flex items-center gap-4 p-4 pt-0">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-rose-600" />
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-slate-900 leading-tight">{loading ? '—' : pendingDocs}</p>
                <p className="text-sm text-slate-500">Čakajú na podpis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPortal;
