
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  HelpCircle,
  Clock,
  Type,
  Image as ImageIcon,
  Eye,
  RefreshCw,
  LayoutDashboard,
  FileBadge,
  BookOpen,
  Layout,
  Camera,
  Copy
} from 'lucide-react';

interface Lesson {
  id?: string;
  title: string;
  description: string; // Krátky popis pre Marketplace (osnova)
  content: string;     // Plný HTML obsah pre Player
  type: 'text' | 'video' | 'quiz';
  duration_minutes: number;
}

interface FAQ {
  question: string;
  answer: string;
}

interface FormData {
  id?: string;
  title: string;
  description: string;
  full_description: string;
  price: number;
  category: string;
  training_type: 'standard' | 'premium' | 'expert';
  thumbnail: string;
  objectives: string[];
  faq: FAQ[];
  lessons: Lesson[];
  note: string;
  status: string;
}

const TrainingEditor: React.FC<{ 
  training: any | null; 
  onSave: (formData: any) => Promise<void>; 
  onCancel: () => void; 
  isCreatingNew: boolean; 
  isSuperAdmin?: boolean;
}> = ({ training, onSave, onCancel, isCreatingNew, isSuperAdmin = false }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'extra'>('basic');
  const [loading, setLoading] = useState(false);
  const [expandedLessonIdx, setExpandedLessonIdx] = useState<number | null>(0);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedLessonForDuplicate, setSelectedLessonForDuplicate] = useState<number | null>(null);
  const [availableTrainings, setAvailableTrainings] = useState<any[]>([]);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    full_description: '',
    price: 0,
    category: 'GDPR',
    training_type: 'standard',
    thumbnail: '',
    objectives: [''],
    faq: [{ question: '', answer: '' }],
    lessons: [{ title: '', description: '', content: '', type: 'text', duration_minutes: 10 }],
    note: '',
    status: 'draft'
  });

  useEffect(() => {
    if (training && !isCreatingNew) {
      setFormData({
        id: training.id,
        title: training.title || '',
        description: training.description || '',
        full_description: training.full_description || '',
        price: training.price || 0,
        category: training.category || 'GDPR',
        training_type: training.training_type || (training.is_premium ? 'premium' : 'standard'),
        thumbnail: training.thumbnail || '',
        // Prioritne berieme objectives, potom learning_objectives z DB
        objectives: training.objectives && training.objectives.length > 0 ? training.objectives : (training.learning_objectives || ['']),
        faq: training.faq || [{ question: '', answer: '' }],
        lessons: (training.lessons || [{ title: '', description: '', content: '', type: 'text', duration_minutes: 10 }]) as Lesson[],
        note: training.note || '',
        status: training.status || 'published'
      });
    }
  }, [training, isCreatingNew]);

  // Načítanie zoznamu školení pre duplikovanie (iba pre superadmin)
  useEffect(() => {
    if (isSuperAdmin) {
      const fetchTrainings = async () => {
        const { data, error } = await supabase
          .from('trainings')
          .select('id, title, status')
          .neq('status', 'archived')
          .order('title', { ascending: true });
        
        if (!error && data) {
          setAvailableTrainings(data.filter(t => t.id !== training?.id)); // Vylúčiť aktuálne školenie
        }
      };
      
      fetchTrainings();
    }
  }, [isSuperAdmin, training?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const addListItem = (field: 'objectives' | 'faq' | 'lessons') => {
    if (field === 'objectives') {
      setFormData({ ...formData, objectives: [...formData.objectives, ''] });
    } else if (field === 'faq') {
      setFormData({ ...formData, faq: [...formData.faq, { question: '', answer: '' }] });
    } else {
      const newLesson: Lesson = { title: '', description: '', content: '', type: 'text', duration_minutes: 10 };
      const newList = [...formData.lessons, newLesson];
      setFormData({ ...formData, lessons: newList });
      setExpandedLessonIdx(newList.length - 1);
    }
  };

  const removeListItem = (field: 'objectives' | 'faq' | 'lessons', index: number) => {
    const list = [...formData[field]] as any[];
    if (list.length <= 1) {
      if (field === 'objectives') setFormData({...formData, objectives: ['']});
      return;
    }
    list.splice(index, 1);
    setFormData({ ...formData, [field]: list });
  };

  const updateListItem = (field: 'objectives' | 'faq' | 'lessons', index: number, value: any) => {
    const list = [...formData[field]] as any[];
    list[index] = value;
    setFormData({ ...formData, [field]: list });
  };

  const handleDuplicateLesson = (lessonIndex: number) => {
    setSelectedLessonForDuplicate(lessonIndex);
    setShowDuplicateModal(true);
  };

  const confirmDuplicateLesson = async (targetTrainingId: string) => {
    if (selectedLessonForDuplicate === null) return;
    
    setDuplicateLoading(true);
    try {
      const lesson = formData.lessons[selectedLessonForDuplicate];
      const lessonId = lesson.id; // ID z databázy, ak existuje
      
      if (!lessonId) {
        alert('Túto lekciu nie je možné duplikovať, pretože ešte nebola uložená.');
        return;
      }

      // Získať aktuálneho užívateľa
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Nemáte oprávnenie na túto operáciu.');
        return;
      }

      // Volanie RPC funkcie
      const { data: result, error } = await supabase.rpc('duplicate_lesson_to_training', {
        lesson_id: lessonId,
        target_training_id: targetTrainingId,
        current_user_id: user.id
      });

      if (error) {
        console.error('RPC error:', error);
        alert(`Chyba pri duplikovaní: ${error.message}`);
        return;
      }

      if (result?.success) {
        alert(`Lekcia bola úspešne duplikovaná: ${result.message}`);
        setShowDuplicateModal(false);
        setSelectedLessonForDuplicate(null);
      } else {
        alert(`Chyba pri duplikovaní: ${result?.error || 'Neznáma chyba'}`);
      }
    } catch (error) {
      console.error('Duplicate lesson error:', error);
      alert('Nastala chyba pri duplikovaní lekcie.');
    } finally {
      setDuplicateLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      type="button"
      className={`flex items-center gap-3 px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all shrink-0 ${
        activeTab === id 
          ? 'border-[#00427a] text-[#00427a] bg-blue-50/30' 
          : 'border-transparent text-slate-400 hover:text-slate-700'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500 text-left">
      <div className="bg-white border-b border-slate-50 flex overflow-x-auto no-scrollbar">
        <TabButton id="basic" label="Základné údaje" icon={LayoutDashboard} />
        <TabButton id="content" label="Osnova & Lekcie" icon={BookOpen} />
        <TabButton id="extra" label="FAQ & Metadáta" icon={FileBadge} />
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-10 text-left">
        
        {activeTab === 'basic' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-left">
            <div className="grid lg:grid-cols-2 gap-8 text-left">
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Názov školenia</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Základy GDPR 2025" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 outline-none transition-all" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategória</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none cursor-pointer">
                  <option value="GDPR">GDPR</option>
                  <option value="BOZP">BOZP</option>
                  <option value="KYBER">Kyberbezpečnosť</option>
                  <option value="LEGISLATÍVA">Legislatíva</option>
                  <option value="OSTATNÉ">Ostatné</option>
                </select>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 text-left">
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cena (€)</label>
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} required placeholder="99.00" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 outline-none transition-all" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Typ školenia</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, training_type: 'standard'})}
                    className={`px-4 py-3 rounded-xl border-2 transition-all text-xs font-black uppercase tracking-tight ${
                      formData.training_type === 'standard' 
                        ? 'bg-slate-50 border-slate-300 text-slate-700' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Standard
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, training_type: 'premium'})}
                    className={`px-4 py-3 rounded-xl border-2 transition-all text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1 ${
                      formData.training_type === 'premium' 
                        ? 'bg-orange-50 border-brand-orange text-brand-orange' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-orange-600'
                    }`}
                  >
                    <Zap size={14} fill={formData.training_type === 'premium' ? "currentColor" : "none"} />
                    Premium
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, training_type: 'expert'})}
                    className={`px-4 py-3 rounded-xl border-2 transition-all text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1 ${
                      formData.training_type === 'expert' 
                        ? 'bg-purple-50 border-purple-600 text-purple-600' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-purple-600'
                    }`}
                  >
                    <Camera size={14} />
                    Expert
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Thumbnail URL</label>
                <div className="relative">
                   <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input type="text" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} placeholder="https://..." className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Krátky popis (zobrazenie v katalógu)</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows={2} placeholder="Stručné zhrnutie školenia v 2-3 vetách pre zoznam všetkých kurzov..." className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none" />
            </div>

            {/* Fix: Ciele sa nachádzajú tu */}
            <div className="space-y-4 text-left bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
               <div className="flex items-center justify-between">
                  <div className="text-left">
                    <label className="text-[11px] font-black text-[#00427a] uppercase tracking-widest block text-left">Čo sa u nás naučíte (Ciele / Výhody)</label>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">Tieto body sa zobrazia v Marketplace pod nadpisom "Čo sa u nás naučíte"</p>
                  </div>
                  <button type="button" onClick={() => addListItem('objectives')} className="w-10 h-10 rounded-xl bg-white text-[#00427a] border border-blue-100 flex items-center justify-center hover:shadow-md transition-all"><Plus size={18}/></button>
               </div>
               <div className="grid md:grid-cols-2 gap-3 text-left">
                  {formData.objectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-3 text-left">
                       <input type="text" value={obj} onChange={e => updateListItem('objectives', i, e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 text-left" placeholder="Napr. Pochopenie základných pilierov GDPR..." />
                       <button type="button" onClick={() => removeListItem('objectives', i)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Úplný popis (detail školenia)</label>
              <textarea value={formData.full_description} onChange={e => setFormData({...formData, full_description: e.target.value})} rows={6} placeholder="Detailný marketingový text, ktorý vidí klient pred kúpou kurzu..." className="w-full bg-slate-50 border-none rounded-[2rem] px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none font-medium leading-relaxed" />
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-left">
             <div className="flex items-center justify-between px-2 text-left">
                <div className="text-left">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-left">Osnova a vzdelávacie moduly</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">Definujte štruktúru kapitol</p>
                </div>
                <button type="button" onClick={() => addListItem('lessons')} className="flex items-center gap-2 bg-blue-50 text-[#00427a] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"><Plus size={14} /> Pridať lekciu</button>
             </div>

             <div className="space-y-4 text-left">
                {formData.lessons.map((lesson, idx) => {
                  const isExpanded = expandedLessonIdx === idx;
                  return (
                    <div key={idx} className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${isExpanded ? 'border-brand-blue shadow-lg ring-4 ring-blue-50' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}>
                       <div className="p-5 flex items-center justify-between cursor-pointer group" onClick={() => setExpandedLessonIdx(isExpanded ? null : idx)}>
                          <div className="flex items-center gap-5">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${isExpanded ? 'bg-brand-blue text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>{idx + 1}</div>
                             <div className="text-left">
                                <span className={`font-black uppercase text-sm tracking-tight transition-colors ${isExpanded ? 'text-brand-blue' : 'text-slate-900 group-hover:text-brand-blue'}`}>{lesson.title || `Nová lekcia č. ${idx + 1}`}</span>
                                {isExpanded && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Editácia obsahu modulu</p>}
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             {isSuperAdmin && (
                               <button 
                                 type="button" 
                                 onClick={(e) => { e.stopPropagation(); handleDuplicateLesson(idx); }} 
                                 className="p-2 text-slate-300 hover:text-blue-500 transition-colors" 
                                 title="Duplikovať lekciu do iného školenia"
                               >
                                 <Copy size={16}/>
                               </button>
                             )}
                             <button type="button" onClick={(e) => { e.stopPropagation(); removeListItem('lessons', idx); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                             {isExpanded ? <ChevronUp size={20} className="text-brand-blue"/> : <ChevronDown size={20} className="text-slate-300"/>}
                          </div>
                       </div>
                       
                       {isExpanded && (
                         <div className="p-8 pt-2 border-t border-slate-50 space-y-8 animate-in slide-in-from-top-2 duration-300 text-left">
                            <div className="grid md:grid-cols-12 gap-6 text-left">
                               <div className="md:col-span-8 space-y-1.5 text-left">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Názov lekcie</label>
                                  <input type="text" value={lesson.title} onChange={e => {
                                      const newList = [...formData.lessons];
                                      newList[idx].title = e.target.value;
                                      setFormData({...formData, lessons: newList});
                                  }} placeholder="Napr. Definícia osobných údajov" className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 text-left" />
                               </div>
                               <div className="md:col-span-2 space-y-1.5 text-left">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Čas (min)</label>
                                  <input type="number" value={lesson.duration_minutes} onChange={e => {
                                      const newList = [...formData.lessons];
                                      newList[idx].duration_minutes = parseInt(e.target.value) || 0;
                                      setFormData({...formData, lessons: newList});
                                  }} className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 text-left" />
                               </div>
                               <div className="md:col-span-2 space-y-1.5 text-left">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Typ obsahu</label>
                                  <select value={lesson.type} onChange={e => {
                                      const newList = [...formData.lessons];
                                      newList[idx].type = e.target.value as any;
                                      setFormData({...formData, lessons: newList});
                                  }} className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 text-xs font-bold text-slate-900 outline-none cursor-pointer">
                                     <option value="text">Textová</option>
                                     <option value="video">Video</option>
                                     <option value="quiz">Kvíz</option>
                                  </select>
                               </div>
                            </div>
                            <div className="space-y-1.5 text-left">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Krátky popis do osnovy (zobrazí sa v Marketplace)</label>
                               <textarea value={lesson.description} onChange={e => {
                                   const newList = [...formData.lessons];
                                   newList[idx].description = e.target.value;
                                   setFormData({...formData, lessons: newList});
                               }} rows={2} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-medium text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-100 text-left" placeholder="Stručné zhrnutie, o čom je táto kapitola..." />
                            </div>
                            <div className="space-y-1.5 text-left">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Úplný vzdelávací obsah (HTML/Markdown)</label>
                               <textarea value={lesson.content} onChange={e => {
                                   const newList = [...formData.lessons];
                                   newList[idx].content = e.target.value;
                                   setFormData({...formData, lessons: newList});
                               }} rows={8} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 outline-none font-mono focus:ring-2 focus:ring-blue-100 text-left" placeholder="Sem vložte text lekcie, ktorý uvidí študent v Playeri..." />
                            </div>
                         </div>
                       )}
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {activeTab === 'extra' && (
           <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 text-left">
              <div className="space-y-6 text-left">
                 <div className="flex items-center justify-between text-left">
                    <div className="text-left">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-left">Časté otázky (FAQ)</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">Pomoc a podpora pre študentov</p>
                    </div>
                    <button type="button" onClick={() => addListItem('faq')} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-brand-blue flex items-center justify-center transition-all border border-slate-100 shadow-sm"><Plus size={18}/></button>
                 </div>
                 <div className="space-y-4 text-left">
                    {formData.faq.map((item, i) => (
                      <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4 relative group text-left">
                         <button type="button" onClick={() => removeListItem('faq', i)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                         <input type="text" value={item.question} onChange={e => {
                             const newList = [...formData.faq];
                             newList[i].question = e.target.value;
                             setFormData({...formData, faq: newList});
                         }} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 text-left" placeholder="Otázka..." />
                         <textarea value={item.answer} onChange={e => {
                             const newList = [...formData.faq];
                             newList[i].answer = e.target.value;
                             setFormData({...formData, faq: newList});
                         }} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 text-left" rows={2} placeholder="Odpoveď..." />
                      </div>
                    ))}
                 </div>
              </div>
              <div className="space-y-4 text-left">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-left">Právna poznámka / Garancia obsahu</h3>
                 <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Napr. Toto školenie je vypracované odborným garantom LORD'S BENISON s.r.o. v súlade so zákonom č. 18/2018 Z.z." rows={3} className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 text-sm font-bold text-[#00427a] outline-none italic transition-all focus:ring-4 focus:ring-blue-50 text-left" />
              </div>
           </div>
        )}

        <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6 text-left">
              <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner text-left">
                 {['draft', 'published'].map(s => (
                   <button key={s} type="button" onClick={() => setFormData({...formData, status: s})} className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === s ? 'bg-white text-slate-900 shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
                     {s === 'draft' ? 'Koncept' : 'Publikované'}
                   </button>
                 ))}
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest hidden md:block">Verzia: {isCreatingNew ? 'Nová' : 'Existujúca'} • {new Date().toLocaleDateString('sk-SK')}</p>
           </div>
           <div className="flex items-center gap-4 w-full sm:w-auto text-left">
              <button type="button" onClick={onCancel} className="flex-1 sm:flex-none px-10 py-5 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all border border-slate-100">Zrušiť</button>
              <button type="submit" disabled={loading} className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-[#00427a] text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-900 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50">
                {loading ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16} />} Uložiť Produkt
              </button>
           </div>
        </div>
      </form>

      {/* Modal pre duplikovanie lekcie */}
      {showDuplicateModal && selectedLessonForDuplicate !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full mx-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Duplikovať lekciu</h3>
                <p className="text-slate-600">
                  Vyberte cieľové školenie, do ktorého chcete duplikovať lekciu 
                  <span className="font-bold text-blue-600"> "{formData.lessons[selectedLessonForDuplicate].title || `Lekcia ${selectedLessonForDuplicate + 1}`}"</span>
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cieľové školenie</label>
                {availableTrainings.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-500 text-sm">Žiadne dostupné školenia</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {availableTrainings.map(training => (
                      <button
                        key={training.id}
                        onClick={() => confirmDuplicateLesson(training.id)}
                        disabled={duplicateLoading}
                        className="w-full text-left p-4 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="font-bold text-sm text-slate-900">{training.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Status: {training.status}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setSelectedLessonForDuplicate(null);
                  }}
                  disabled={duplicateLoading}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingEditor;
