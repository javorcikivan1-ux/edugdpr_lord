
import React, { useState, useEffect, useCallback } from 'react';
import TrainingEditor from './TrainingEditor';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/ToastContext';
import { calculateSmartPricing, formatPrice } from '../lib/pricing';
import { 
  Plus, 
  ShieldCheck, 
  Trash2,
  Edit3,
  Check,
  CheckCircle2,
  X,
  RefreshCw,
  Zap,
  Building2,
  Mail,
  User,
  ChevronRight,
  Camera
} from 'lucide-react';

interface LicenseRequest {
  id: string;
  quantity: number;
  premium_quantity: number;
  expert_quantity: number;
  estimated_price: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  training_id: string;
  company_id: string;
  training: { id: string; title: string; };
  company?: { id: string; full_name: string; email: string; company_name: string; company_token: string; };
  // Fakturačné údaje
  invoice_company_name?: string;
  invoice_ico?: string;
  invoice_dic?: string;
  invoice_icdph?: string;
  invoice_address?: string;
  invoice_email?: string;
}

const SuperAdminTools: React.FC<{ initialView?: string }> = ({ initialView = 'admin_trainings' }) => {
  const { showToast } = useToast();
  const [activeTool, setActiveTool] = useState<string>(initialView);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [licenseRequests, setLicenseRequests] = useState<LicenseRequest[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<any | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Record<string, any>>({});
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    request: any;
    edits: any;
  }>({ isOpen: false, request: null, edits: null });

  useEffect(() => {
    setActiveTool(initialView);
  }, [initialView]);

  const fetchTrainings = useCallback(async () => {
    const { data, error } = await supabase
      .from('trainings')
      .select('*')
      .neq('status', 'archived')
      .order('created_at', { ascending: false });
    if (!error) setTrainings(data || []);
  }, []);

  const fetchRequests = useCallback(async () => {
    const [reqs, emps, trains] = await Promise.all([
      supabase.from('license_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('employees').select('id, full_name, email, company_name, company_token'),
      supabase.from('trainings').select('id, title')
    ]);
    if (reqs.data) {
      const enriched = reqs.data.map(r => ({
        ...r,
        company: emps.data?.find(e => e.id === r.company_id),
        training: trains.data?.find(t => t.id === r.training_id) || { title: 'Smart Seat Pack' }
      }));
      setLicenseRequests(enriched as any);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .not('company_token', 'is', null)
      .order('company_name', { ascending: true });
    
    if (!error && data) {
      const uniqueCompanies = Array.from(new Set(data.map(e => e.company_token)))
        .map(token => {
          const companyData = data.find(e => e.company_token === token);
          const membersCount = data.filter(e => e.company_token === token).length;
          return { ...companyData, membersCount };
        });
      setCompanies(uniqueCompanies);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTrainings(), fetchRequests(), fetchCompanies()]).finally(() => setLoading(false));
  }, [fetchTrainings, fetchRequests, fetchCompanies]);

  const handleEditTraining = async (training: any) => {
    setLoading(true);
    try {
      const { data: modules, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('training_id', training.id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;

      const formattedLessons = (modules || []).map(m => ({
        id: m.id,
        title: m.title,
        description: m.description || '', // Krátky popis pre osnovu
        content: m.content || '',         // Dlhý obsah pre player
        type: m.module_type,
        duration_minutes: m.duration_minutes,
        order: m.order_index
      }));

      setSelectedTraining({ 
        ...training, 
        lessons: formattedLessons,
        faq: training.faq || [],
        tags: training.tags || [],
        objectives: training.learning_objectives || [],
        note: training.note || ''
      });
      setIsCreatingNew(false);
      setActiveTool('editor');
    } catch (e: any) {
      showToast('Chyba pri načítaní detailov: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTraining = async (formData: any) => {
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        full_description: formData.full_description,
        status: formData.status || 'published',
        price: Number(formData.price),
        category: formData.category,
        training_type: formData.training_type,
        thumbnail: formData.thumbnail,
        learning_objectives: formData.objectives,
        faq: formData.faq || [],
        tags: formData.tags || [],
        note: formData.note || '',
        updated_at: new Date().toISOString()
      };

      let savedId = formData.id;
      if (isCreatingNew || !savedId) {
        const { data, error } = await supabase.from('trainings').insert([payload]).select().single();
        if (error) throw error;
        savedId = data.id;
      } else {
        const { error } = await supabase.from('trainings').update(payload).eq('id', savedId);
        if (error) throw error;
      }

      // Synchronizácia training_modules (osnovy)
      if (formData.lessons) {
        // Vymažeme staré moduly a vložíme nové (najjednoduchšia synchronizácia)
        await supabase.from('training_modules').delete().eq('training_id', savedId);
        
        const mods = formData.lessons.map((l: any, i: number) => ({
          training_id: savedId,
          title: l.title,
          description: l.description, // Krátky popis pre osnovu
          content: l.content,         // Plný obsah pre player
          module_type: l.type,
          order_index: i + 1,
          duration_minutes: l.duration_minutes
        }));

        if (mods.length > 0) {
          const { error: mErr } = await supabase.from('training_modules').insert(mods);
          if (mErr) throw mErr;
        }
      }

      await fetchTrainings();
      showToast('Produkt úspešne uložený', 'success');
      setSelectedTraining(null);
      setIsCreatingNew(false);
      setActiveTool('admin_trainings');
    } catch (e: any) {
      showToast('Chyba ukladania: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    if (!confirm('Naozaj chcete vymazať toto školenie? Táto akcia je neobnoviteľná.')) {
      return;
    }
    
    setLoading(true);
    try {
      // Najprv vymažeme moduly školenia
      await supabase.from('training_modules').delete().eq('training_id', trainingId);
      
      // Potom vymažeme samotné školenie
      const { error } = await supabase.from('trainings').delete().eq('id', trainingId);
      
      if (error) throw error;
      
      showToast('Školenie úspešne vymazané', 'success');
      await fetchTrainings();
    } catch (e: any) {
      showToast('Chyba pri mazaní školenia: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (req: LicenseRequest) => {
    const edits = editingRequest[req.id] || { qty: req.quantity, prem: req.premium_quantity, exp: req.expert_quantity, price: req.estimated_price };
    
    // Validácia objednávky pomocou centralizovanej kalkulačky
    const pricing = calculateSmartPricing(edits.qty, edits.prem, edits.exp);
    if (pricing.total === null) {
      showToast('Cena pre tento počet licencií musí byť nastavená manuálne', 'error');
      return;
    }
    
    // Otvor potvrdzovací modal
    setConfirmModal({
      isOpen: true,
      request: req,
      edits: { ...edits, calculatedPrice: pricing.total }
    });
  };

  const confirmApproval = async () => {
    if (!confirmModal.request || !confirmModal.edits) return;
    
    const { request, edits } = confirmModal;
    
    setLoading(true);
    try {
      await supabase.from('license_requests').update({ 
        status: 'approved', 
        quantity: edits.qty, 
        premium_quantity: edits.prem, 
        expert_quantity: edits.exp,
        estimated_price: edits.calculatedPrice 
      }).eq('id', request.id);
      
      await supabase.from('company_purchases').insert({
        company_id: request.company_id,
        price: edits.calculatedPrice,
        quantity: edits.qty,
        total_licenses: edits.qty,
        premium_licenses: edits.prem,
        expert_licenses: edits.exp,
        status: 'active',
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });

      showToast('Dopyt schválený', 'success');
      setConfirmModal({ isOpen: false, request: null, edits: null });
      await fetchRequests();
    } catch (e: any) { 
      showToast(e.message, 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-8 pb-20 text-left text-slate-900 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-3 text-brand-orange font-black text-[10px] uppercase tracking-[0.4em] mb-1">
            <ShieldCheck size={14} /> Authority Central
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none text-left uppercase">
            {activeTool === 'admin_trainings' && 'Správa katalógu'}
            {activeTool === 'admin_requests' && 'Dopyty klientov'}
            {activeTool === 'admin_companies' && 'Zoznam klientov'}
            {activeTool === 'editor' && 'Editor obsahu'}
          </h1>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           {activeTool === 'admin_trainings' && (
             <button onClick={() => { setSelectedTraining(null); setIsCreatingNew(true); setActiveTool('editor'); }} className="flex items-center gap-3 bg-[#004E89] text-white px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-xl">
               <Plus size={20} /> Nový Produkt
             </button>
           )}
        </div>
      </div>

      <div className="w-full text-left">
          {activeTool === 'admin_requests' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in text-left">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left min-w-[1600px] text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200">
                      <tr>
                        <th className="px-10 py-6 text-center">Dátum</th>
                        <th className="px-10 py-6 text-left">Klient (Firma)</th>
                        <th className="px-10 py-6 text-center">Celkom licencií</th>
                        <th className="px-10 py-6 text-center">Standard</th>
                        <th className="px-10 py-6 text-center text-brand-orange">Premium</th>
                        <th className="px-10 py-6 text-center text-purple-600">Expert</th>
                        <th className="px-10 py-6 text-center">Cena/rok (€)</th>
                        <th className="px-10 py-6 text-center">Priem. cena (€)</th>
                        <th className="px-10 py-6 text-left">Fakturačné údaje</th>
                        <th className="px-10 py-6 text-center">Status</th>
                        <th className="px-10 py-6 text-right">Akcia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-left">
                      {licenseRequests.map(r => {
                        const isPending = r.status === 'pending';
                        const current = editingRequest[r.id] || { qty: r.quantity, prem: r.premium_quantity, exp: r.expert_quantity, price: r.estimated_price };
                        // Výpočet počtu standard licencií
                        const standardCount = current.qty - current.prem;
                        
                        const updatePremium = (newPremium: number) => {
                          const updated = { ...current, prem: newPremium };
                          setEditingRequest({...editingRequest, [r.id]: updated});
                        };
                        
                        const updateExpert = (newExpert: number) => {
                          const updated = { ...current, exp: newExpert };
                          setEditingRequest({...editingRequest, [r.id]: updated});
                        };
                        
                        return (
                          <tr key={r.id} className={`hover:bg-slate-50/50 ${!isPending ? 'opacity-40' : ''}`}>
                               <td className="px-10 py-6 text-center">
                                  <div className="space-y-1">
                                    <div className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString('sk-SK')}</div>
                                    <div className="text-[9px] text-slate-400 font-black uppercase">Dátum</div>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-left">
                                  <div className="space-y-1">
                                    <div className="font-bold text-sm text-slate-900 text-left">{r.company?.company_name || r.company?.full_name}</div>
                                    <div className="text-[10px] text-slate-400 font-black uppercase mt-1 text-left">{r.company?.email}</div>
                                    <div className="text-[9px] text-slate-500">ID: {r.company_id}</div>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <div className="space-y-1">
                                    <span className="font-black text-lg">{current.qty}</span>
                                    <div className="text-[9px] text-slate-400 font-black uppercase">Celkom</div>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <div className="space-y-1">
                                    <span className="font-bold text-lg text-slate-600">{standardCount}</span>
                                    <div className="text-[9px] text-slate-400 font-black uppercase">Standard</div>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <div className="space-y-1">
                                    {isPending ? (
                                      <input type="number" value={current.prem} onChange={e => updatePremium(parseInt(e.target.value) || 0)} className="w-16 text-center py-2 bg-orange-50 text-brand-orange rounded-xl font-bold border border-orange-100 outline-none" />
                                    ) : <span className="font-bold text-lg text-brand-orange">{r.premium_quantity}</span>}
                                    <div className="text-[9px] text-orange-400 font-black uppercase">Premium</div>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <div className="space-y-1">
                                    {isPending ? (
                                      <input type="number" value={current.exp} onChange={e => updateExpert(parseInt(e.target.value) || 0)} className="w-16 text-center py-2 bg-purple-50 text-purple-600 rounded-xl font-bold border border-purple-100 outline-none" />
                                    ) : <span className="font-bold text-lg text-purple-600">{r.expert_quantity}</span>}
                                    <div className="text-[9px] text-purple-400 font-black uppercase">Expert</div>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <div className="space-y-1">
                                    <span className="font-black text-lg">€{r.estimated_price}</span>
                                    <div className="text-[9px] text-slate-400 font-black uppercase">Ročne</div>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <div className="space-y-1">
                                    <span className="font-black text-lg text-slate-600">€{(r.estimated_price / (r.quantity || 1)).toFixed(2)}</span>
                                    <div className="text-[9px] text-slate-400 font-black uppercase">Priemer</div>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-left">
                                  {r.invoice_company_name ? (
                                    <div className="space-y-1 max-w-xs">
                                       <div className="font-bold text-sm text-slate-900 truncate">{r.invoice_company_name}</div>
                                       <div className="text-[10px] text-slate-500">IČO: {r.invoice_ico}</div>
                                       {r.invoice_dic && <div className="text-[10px] text-slate-500">DIČ: {r.invoice_dic}</div>}
                                       {r.invoice_icdph && <div className="text-[10px] text-slate-500">IČ DPH: {r.invoice_icdph}</div>}
                                       <div className="text-[10px] text-slate-500 truncate">{r.invoice_address}</div>
                                       <div className="text-[10px] text-slate-500 truncate">📧 {r.invoice_email}</div>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-slate-400 font-black uppercase">Nezadané</div>
                                  )}
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    r.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                    r.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                    'bg-slate-50 text-slate-400 border-slate-100'
                                  }`}>
                                    {r.status === 'pending' ? 'Čaká' : r.status === 'approved' ? 'Schválené' : 'Odmietnuté'}
                                  </span>
                               </td>
                               <td className="px-10 py-6 text-right">
                                  {isPending ? (
                                    <button onClick={() => approveRequest(r)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Check size={20}/></button>
                                  ) : <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Vybavené</span>}
                               </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTool === 'admin_trainings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in text-left">
                 {trainings.map(t => (
                   <div key={t.id} className="bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col h-full text-left">
                      <div className="p-8 space-y-6 flex-1 text-left">
                        <div className="flex items-center justify-between text-left">
                           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-100">{t.category === 'GDPR' ? '🛡️' : '🎓'}</div>
                           <span className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider border ${t.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{t.status}</span>
                        </div>
                        <div className="space-y-2 text-left">
                           <h4 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight text-left">{t.title}</h4>
                           <div className="flex flex-wrap gap-2 pt-1 text-left">
                             {t.training_type === 'premium' && <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-medium rounded-lg uppercase border border-brand-orange/10 flex items-center gap-1"><Zap size={10} fill="currentColor"/> Premium</span>}
                             {t.training_type === 'expert' && <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-lg uppercase border border-purple-200 flex items-center gap-1"><Camera size={10} /> Expert</span>}
                             {t.is_premium && <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-medium rounded-lg uppercase border border-brand-orange/10 flex items-center gap-1"><Zap size={10} fill="currentColor"/> Premium</span>}
                             <span className="px-3 py-1 bg-blue-50 text-[#004E89] text-xs font-medium rounded-lg uppercase border border-blue-100">{t.category}</span>
                           </div>
                        </div>
                      </div>
                      <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-left">
                         <span className="text-xl font-black text-slate-900 text-left">€{t.price}</span>
                         <div className="flex gap-2">
                           <button onClick={() => handleEditTraining(t)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-blue transition-all"><Edit3 size={18}/></button>
                           <button onClick={() => handleDeleteTraining(t.id)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={18}/></button>
                         </div>
                      </div>
                   </div>
                 ))}
            </div>
          )}

          {activeTool === 'admin_companies' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in text-left">
               <div className="overflow-x-auto no-scrollbar text-left">
                  <table className="w-full text-left min-w-[1400px] text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200">
                      <tr>
                        <th className="px-10 py-6 text-left">Klient / Spoločnosť</th>
                        <th className="px-10 py-6 text-center">Unikátny Token</th>
                        <th className="px-10 py-6 text-center">Aktívny Tím</th>
                        <th className="px-10 py-6 text-right">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-left">
                      {companies.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-all group">
                          <td className="px-10 py-8 text-left">
                             <div className="font-black text-sm text-slate-900 group-hover:text-brand-blue transition-colors uppercase tracking-tight text-left">{c.company_name || 'BEZ NÁZVU'}</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 flex items-center gap-2 text-left"><Mail size={10} className="text-brand-orange"/> {c.email}</div>
                          </td>
                          <td className="px-10 py-8 text-center">
                             <code className="font-mono font-black text-[#004E89] bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100 tracking-widest text-sm">{c.company_token}</code>
                          </td>
                          <td className="px-10 py-8 text-center">
                             <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-600 text-xs">
                               <User size={14} className="text-brand-orange"/> {c.membersCount}
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-[#004E89] hover:text-white hover:shadow-xl transition-all flex items-center justify-center ml-auto">
                               <ChevronRight size={20}/>
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}
          
          {activeTool === 'editor' && (
            <TrainingEditor 
               training={selectedTraining} 
               onSave={handleSaveTraining} 
               onCancel={() => { setSelectedTraining(null); setIsCreatingNew(false); setActiveTool('admin_trainings'); }} 
               isCreatingNew={isCreatingNew} 
            />
          )}
          
          {/* Potvrdzovací modal pre schválenie */}
          {confirmModal.isOpen && confirmModal.request && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] animate-in fade-in duration-200">
              <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full mx-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <Check size={32} className="text-emerald-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Potvrdiť schválenie</h3>
                    <p className="text-slate-600">
                      Naozaj chcete schváliť <span className="font-bold text-emerald-600">{confirmModal.edits.qty} licencií</span> pre firmu 
                      <span className="font-bold text-slate-900"> {confirmModal.request.company?.company_name || confirmModal.request.company?.full_name}</span>?
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Celkom licencií:</span>
                      <span className="font-bold text-lg">{confirmModal.edits.qty}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Standard:</span>
                      <span className="font-bold text-slate-600">{confirmModal.edits.qty - confirmModal.edits.prem}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Premium:</span>
                      <span className="font-bold text-brand-orange">{confirmModal.edits.prem}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Expert:</span>
                      <span className="font-bold text-purple-600">{confirmModal.edits.exp}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-900 font-bold">Celková cena/rok:</span>
                        <span className="font-black text-xl text-emerald-600">€{confirmModal.edits.calculatedPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setConfirmModal({ isOpen: false, request: null, edits: null })}
                      className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Zrušiť
                    </button>
                    <button
                      onClick={confirmApproval}
                      disabled={loading}
                      className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Spracovávam...' : 'Schváliť'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default SuperAdminTools;
