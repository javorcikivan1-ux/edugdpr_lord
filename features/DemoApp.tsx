import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Trophy,
  Settings,
  GraduationCap,
  History,
  Building2,
  User as UserIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { DemoRole, setDemoRole } from '../lib/demoMode';

type DemoViewId =
  | 'company_dashboard'
  | 'company_employees'
  | 'company_documents'
  | 'company_certificates'
  | 'company_settings'
  | 'employee_dashboard'
  | 'employee_documents'
  | 'employee_training'
  | 'employee_history'
  | 'employee_profile';

export const DemoApp: React.FC<{
  role: DemoRole;
  onExit: () => void;
}> = ({ role, onExit }) => {
  const defaultView: DemoViewId = role === 'company_admin' ? 'company_dashboard' : 'employee_dashboard';
  const [view, setView] = useState<DemoViewId>(defaultView);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Ak sa zmení role (prepínač), uistíme sa, že sme na správnom type obrazovky
    setView((prev) => {
      const isCompanyView = prev.startsWith('company_');
      const shouldBeCompany = role === 'company_admin';
      if (isCompanyView === shouldBeCompany) return prev;
      return shouldBeCompany ? 'company_dashboard' : 'employee_dashboard';
    });
  }, [role]);

  const menu = useMemo(() => {
    if (role === 'company_admin') {
      return [
        { id: 'company_dashboard' as const, label: 'Nástenka', icon: <LayoutDashboard size={18} /> },
        { id: 'company_employees' as const, label: 'Správa zamestnancov', icon: <Users size={18} /> },
        { id: 'company_documents' as const, label: 'Dokumenty', icon: <FileText size={18} /> },
        { id: 'company_certificates' as const, label: 'Certifikáty', icon: <Trophy size={18} /> },
        { id: 'company_settings' as const, label: 'Nastavenia', icon: <Settings size={18} /> }
      ];
    }
    return [
      { id: 'employee_dashboard' as const, label: 'Nástenka', icon: <LayoutDashboard size={18} /> },
      { id: 'employee_documents' as const, label: 'Dokumenty', icon: <BookOpen size={18} /> },
      { id: 'employee_training' as const, label: 'E-learning', icon: <GraduationCap size={18} /> },
      { id: 'employee_history' as const, label: 'História', icon: <History size={18} /> },
      { id: 'employee_profile' as const, label: 'Môj Profil', icon: <Settings size={18} /> }
    ];
  }, [role]);

  const switchRole = (nextRole: DemoRole) => {
    setDemoRole(nextRole);
    setView(nextRole === 'company_admin' ? 'company_dashboard' : 'employee_dashboard');
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <aside
        className={`fixed inset-y-0 left-0 bg-white/90 backdrop-blur-2xl border-r border-slate-200 transition-all duration-500 ease-in-out z-50 flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.02)] ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`flex flex-col items-center transition-all duration-500 pt-6 pb-4 ${collapsed ? 'px-2' : 'px-6'}`}>
          {!collapsed ? (
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 flex items-center justify-center border border-brand-orange/20">
                    <ShieldCheck size={18} className="text-brand-orange" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[11px] font-black tracking-widest text-brand-orange uppercase">DEMO</div>
                    <div className="text-sm font-black text-slate-900">{role === 'company_admin' ? 'Firma' : 'Zamestnanec'}</div>
                  </div>
                </div>
                <button
                  onClick={onExit}
                  className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-brand-orange transition-colors"
                  title="Ukončiť demo"
                  aria-label="Ukončiť demo"
                >
                  <LogOut size={18} />
                </button>
              </div>

              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-1 flex gap-1">
                <button
                  onClick={() => switchRole('company_admin')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    role === 'company_admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Prepnuť na firmu"
                >
                  <Building2 size={14} />
                  Firma
                </button>
                <button
                  onClick={() => switchRole('employee')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    role === 'employee' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Prepnuť na zamestnanca"
                >
                  <UserIcon size={14} />
                  Zam.
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 flex items-center justify-center border border-brand-orange/20">
                <ShieldCheck size={18} className="text-brand-orange" />
              </div>
              <button onClick={onExit} title="Ukončiť demo" className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-500 hover:text-brand-orange transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-32 -right-3.5 z-[60] flex items-center justify-center w-7 h-7 bg-white hover:bg-slate-50 rounded-full text-slate-400 hover:text-brand-orange transition-all shadow-md border border-slate-100 group"
          title={collapsed ? 'Rozbaliť' : 'Zbaliť'}
          aria-label={collapsed ? 'Rozbaliť menu' : 'Zbaliť menu'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <nav className={`flex-1 mt-0 space-y-0.5 ${collapsed ? 'overflow-visible' : 'overflow-y-auto no-scrollbar'} px-4`}>
          {menu.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full relative flex items-center rounded-xl transition-all duration-300 group ${
                  collapsed ? 'justify-center p-3' : 'px-4 py-2.5'
                } ${isActive ? 'bg-slate-50/50' : 'hover:bg-slate-50/80'}`}
              >
                <div className={`flex items-center ${collapsed ? '' : 'gap-4'}`}>
                  <span className={`transition-all duration-300 ${isActive ? 'text-brand-orange scale-110' : 'text-slate-400 group-hover:text-brand-orange group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  {!collapsed ? (
                    <span className={`text-[13px] tracking-tight whitespace-nowrap transition-colors duration-300 ${isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-500 group-hover:text-slate-700'}`}>
                      {item.label}
                    </span>
                  ) : (
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
      </aside>

      <main className={`flex-1 transition-all duration-500 ${collapsed ? 'ml-20' : 'ml-64'} p-8 lg:p-10 overflow-y-auto`}>
        <div className="max-w-7xl mx-auto">
          <DemoContent role={role} view={view} />
        </div>
      </main>
    </div>
  );
};

const DemoContent: React.FC<{ role: DemoRole; view: DemoViewId }> = ({ role, view }) => {
  const title = useMemo(() => {
    const t: Record<DemoViewId, string> = {
      company_dashboard: 'Nástenka (demo)',
      company_employees: 'Správa zamestnancov (demo)',
      company_documents: 'Dokumenty (demo)',
      company_certificates: 'Certifikáty (demo)',
      company_settings: 'Nastavenia (demo)',
      employee_dashboard: 'Nástenka (demo)',
      employee_documents: 'Dokumenty (demo)',
      employee_training: 'E-learning (demo)',
      employee_history: 'História (demo)',
      employee_profile: 'Môj profil (demo)'
    };
    return t[view];
  }, [view]);

  const badge = role === 'company_admin' ? 'DEMO FIRMA' : 'DEMO ZAMESTNANEC';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] font-black uppercase tracking-widest">
            {badge}
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Toto je demo rozhranie s ukážkovými dátami. Akcie ako pozvánky, uploady alebo odosielanie e-mailov sú v deme vypnuté.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Zamestnanci" value="12" />
        <StatCard label="Dokumenty" value="15" />
        <StatCard label="Školenia" value="3" />
        <StatCard label="Certifikáty" value="28" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Ukážka obsahu</h2>
          <div className="mt-4 space-y-3">
            {[
              'GDPR - Kamerový systém',
              'Manipulácia s osobnými údajmi',
              'Základy GDPR'
            ].map((x) => (
              <div key={x} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="text-sm font-semibold text-slate-800">{x}</div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">Demo</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Poznámka</h2>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            Prepínač <span className="font-bold">Firma / Zamestnanec</span> mení iba demo pohľad. V produkcii sa roly riadia podľa reálneho účtu a práv.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold">
            Tip: demo je ideálne na rýchlu prezentáciu klientovi bez registrácie.
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5">
    <div className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</div>
    <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
  </div>
);
