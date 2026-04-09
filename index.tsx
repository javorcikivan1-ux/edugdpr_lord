import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './features/AuthService';
import { AuthView } from './features/AuthView';
import { supabase } from './lib/supabase';
import { TrainingProvider, useTraining } from './features/TrainingStore';
import { ToastProvider } from './lib/ToastContext';
import { LandingPage } from './features/LandingPage';
import { ContactView } from './features/ContactView';
import { GDPRView } from './features/GDPRView';
import { VOPView } from './features/VOPView';
import { AMLView } from './features/AMLView';
import { TrainingsInfoView } from './features/TrainingsInfoView';
import { AdminPanel } from './features/AdminPanel';
import { CompanyPortal } from './features/CompanyPortal';
import EmployeeTrainingView from './features/EmployeeTrainingView';
import EmployeePortalView from './features/EmployeePortalView';
import EmployeeDocumentView from './features/EmployeeDocumentView';
import DocumentsView from './features/DocumentsView';
import EmployeesView from './features/EmployeesView';
import { SettingsView } from './features/SettingsView';
import CertificateHistoryView from './features/CertificateHistoryView';
import { CertificatesView } from './features/CertificatesView';
import { IPManagementView } from './features/IPManagementView';
import { ResetPasswordView } from './features/ResetPasswordView';
import SuperAdminTools from './features/SuperAdminTools';
import CompanyTrainingsView from './features/CompanyTrainingsView';
import { TrainingMarketplace } from './features/TrainingMarketplace';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Settings, 
  LogOut, 
  FileText, 
  Trophy, 
  ShoppingBag, 
  BookOpen, 
  Edit3, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Zap,
  Layout,
  User,
  CreditCard,
  Building2,
  RefreshCw,
  History
} from 'lucide-react';

const LOGO_BLUE = "/modree.png";

const DataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const App: React.FC = () => {
  const { state, logout } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER_COMPANY' | 'JOIN_COMPANY' | 'CHOICE' | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEmailConfirming, setIsEmailConfirming] = useState(false);
  const [routeParams, setRouteParams] = useState<{ trainingId?: string; employeeId?: string }>({});

  // URL slugs pre authenticated views
  const viewToPath = useCallback((view: string, params?: { trainingId?: string; employeeId?: string }) => {
    const pathMap: Record<string, string> = {
      // Public pages
      'landing': '/',
      'contact': '/kontakt',
      'gdpr': '/gdpr',
      'vop': '/vop',
      'aml': '/aml',
      'trainings_info': '/trainings-info',
      'reset_password': '/reset-password',

      // Authenticated views with proper slugs
      'admin_trainings': '/admin/editor-skoleni',
      'admin_requests': '/admin/dopyty-nakup',
      'admin_companies': '/admin/klienti',
      'company': '/dashboard',
      'training_marketplace': '/marketplace',
      'training_detail': params?.trainingId ? `/marketplace/${params.trainingId}` : '/marketplace',
      'employees': '/zamestnanci',
      'employee_detail': params?.employeeId ? `/zamestnanci/${params.employeeId}` : '/zamestnanci',
      'trainings': '/skolenia',
      'ip_management': '/dokumenty',
      'certificates': '/certifikaty',
      'employee_portal': '/portal',
      'employee_documents': '/oboznamovanie',
      'documents': '/moje-dokumenty',
      'employee': '/e-learning',
      'certificate_history': '/historia',
      'settings': '/nastavenia',
      'profile': '/profil'
    };
    return pathMap[view] || '/';
  }, []);

  const setViewWithoutHistory = useCallback((view: string) => {
    setCurrentView(view);
    setAuthMode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigate = useCallback((view: string, path?: string, params?: { trainingId?: string; employeeId?: string }) => {
    setCurrentView(view);
    setAuthMode(null);
    if (params) {
      setRouteParams(params);
    }
    const targetPath = path || viewToPath(view, params);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view, params }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewToPath]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Počkáme chvíľu, aby sa AuthContext stav vyčistil
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Vyčistíme sessionStorage
      sessionStorage.removeItem('lastView');
      
      // Po úspešnom odhlásení presmerujeme na landing
      setCurrentView('landing');
      setAuthMode(null);
      if (window.location.pathname !== '/') {
        window.history.pushState({ view: 'landing' }, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Chyba pri odhlasovaní:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  const handleRouteChange = useCallback((isPopstate: boolean = false) => {
    (async () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      const companyToken = urlParams.get('companyToken');

      // Helper function na detekciu mobilného zariadenia
      const isMobile = () => window.innerWidth < 640;

      // Vždy skontroluj email confirmation - podobné ako reset password
      if (path === '/' && window.location.hash && window.location.hash.includes('access_token')) {
        setIsEmailConfirming(true);

        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // Ak je to email confirmation
        if (accessToken && refreshToken && type === 'signup') {
          // Pre mobilné zariadenia: potvrdíme účet ale neprípusíme prihlásenie
            if (isMobile()) {
              // Ziadny login - len presmerujeme na login formulár
              window.location.hash = '';
              window.history.pushState({ view: 'auth' }, '', '/');

              setCurrentView('auth');
              setAuthMode('LOGIN');
              setTimeout(() => setIsEmailConfirming(false), 0);
              return;
          } else {
            // Pre desktop: normálne prihlásenie bez manuálneho redirectu
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            // Získame user data po nastavení session
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              console.log('User confirmed via email:', userData.user.email);
              
              // Email normalizácia pre RLS porovnávanie
              const cleanEmail = userData.user.email.trim().toLowerCase();
              console.log('Clean email for RLS:', cleanEmail);
              
              // Po krátkom delay pre stabilizáciu auth session
              
              // Skontrolujeme, či už existuje employee
              const { data: employeeData } = await supabase
                .from('employees')
                .select('id')
                .eq('id', userData.user.id)
                .maybeSingle();
              
              // Najdi invitation pre company_token
              const { data: invitation } = await supabase
                .from('invitations')
                .select('*')
                .eq('email', cleanEmail)
                .maybeSingle();
              
              if (!employeeData && invitation) {
                console.log('Creating employee after email confirmation...');
                
                await supabase.from('employees').insert({
                  id: userData.user.id,
                  email: cleanEmail,
                  full_name: userData.user.user_metadata?.full_name || cleanEmail,
                  first_name: userData.user.user_metadata?.firstName || '',
                  last_name: userData.user.user_metadata?.lastName || '',
                  company_token: invitation.company_token,
                  status: 'ACTIVE'
                });
                
                console.log('✅ Employee created after confirm');
              }
              
              // Aktualizácia pozvánky na ACCEPTED
              if (invitation) {
                console.log('Updating invitation status to ACCEPTED...');
                const { error: updateError } = await supabase
                  .from('invitations')
                  .update({ 
                    status: 'ACCEPTED',
                    accepted_at: new Date().toISOString()
                  })
                  .eq('email', cleanEmail)
                  .eq('company_token', invitation.company_token);
                  
                if (updateError) {
                  console.error('Error updating invitation:', updateError);
                } else {
                  console.log('Invitation updated successfully');
                }
              }
              
              // EmployeesView si načíta dáta sám pri mountnutí cez useEffect
            }

            window.location.hash = '';
            setTimeout(() => setIsEmailConfirming(false), 0);
            return;
          }
        }
      }

      // Vždy skontroluj reset password - aj s hash tokenmi
      if (path === '/reset-password') {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Spracuj tokeny a nastav session
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            // Nastav session s tokenmi
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            // Po krátkom čase presmeruj na settings
            setTimeout(() => {
              setCurrentView('settings');
              localStorage.setItem('settingsTab', 'security');
              if (window.location.pathname !== '/') {
                window.history.pushState({ view: 'settings' }, '', '/');
              }
            }, 500);

            return;
          }
        }
      }

      // Ak je to pozvánka na registráciu
      if (action === 'join' && companyToken) {
        setCurrentView('auth');
        setAuthMode('JOIN_COMPANY');
        // Ulož companyToken do localStorage pre použitie pri registrácii
        localStorage.setItem('inviteCompanyToken', companyToken);
        return;
      }

      let targetView = 'landing';

      // Kontrola na /marketplace/:id pattern
      const marketplaceMatch = path.match(/^\/marketplace\/(.+)$/);
      if (marketplaceMatch) {
        targetView = 'training_detail';
        setRouteParams({ trainingId: marketplaceMatch[1] });
      }
      // Kontrola na /zamestnanci/:id pattern
      else if (path.match(/^\/zamestnanci\/(.+)$/)) {
        const employeeMatch = path.match(/^\/zamestnanci\/(.+)$/);
        targetView = 'employee_detail';
        setRouteParams({ employeeId: employeeMatch?.[1] });
      }
      else {
        const viewMap: Record<string, string> = {
          // Public pages
          '/kontakt': 'contact',
          '/gdpr': 'gdpr',
          '/vop': 'vop',
          '/aml': 'aml',
          '/trainings-info': 'trainings_info',
          '/reset-password': 'reset_password',
          '/': 'landing',

          // Authenticated views
          '/admin/editor-skoleni': 'admin_trainings',
          '/admin/dopyty-nakup': 'admin_requests',
          '/admin/klienti': 'admin_companies',
          '/dashboard': 'company',
          '/marketplace': 'training_marketplace',
          '/zamestnanci': 'employees',
          '/skolenia': 'trainings',
          '/dokumenty': 'ip_management',
          '/certifikaty': 'certificates',
          '/portal': 'employee_portal',
          '/oboznamovanie': 'employee_documents',
          '/moje-dokumenty': 'documents',
          '/e-learning': 'employee',
          '/nastavenia': 'settings',
          '/profil': 'profile'
        };
        targetView = viewMap[path] || 'landing';
        setRouteParams({});
      }

      // Ak nie je prihlásený, môže vidieť verejné stránky
      if (!state.isAuthenticated) {
        setCurrentView(targetView);
        return;
      }

      // Ak je prihlásený, môže vidieť reset password aj iné verejné stránky
      if (['contact', 'gdpr', 'vop', 'aml', 'reset_password'].includes(targetView)) {
        setCurrentView(targetView);
        return;
      }

      // Ak je prihlásený, môže vidieť verejné stránky aj chránené podstránky
      if (['contact', 'gdpr', 'vop', 'aml'].includes(targetView)) {
        // Verejné stránky - vždy povoliť
        setCurrentView(targetView);
      } else if (targetView !== 'landing') {
        // Chránená podstránka (nie landing) - rešpektovať URL
        // PRI POPSTATE (tlačidlo späť): len nastavíme view bez modifikácie histórie
        // PRI BEŽNEJ NAVIGÁCII: použijeme navigate ktoré volá pushState
        if (isPopstate) {
          setViewWithoutHistory(targetView);
        } else {
          navigate(targetView);
        }
      } else {
        // Landing page alebo neznáma URL - fallback na dashboard podľa role
        // Pre prihlásených používateľov obnov posledný view z sessionStorage, alebo default nástenku
        const lastView = sessionStorage.getItem('lastView');
        let dashboardView = lastView;

        // Ak nie je uložený view alebo je to landing, použijeme default nástenku podľa role
        if (!lastView || lastView === 'landing' || lastView === 'auth') {
          switch (state.user?.role) {
            case 'super_admin': dashboardView = 'admin_trainings'; break;
            case 'company_admin': dashboardView = 'company'; break;
            case 'employee': dashboardView = 'employee_portal'; break;
            default: dashboardView = 'landing';
          }
        }

        if (isPopstate) {
          setViewWithoutHistory(dashboardView);
        } else {
          navigate(dashboardView);
        }
      }
    })();
  }, [state.isAuthenticated, state.user, navigate, setViewWithoutHistory]);

  useEffect(() => {
    const handlePopstate = () => handleRouteChange(true);
    window.addEventListener('popstate', handlePopstate);
    handleRouteChange(false); // inicializácia - nie je to popstate
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [handleRouteChange]);

  // Persist currentView do sessionStorage, aby sa zachoval pri prepnutí kariet
  useEffect(() => {
    if (state.isAuthenticated && currentView) {
      sessionStorage.setItem('lastView', currentView);
    }
  }, [currentView, state.isAuthenticated]);

  if (isEmailConfirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001a2e] via-[#002b4e] to-[#003d5c] flex items-center justify-center p-4 overflow-hidden relative font-sans">
        <div className="absolute inset-0 z-0"></div>
        
        <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in duration-700">
          <div className="bg-white/8 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-5xl">
                <RefreshCw className="animate-spin" size={40} />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">Potvrdzujem e-mail</h2>
              <p className="text-white/60">Čakajte prosím, overujeme váš účet...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    if (authMode) {
      return (
        <AuthView 
          initialMode={authMode as any} 
          onSuccess={(role) => {
            setAuthMode(null);
            // Presmeruj na nástenku podľa role a aktualizuj URL
            let dashboardView = 'landing';
            switch (role) {
              case 'SUPER_ADMIN': dashboardView = 'admin_trainings'; break;
              case 'COMPANY': dashboardView = 'company'; break;
              default: dashboardView = 'employee_portal'; break;
            }
            navigate(dashboardView);
          }} 
          onCancel={() => setAuthMode(null)} 
        />
      );
    }
    const handleLogin = () => {
    // Vymažeme invite token z localStorage
    localStorage.removeItem('inviteCompanyToken');
    localStorage.setItem('inviteCompanyToken', 'CLEARED');
    setAuthMode('LOGIN');
  };
    const handleRegister = () => setAuthMode('CHOICE');
    switch (currentView) {
      case 'contact': return <ContactView onBack={() => navigate('landing')} onNavigate={navigate} onAuth={handleLogin} onRegister={handleRegister} />;
      case 'gdpr': return <GDPRView onBack={() => navigate('landing')} onNavigate={navigate} onAuth={handleLogin} onRegister={handleRegister} />;
      case 'vop': return <VOPView onBack={() => navigate('landing')} onNavigate={navigate} onAuth={handleLogin} onRegister={handleRegister} />;
      case 'aml': return <AMLView onBack={() => navigate('landing')} onNavigate={navigate} onAuth={handleLogin} onRegister={handleRegister} />;
      case 'trainings_info': return <TrainingsInfoView onBack={() => navigate('landing')} onNavigate={navigate} onAuth={handleLogin} onRegister={handleRegister} />;
      case 'reset_password': return <ResetPasswordView />;
      default: return <LandingPage onAuth={handleLogin} onRegister={handleRegister} onNavigate={navigate} />;
    }
  }

  const renderView = () => {
    switch (currentView) {
      case 'admin': return <AdminPanel />;
      case 'admin_trainings': return <SuperAdminTools initialView="admin_trainings" />;
      case 'admin_requests': return <SuperAdminTools initialView="admin_requests" />;
      case 'admin_companies': return <SuperAdminTools initialView="admin_companies" />;
      case 'company': return <CompanyPortal onViewChange={navigate} />;
      case 'training_marketplace': return <TrainingMarketplace onNavigate={navigate} />;
      case 'training_detail': return <TrainingMarketplace onNavigate={navigate} trainingId={routeParams.trainingId} onBack={() => navigate('training_marketplace')} />;
      case 'employees': return <EmployeesView onNavigate={navigate} />;
      case 'employee_detail': return <EmployeesView onNavigate={navigate} employeeId={routeParams.employeeId} onBack={() => navigate('employees')} />;
      case 'trainings': return <CompanyTrainingsView />;
      case 'ip_management': return <IPManagementView />;
      case 'certificates': return <CertificatesView onViewChange={navigate} />;
      case 'employee': return <EmployeeTrainingView />;
      case 'employee_portal': return <EmployeePortalView />;
      case 'employee_documents': return <EmployeeDocumentView employee={state.user} onBack={() => navigate('employee_portal')} />;
      case 'documents': return <DocumentsView />;
      case 'certificate_history': return <CertificateHistoryView />;
      case 'settings':
      case 'profile': return <SettingsView />;
      case 'contact': return <ContactView onBack={() => navigate('landing')} onNavigate={navigate} onAuth={() => {}} onRegister={() => {}} />;
      case 'gdpr': return <GDPRView onBack={() => navigate('landing')} onNavigate={navigate} onAuth={() => {}} onRegister={() => {}} />;
      case 'vop': return <VOPView onBack={() => navigate('landing')} onNavigate={navigate} onAuth={() => {}} onRegister={() => {}} />;
      case 'aml': return <AMLView onBack={() => navigate('landing')} onNavigate={navigate} onAuth={() => {}} onRegister={() => {}} />;
      case 'trainings_info': return <TrainingsInfoView onBack={() => navigate('landing')} onNavigate={navigate} onAuth={() => {}} onRegister={() => {}} />;
      default: return (
        <div className="p-20 text-center space-y-4">
          <div className="text-6xl">🚧</div>
          <h2 className="text-2xl font-bold text-slate-400">Sekcia sa pripravuje...</h2>
          <p className="text-slate-300 uppercase text-[10px] font-black tracking-widest">View ID: {currentView}</p>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar 
        user={state.user} 
        currentView={currentView} 
        onViewChange={navigate} 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={() => { logout(); navigate('landing'); setAuthMode(null); }}
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
      />
      <main className={`flex-1 transition-all duration-500 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} p-8 lg:p-10 overflow-y-auto`}>
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
      
      {/* POTVRDZOVACÍ MODAL PRE ODHLÁSENIE - V HLAVNOM KOMPONENTE */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto">
                <LogOut size={32} className="text-brand-orange" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-900">Naozaj sa chcete odhlásiť?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Po odhlásení budete presmerovaný na úvodnú stránku.
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 hover:text-slate-700 transition-all font-medium"
                >
                  Zrušiť
                </button>
                <button
                  onClick={handleLogoutClick}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-3 rounded-lg bg-brand-orange text-white font-medium hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Odhlasujem...</span>
                    </>
                  ) : (
                    <span>Odhlásiť sa</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<{
  user: any;
  currentView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
}> = ({ user, currentView, onViewChange, collapsed, onToggle, onLogout, showLogoutModal, setShowLogoutModal }) => {
  const [empProfile, setEmpProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Načítame profil z databázy pre aktuálne meno
  useEffect(() => {
    if (user?.id) {
      setProfileLoading(true);
      supabase
        .from('employees')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setEmpProfile(data);
          setProfileLoading(false);
        });
    }
  }, [user?.id]);
  const menu = {
    super_admin: [
      { id: 'admin_trainings', label: 'Editor školení', icon: <Edit3 size={18} /> },
      { id: 'admin_requests', label: 'Dopyty na nákup', icon: <CreditCard size={18} /> },
      { id: 'admin_companies', label: 'Zoznam klientov', icon: <Building2 size={18} /> },
      { id: 'settings', label: 'Systém', icon: <Settings size={18} /> },
    ],
    company_admin: [
      { id: 'company', label: 'Nástenka', icon: <LayoutDashboard size={18} /> },
      { id: 'training_marketplace', label: 'Marketplace', icon: <ShoppingBag size={18} /> },
      { id: 'employees', label: 'Správa zamestnancov', icon: <Users size={18} /> },
      { id: 'trainings', label: 'Moje Školenia', icon: <BookOpen size={18} /> },
      { id: 'ip_management', label: 'Dokumenty', icon: <FileText size={18} /> },
      { id: 'certificates', label: 'Certifikáty', icon: <Trophy size={18} /> },
      { id: 'settings', label: 'Nastavenia', icon: <Settings size={18} /> },
    ],
    employee: [
      { id: 'employee_portal', label: 'Nástenka', icon: <LayoutDashboard size={18} /> },
      { id: 'employee_documents', label: 'Oboznamovanie', icon: <BookOpen size={18} /> },
      { id: 'documents', label: 'Dokumenty', icon: <FileText size={18} /> },
      { id: 'employee', label: 'E-learning', icon: <GraduationCap size={18} /> },
      { id: 'certificate_history', label: 'História', icon: <History size={18} /> },
      { id: 'profile', label: 'Môj Profil', icon: <Settings size={18} /> },
    ]
  };

  const items = menu[user?.role as keyof typeof menu] || [];

  return (
    <aside className={`fixed inset-y-0 left-0 bg-white/90 backdrop-blur-2xl border-r border-slate-200 transition-all duration-500 ease-in-out z-50 flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.02)] ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex flex-col items-center transition-all duration-500 pt-6 ${collapsed ? 'pb-1' : 'pb-1'}`}>
        {!collapsed && (
          <div 
            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-all mb-4 px-6"
            onClick={() => {
              if (user.role === 'super_admin') onViewChange('admin_trainings');
              else if (user.role === 'company_admin') onViewChange('company');
              else onViewChange('employee_portal');
            }}
          >
            <img src={LOGO_BLUE} alt="Lord's Benison" className="h-12 w-auto object-contain transition-all duration-500" />
          </div>
        )}
        {!collapsed && <div className="w-full px-6 mb-2"><div className="h-px bg-slate-200 w-full opacity-60"></div></div>}
      </div>

      <button onClick={onToggle} className="absolute bottom-32 -right-3.5 z-[60] flex items-center justify-center w-7 h-7 bg-white hover:bg-slate-50 rounded-full text-slate-400 hover:text-brand-orange transition-all shadow-md border border-slate-100 group">
        {collapsed ? <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />}
      </button>

      <nav className={`flex-1 mt-0 space-y-0.5 ${collapsed ? 'overflow-visible' : 'overflow-y-auto no-scrollbar'} px-4`}>
        {items.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full relative flex items-center rounded-xl transition-all duration-300 group ${collapsed ? 'justify-center p-3' : 'px-4 py-2.5'} ${isActive ? 'bg-slate-50/50' : 'hover:bg-slate-50/80'}`}
            >
              <div className={`flex items-center ${collapsed ? '' : 'gap-4'}`}>
                <span className={`transition-all duration-300 ${isActive ? 'text-brand-orange scale-110' : 'text-slate-400 group-hover:text-brand-orange group-hover:scale-110'}`}>{item.icon}</span> 
                {!collapsed ? <span className={`text-[13px] tracking-tight whitespace-nowrap transition-colors duration-300 ${isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-500 group-hover:text-slate-700'}`}>{item.label}</span> : (
                  <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap z-[100] shadow-xl">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                  </div>
                )}
              </div>
              {!collapsed && <div className={`absolute bottom-0 left-4 right-4 h-0.5 bg-[#00427a] rounded-full transition-all duration-500 ease-out origin-center ${isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`} />}
            </button>
          );
        })}
      </nav>

      <div className={`mt-auto transition-all duration-500 p-4`}>
        <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-500 ${collapsed ? 'p-3' : 'p-4'}`}>
          {!collapsed ? (
            <div className="space-y-3">
              <div className="min-w-0">
                {profileLoading ? (
                  <div className="h-5 bg-white rounded"></div>
                ) : (
                  <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{empProfile?.full_name || `${user?.firstName || 'Užívateľ'} ${user?.lastName || ''}`}</p>
                )}
                <p className="text-xs text-slate-500 truncate mt-1">{user?.email}</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 text-slate-500 font-medium text-xs hover:text-brand-orange transition-all group w-full">
                  <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  <span>Odhlásiť sa</span>
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowLogoutModal(true)} title="Odhlásiť sa" className="w-10 h-10 mx-auto flex items-center justify-center text-slate-400 hover:text-brand-orange transition-all"><LogOut size={18} /></button>
          )}
        </div>
      </div>
    </aside>
  );
};

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <AuthProvider>
      <ToastProvider>
        <TrainingProvider>
          <DataLoader>
            <App />
          </DataLoader>
        </TrainingProvider>
      </ToastProvider>
    </AuthProvider>
  );
}