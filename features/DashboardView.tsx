
import React, { useState, useMemo, useEffect } from 'react';
import { Employee } from '../types';
import { getEmployees } from '../lib/supabase';

export const EmployeesView = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [activeKebab, setActiveKebab] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await getEmployees();
      if (!error && data) {
        // Transformácia supabase dát na náš Employee typ
        const transformed: Employee[] = data.map((d: any) => ({
          id: d.id,
          name: d.full_name || 'Nepomenovaný',
          email: d.email,
          status: d.status || 'ACTIVE',
          joined: new Date(d.created_at).toLocaleDateString(),
          role: d.role || 'EMPLOYEE',
          courses: d.courses || [],
          documents: []
        }));
        setEmployees(transformed);
      }
      setLoading(false);
    };

    fetchEmployees();
  }, []);

  const filtered = useMemo(() => 
    employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())),
    [employees, search]
  );

  const toggleStatus = (id: string) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, status: e.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : e));
    setActiveKebab(null);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-8 w-8 border-4 border-pristine-blue border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Správa tímu</p>
          <h3 className="text-3xl font-bold text-pristine-navy">Zoznam zamestnancov</h3>
        </div>
        <button 
          onClick={() => setShowInvite(true)}
          className="bg-pristine-blue text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:bg-pristine-navy transition-all"
        >
          + Pozvať zamestnanca
        </button>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowInvite(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl border border-slate-100 space-y-8">
            <div className="text-center space-y-3">
              <div className="text-4xl">🎫</div>
              <h4 className="text-2xl font-bold text-pristine-navy">Pozývací token</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Zdieľajte tento unikátny token so zamestnancami. Pri registrácii ho zadajú a automaticky sa priradia k vašej firme.</p>
            </div>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center group cursor-pointer hover:border-pristine-blue transition-all">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Aktuálny kód vašej firmy</p>
              <p className="text-4xl font-mono font-black text-pristine-blue tracking-widest">LB-ACTIVE-FIRM</p>
            </div>
            <button 
              onClick={() => setShowInvite(false)}
              className="w-full py-5 bg-pristine-navy text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pristine-blue transition-all"
            >
              Hotovo
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Hľadať podľa mena alebo e-mailu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-pristine-blue/10 outline-none"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Spolu {filtered.length} zamestnancov</p>
        </div>
        
        {filtered.length === 0 ? (
          <div className="p-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            Žiadni zamestnanci neboli nájdení
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-10 py-6">Meno / E-mail</th>
                <th className="px-10 py-6">Rola</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Školenia</th>
                <th className="px-10 py-6 text-right">Akcie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors relative">
                  <td className="px-10 py-6">
                     <div className="font-bold text-pristine-navy">{emp.name}</div>
                     <div className="text-xs text-slate-400 font-medium mt-0.5">{emp.email}</div>
                  </td>
                  <td className="px-10 py-6">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${emp.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-400'}`}>
                       {emp.role}
                     </span>
                  </td>
                  <td className="px-10 py-6">
                     <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${emp.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                         {emp.status === 'ACTIVE' ? 'Aktívny' : 'Neaktívny'}
                       </span>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="flex gap-1.5 flex-wrap">
                       {emp.courses.map(c => <span key={c} className="bg-blue-50 text-pristine-blue px-2.5 py-1 rounded-lg text-[9px] font-bold border border-blue-100">{c}</span>)}
                       {emp.courses.length === 0 && <span className="text-[10px] text-slate-300 italic">Bez školení</span>}
                     </div>
                  </td>
                  <td className="px-10 py-6 text-right relative">
                     <button 
                       onClick={() => setActiveKebab(activeKebab === emp.id ? null : emp.id)}
                       className="w-10 h-10 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-400 font-black text-xl leading-none transition-all"
                     >⋮</button>
                     
                     {activeKebab === emp.id && (
                       <div className="absolute right-10 top-20 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-[100] animate-in fade-in zoom-in duration-200">
                          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-pristine-navy">Upraviť údaje</button>
                          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-pristine-navy">Priradiť školenia</button>
                          <div className="h-px bg-slate-50 my-2"></div>
                          <button 
                            onClick={() => toggleStatus(emp.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl hover:bg-rose-50 text-xs font-bold ${emp.status === 'ACTIVE' ? 'text-rose-500' : 'text-emerald-500'}`}
                          >
                            {emp.status === 'ACTIVE' ? 'Deaktivovať' : 'Aktivovať'}
                          </button>
                       </div>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
