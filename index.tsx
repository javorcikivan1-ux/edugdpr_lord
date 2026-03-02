import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './features/AuthService';
import { AuthView } from './features/AuthView';
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
import { EmployeeTrainingView } from './features/EmployeeTrainingView';
import { EmployeePortalView } from './features/EmployeePortalView';
import { EmployeesView } from './features/EmployeesView';
import { SettingsView } from './features/SettingsView';
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
  Building2
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

  const navigate = useCallback((view: string, path: string) => {
    setCurrentView(view);
    setAuthMode(null);
    if (window.location.pathname !== path) {
      window.history.pushState({ view }, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      const companyToken = urlParams.get('companyToken');
      
      // Ak je to pozvánka na registráciu
      if (action === 'join' && companyToken) {
        setCurrentView('auth');
        setAuthMode('register');
        // Ulož companyToken do localStorage pre použitie pri registrácii
        localStorage.setItem('inviteCompanyToken', companyToken);
        return;
      }
      
      const viewMap: Record<string, string> = {
        '/kontakt': 'contact',
        '/gdpr': 'gdpr',
        '/vop': 'vop',
        '/aml': 'aml',
        '/skolenia': 'trainings_info',
        '/reset-password': 'reset_password',
        '/': 'landing'
      };
      const targetView = viewMap[path] || 'landing';
      
      // Ak nie je prihlásený, môže vidieť verejné stránky
      if (!state.isAuthenticated) {
        setCurrentView(targetView);
        return;
      }
      
      // Ak je prihlásený, môže vidieť len kontakt, gdpr, vop, aml, inak presmeruj na nástenku
      if (['contact', 'gdpr', 'vop', 'aml'].includes(targetView)) {
        setCurrentView(targetView);
      } else {
        // Pre prihlásených používateľov presmeruj na ich nástenku a aktualizuj URL
        let dashboardView = 'landing';
        switch (state.user?.role) {
          case 'super_admin': dashboardView = 'admin_trainings'; break;
          case 'company_admin': dashboardView = 'company'; break;
          case 'employee': dashboardView = 'employee_portal'; break;
        }
        setCurrentView(dashboardView);
        // Aktualizuj URL na hlavnú stránku
        if (window.location.pathname !== '/') {
          window.history.pushState({ view: dashboardView }, '', '/');
        }
      }
    };
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []); // Odstránené dependencies - spustí sa len raz

  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      if (currentView === 'landing') {
        switch (state.user.role) {
          case 'super_admin': setCurrentView('admin_trainings'); break;
          case 'company_admin': setCurrentView('company'); break;
          case 'employee': setCurrentView('employee_portal'); break;
        }
      }
    }
  }, [state.isAuthenticated, state.user]); // Odstránené currentView z dependencies

  if (state.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-blue rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Autorizácia systému...</p>
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
            setCurrentView(dashboardView);
            if (window.location.pathname !== '/') {
              window.history.pushState({ view: dashboardView }, '', '/');
            }
          }} 
          onCancel={() => setAuthMode(null)} 
        />
      );
    }
    const handleLogin = () => setAuthMode('LOGIN');
    const handleRegister = () => setAuthMode('CHOICE');
    switch (currentView) {
      case 'contact': return <ContactView onBack={() => navigate('landing', '/')} onNavigate={navigate} onAuth={handleLogin} onRegister={handleRegister} />;
      case 'gdpr': return <GDPRView onBack={() => navigate('landing', '/')} onNavigate={navigate} onAuth={handleLogin} onRegister={handleRegister} />;
      case 'vop': return <VOPView onBack={() => navigate('landing', '/')} onNavigate={navigate} onAuth={handleLogin} onRegister={handleRegister} />;
      case 'aml': return <AMLView onBack={() => navigate('landing', '/')} onNavigate={navigate} onAuth={handleLogin} onRegister={handleRegister} />;
      case 'trainings_info': return <TrainingsInfoView onBack={() => navigate('landing', '/')} onNavigate={navigate} onAuth={handleLogin} onRegister={handleRegister} />;
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
      case 'company': return <CompanyPortal onViewChange={setCurrentView} />;
      case 'training_marketplace': return <TrainingMarketplace />;
      case 'employees': return <EmployeesView />;
      case 'trainings': return <CompanyTrainingsView />;
      case 'ip_management': return <IPManagementView />;
      case 'certificates': return <CertificatesView />;
      case 'employee': return <EmployeeTrainingView />;
      case 'employee_portal': return <EmployeePortalView />;
      case 'settings':
      case 'profile': return <SettingsView />;
      case 'contact': return <ContactView onBack={() => navigate('landing', '/')} onNavigate={navigate} onAuth={() => {}} onRegister={() => {}} />;
      case 'gdpr': return <GDPRView onBack={() => navigate('landing', '/')} onNavigate={navigate} onAuth={() => {}} onRegister={() => {}} />;
      case 'vop': return <VOPView onBack={() => navigate('landing', '/')} onNavigate={navigate} onAuth={() => {}} onRegister={() => {}} />;
      case 'aml': return <AMLView onBack={() => navigate('landing', '/')} onNavigate={navigate} onAuth={() => {}} onRegister={() => {}} />;
      case 'trainings_info': return <TrainingsInfoView onBack={() => navigate('landing', '/')} onNavigate={navigate} onAuth={() => {}} onRegister={() => {}} />;
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
        onViewChange={setCurrentView} 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={() => { logout(); navigate('landing', '/'); setAuthMode(null); }} 
      />
      <main className={`flex-1 transition-all duration-500 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} p-8 lg:p-10 overflow-y-auto`}>
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
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
}> = ({ user, currentView, onViewChange, collapsed, onToggle, onLogout }) => {
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
      { id: 'ip_management', label: 'Informačné povinnosti', icon: <FileText size={18} /> },
      { id: 'certificates', label: 'Certifikáty', icon: <Trophy size={18} /> },
      { id: 'settings', label: 'Nastavenia', icon: <Settings size={18} /> },
    ],
    employee: [
      { id: 'employee_portal', label: 'Nástenka', icon: <LayoutDashboard size={18} /> },
      { id: 'employee', label: 'E-learning', icon: <GraduationCap size={18} /> },
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
                <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{user?.firstName || 'Užívateľ'} {user?.lastName || ''}</p>
                <p className="text-xs text-slate-500 truncate mt-1">{user?.email}</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 font-medium text-xs hover:text-brand-orange transition-all group w-full">
                  <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  <span>Odhlásiť sa</span>
                </button>
              </div>
            </div>
          ) : (
            <button onClick={onLogout} title="Odhlásiť sa" className="w-10 h-10 mx-auto flex items-center justify-center text-slate-400 hover:text-brand-orange transition-all"><LogOut size={18} /></button>
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