
import React from 'react';

export const DashboardHomeView = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Compliance Score', 
            val: '94.2%', 
            color: 'text-corporate-blue',
            bgColor: 'bg-corporate-blue/10',
            progress: 94.2
          },
          { 
            label: 'Aktívni zamestnanci', 
            val: '24', 
            color: 'text-neutral-900',
            bgColor: 'bg-gray-100'
          },
          { 
            label: 'Voľné licencie', 
            val: '68', 
            color: 'text-corporate-success',
            bgColor: 'bg-corporate-success/10'
          },
          { 
            label: 'Na podpis', 
            val: '12', 
            color: 'text-corporate-warning',
            bgColor: 'bg-corporate-warning/10'
          },
        ].map((stat, i) => (
          <div key={i} className="corporate-card rounded-xl p-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{stat.label}</p>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.val}</div>
              {stat.progress && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-corporate-blue h-2 rounded-full transition-all duration-1000" style={{ width: `${stat.progress}%` }}></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="corporate-card rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">Nedávne aktivity</h3>
            <button className="text-corporate-blue hover:text-corporate-darkblue transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {[
              { 
                name: 'Milan Svitana', 
                act: 'podpísal IP: Ochrana osobných údajov', 
                time: 'pred 15 min',
                avatar: 'MS',
                avatarColor: 'bg-corporate-blue'
              },
              { 
                name: 'Jana Kováčová', 
                act: 'dokončila školenie BOZP', 
                time: 'pred 2 hod',
                avatar: 'JK',
                avatarColor: 'bg-corporate-success'
              },
              { 
                name: 'Systém', 
                act: 'aktualizácia legislatívy 108/2024', 
                time: 'včera',
                avatar: 'SY',
                avatarColor: 'bg-neutral-600'
              },
            ].map((log, i) => (
              <div key={i} className="flex gap-4 items-start hover:bg-gray-50 p-3 -mx-3 rounded-lg transition-colors cursor-pointer">
                <div className={`w-10 h-10 ${log.avatarColor} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                  {log.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    {log.name} <span className="text-neutral-600">{log.act}</span>
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">{log.time}</p>
                </div>
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className="corporate-card rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">Legislatívny update</h3>
            <div className="w-8 h-8 bg-corporate-success rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          
          <div className="space-y-6">
            <p className="text-neutral-600 leading-relaxed">
              Váš systém bol automaticky aktualizovaný podľa nového zákona č. 108/2024 Z. z. o ochrane spotrebiteľa. Všetky VOP a reklamačné poriadky sú v súlade.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-corporate-success rounded-full"></div>
                <span className="text-sm font-medium text-neutral-700">Všetky dokumenty sú v súlade</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-corporate-blue rounded-full"></div>
                <span className="text-sm font-medium text-neutral-700">12 dokumentov aktualizovaných</span>
              </div>
            </div>
            
            <button className="corporate-button w-full">
              Zobraziť zmeny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
