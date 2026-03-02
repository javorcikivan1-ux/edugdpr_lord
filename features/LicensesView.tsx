
import React from 'react';
import { License } from './types';

const MOCK_LICENSES: License[] = [
  { id: 'l1', name: 'GDPR Školenie 2025', total: 50, used: 12, status: 'ok' },
  { id: 'l2', name: 'Ochrana spotrebiteľa 108', total: 20, used: 18, status: 'low' },
  { id: 'l3', name: 'Kybernetická bezpečnosť', total: 10, used: 10, status: 'zero' },
];

export const LicensesView = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
       <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-pristine-navy">Aktívne licencie a školenia</h3>
          <button className="bg-pristine-bg px-6 py-2 rounded-xl text-xs font-black text-pristine-blue uppercase tracking-widest border border-slate-100">+ Dokúpiť licencie</button>
       </div>
       <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <th className="px-10 py-6">Názov kurzu</th>
              <th className="px-10 py-6 text-center">Využitie</th>
              <th className="px-10 py-6">Semafor</th>
              <th className="px-10 py-6 text-right">Akcie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
             {MOCK_LICENSES.map(lic => (
               <tr key={lic.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="font-bold text-pristine-navy">{lic.name}</div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">E-learning modul</div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="text-sm font-bold text-slate-500">{lic.used} / {lic.total}</span>
                    <div className="w-32 h-1 bg-slate-100 rounded-full mx-auto mt-2 overflow-hidden">
                      <div className={`h-full ${lic.status === 'ok' ? 'bg-emerald-500' : lic.status === 'low' ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${(lic.used/lic.total)*100}%` }}></div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-3 h-3 rounded-full ${lic.status === 'ok' ? 'bg-emerald-500' : lic.status === 'low' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${lic.status === 'ok' ? 'text-emerald-600' : lic.status === 'low' ? 'text-amber-600' : 'text-rose-600'}`}>
                         {lic.status === 'ok' ? 'Dostatok' : lic.status === 'low' ? 'Kriticky málo' : 'Vyčerpané'}
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="text-pristine-blue text-xs font-black uppercase tracking-widest hover:underline">Zobraziť logy</button>
                  </td>
               </tr>
             ))}
          </tbody>
       </table>
    </div>
  </div>
);
