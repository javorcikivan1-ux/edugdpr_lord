
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  BarChart3, 
  Settings, 
  Plus, 
  Clock, 
  Euro, 
  Trophy, 
  Users, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  Edit3,
  Search,
  Zap,
  Globe
} from 'lucide-react';

interface Training {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AdminPanel = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [activeTab, setActiveTab] = useState<'trainings' | 'analytics' | 'settings'>('trainings');

  useEffect(() => {
    const mockTrainings: Training[] = [
      {
        id: '1',
        title: 'Základy GDPR pre zamestnávateľov',
        description: 'Komplexný kurz pokrývajúci všetky základné aspekty GDPR pre firmy a organizácie.',
        duration: 120,
        price: 99,
        category: 'GDPR',
        difficulty: 'beginner',
        modules: [{}, {}],
        isActive: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Smernica o ochrane spotrebiteľa 108/2024',
        description: 'Vysvetlenie nových povinností vyplývajúcich z najnovšej legislatívy.',
        duration: 90,
        price: 79,
        category: 'LEGISLATÍVA',
        difficulty: 'intermediate',
        modules: [{}],
        isActive: true,
        createdAt: '2024-02-10',
        updatedAt: '2024-02-12'
      }
    ];
    setTrainings(mockTrainings);
  }, []);

  // Fix: Added handleCreateNew function to handle the click event from the create button
  const handleCreateNew = () => {
    console.log('Redirecting to Training Editor...');
    // In a real scenario, this would trigger a view change or open the editor modal
    // For this prototype, we log the action or could trigger an event
  };

  const stats = [
    { label: 'Celkové tržby', value: '€12,450', change: '+12.5%', icon: <Euro size={20} />, color: 'blue' },
    { label: 'Aktívne školenia', value: '8', change: '+2', icon: <BookOpen size={20} />, color: 'orange' },
    { label: 'Používatelia', value: '234', change: '+18.2%', icon: <Users size={20} />, color: 'emerald' },
    { label: 'Dokončené kurzy', value: '1,234', change: '+25%', icon: <Trophy size={20} />, color: 'amber' }
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-orange font-black text-[10px] uppercase tracking-[0.3em] mb-2">
            <ShieldCheck size={14} /> System Authority
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Super Admin Panel</h1>
          <p className="text-slate-500 font-medium">Globálny prehľad a správa vzdelávacieho ekosystému Lord's Benison.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={() => handleCreateNew()}
            className="flex items-center gap-3 bg-brand-blue text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-800 hover:scale-[1.02] transition-all active:scale-95"
          >
            <Plus size={18} /> Vytvoriť školenie
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${
                stat.color === 'blue' ? 'bg-blue-50 text-brand-blue' : 
                stat.color === 'orange' ? 'bg-orange-50 text-brand-orange' : 
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                'bg-amber-50 text-brand-gold'
              }`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black bg-emerald-50 px-3 py-1.5 rounded-full">
                <TrendingUp size={12} /> {stat.change}
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex w-fit">
            {[
              { id: 'trainings', label: 'Kurzy', icon: <BookOpen size={16} /> },
              { id: 'analytics', label: 'Analytika', icon: <BarChart3 size={16} /> },
              { id: 'settings', label: 'Systém', icon: <Settings size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Rýchle hľadanie..." 
              className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all"
            />
          </div>
        </div>

        {activeTab === 'trainings' && (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-10 py-6">Vzdelávací produkt</th>
                  <th className="px-10 py-6">Kategorizácia</th>
                  <th className="px-10 py-6">Financie & Čas</th>
                  <th className="px-10 py-6 text-center">Status systému</th>
                  <th className="px-10 py-6 text-right">Správa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {trainings.map(training => (
                  <tr key={training.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white shadow-xl shadow-slate-100 rounded-2xl flex items-center justify-center text-2xl transform group-hover:rotate-6 transition-transform">
                          {training.category === 'GDPR' ? '🛡️' : '⚖️'}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">{training.title}</div>
                          <div className="text-[10px] text-slate-400 font-medium mt-1 truncate">{training.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="bg-blue-50 text-brand-blue px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
                        {training.category}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                          <Euro size={12} className="text-brand-orange" /> €{training.price}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                          <Clock size={12} /> {training.duration} min
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="inline-flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${training.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${training.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {training.isActive ? 'Publikované' : 'Koncept'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:shadow-lg transition-all active:scale-95 mx-auto lg:ml-auto lg:mr-0">
                        <Edit3 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab !== 'trainings' && (
           <div className="py-32 text-center space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-4xl grayscale opacity-30">⚡</div>
              <div className="space-y-2">
                 <h4 className="text-xl font-bold text-slate-900">Modul vo vývoji</h4>
                 <p className="text-slate-400 text-sm max-w-sm mx-auto">Pracujeme na pokročilej analytike a systémových prepojeniach pre túto sekciu.</p>
              </div>
           </div>
        )}
      </div>
      
      {/* Footer Info Widget */}
      <div className="grid lg:grid-cols-2 gap-8">
         <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-orange/10 blur-3xl"></div>
            <div className="relative z-10 space-y-6">
               <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                 <Zap className="text-brand-orange" /> Globálna Sila Systému
               </h3>
               <p className="text-white/40 text-sm leading-relaxed font-medium">
                 Lord's Benison v súčasnosti spravuje cez 5,000 aktívnych licencií a monitoruje compliance pre stovky slovenských a českých firiem v reálnom čase.
               </p>
               <div className="flex gap-4">
                  <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Dostupnosť</p>
                     <p className="text-xl font-black">99.9%</p>
                  </div>
                  <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Uptime</p>
                     <p className="text-xl font-black">365 dní</p>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="bg-brand-blue rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mb-16 -mr-16 blur-2xl"></div>
            <div className="relative z-10 space-y-6">
               <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                 <Globe className="text-brand-orange" /> Sieť a Podpora
               </h3>
               <p className="text-white/80 text-sm leading-relaxed font-medium italic border-l-2 border-brand-orange/50 pl-6">
                 "Naším cieľom je stať sa lídrom v digitálnom compliance na slovenskom trhu cez automatizáciu a špičkové UX."
               </p>
               <button className="bg-white text-brand-blue px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-orange hover:text-white transition-all">Servisný Report</button>
            </div>
         </div>
      </div>
    </div>
  );
};
