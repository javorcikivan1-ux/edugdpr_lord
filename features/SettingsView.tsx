
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthService';
import { useToast } from '../lib/ToastContext';
import { 
  Lock, 
  Save, 
  Settings, 
  Copy, 
  CheckCircle2, 
  Building2, 
  KeyRound, 
  Shield, 
  Users, 
  RefreshCw, 
  FileSignature, 
  Camera, 
  Loader2,
  User,
  Hash,
  Check,
  X,
  MapPin
} from 'lucide-react';

export const SettingsView = () => {
  const { isCompanyAdmin } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [dbToken, setDbToken] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  // Načítaj aktivný tab z localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('settingsTab');
    if (savedTab) {
      setActiveTab(savedTab);
      // Vymaž po použití
      localStorage.removeItem('settingsTab');
    }
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    address: '',
    ico: '',
    dic: '',
    icDph: '',
    isVatPayer: false,
    logoUrl: '',
    stampUrl: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const currentUser = session.user;
      setUser(currentUser);
      const meta = currentUser.user_metadata || {};
      
      const { data: empData, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      const finalToken = empData?.company_token || meta.company_token || meta.token || `LB-${currentUser.id.slice(0, 8).toUpperCase()}`;
      setDbToken(finalToken);

      // Mapovanie dát z DB stĺpcov (snake_case) na náš stav (camelCase)
      setFormData({
        firstName: empData?.full_name?.split(' ')[0] || meta.firstName || meta.full_name?.split(' ')[0] || '',
        lastName: empData?.full_name?.split(' ').slice(1).join(' ') || meta.lastName || meta.full_name?.split(' ').slice(1).join(' ') || '',
        companyName: empData?.company_name || meta.company_name || '',
        address: empData?.address || meta.address || '',
        ico: empData?.ico || meta.ico || '',
        dic: empData?.dic || meta.dic || '',
        icDph: empData?.ic_dph || meta.ic_dph || meta.icDph || '',
        isVatPayer: empData?.is_vat_payer || meta.is_vat_payer || false,
        logoUrl: empData?.logo_url || meta.logo_url || meta.logoUrl || '',
        stampUrl: empData?.stamp_url || meta.stamp_url || meta.stampUrl || '',
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const fileName = `${session.user.id}/${type}-${Date.now()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
        
        const field = type === 'logo' ? 'logo_url' : 'stamp_url';
        const stateField = type === 'logo' ? 'logoUrl' : 'stampUrl';
        
        setFormData(prev => ({ ...prev, [stateField]: publicUrl }));
        
        await supabase.from('employees').update({ [field]: publicUrl }).eq('id', session.user.id);
        await supabase.auth.updateUser({ data: { [stateField]: publicUrl } });

        showToast(`${type === 'logo' ? 'Logo' : 'Pečiatka'} nahratá`, 'success');
      } catch (err: any) {
        showToast('Chyba nahrávania', 'error');
      } finally {
        setUploading(false);
      }
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Zosúladenie s SQL schémou (stĺpce v DB sú snake_case)
      const updatePayload: any = {
        full_name: fullName,
        company_name: formData.companyName,
        address: formData.address,
        ico: formData.ico,
        dic: formData.dic,
        ic_dph: formData.icDph,
        is_vat_payer: formData.isVatPayer
      };

      const { error: dbError } = await supabase
        .from('employees')
        .update(updatePayload)
        .eq('id', user.id);

      if (dbError) throw dbError;

      // Update Auth Metadata pre okamžitú zmenu v UI bez refreshu
      await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company_name: formData.companyName,
          address: formData.address,
          ico: formData.ico,
          dic: formData.dic,
          ic_dph: formData.icDph,
          is_vat_payer: formData.isVatPayer
        }
      });

      showToast('Zmeny úspešne uložené', 'success');
    } catch (err: any) {
      console.error("Save error:", err);
      showToast('Chyba pri ukladaní: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Heslá sa nezhodujú', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    setLoading(false);
    if (error) {
      showToast('Chyba zmeny hesla', 'error');
    } else {
      showToast('Heslo zmenené', 'success');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)} 
        className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all shrink-0 border-b-2 relative ${
          isActive 
            ? 'border-brand-orange text-slate-900' 
            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <Icon 
          size={18} 
          className={`transition-colors ${isActive ? 'text-brand-orange' : 'text-slate-400'}`} 
        />
        <span className={isActive ? 'text-slate-900 font-semibold' : ''}>{label}</span>
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange"></div>
        )}
      </button>
    );
  };

  const FormLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="text-sm font-medium text-slate-700 mb-2 block text-left">
      {children}
    </label>
  );

  const currentOrgId = dbToken || (user?.id ? `LB-${user.id.slice(0, 8).toUpperCase()}` : 'LB-NAČÍTAVAM');

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <Settings size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Nastavenia</h1>
              <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Správa vášho profilu a zabezpečenia portálu.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row border-b border-slate-200">
          <TabButton id="general" label="Všeobecné údaje" icon={User} />
          <TabButton id="security" label="Zabezpečenie" icon={Shield} />
          {isCompanyAdmin() && <TabButton id="company" label="Údaje firmy" icon={Building2} />}
          {isCompanyAdmin() && <TabButton id="team" label="Môj Tím" icon={Users} />}
        </div>
      </div>

      <div className="space-y-8 text-left">
        {activeTab === 'general' && (
          <div className="max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center gap-3">
               <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                 <User size={18} className="text-brand-orange" />
               </div>
               <h2 className="text-lg font-semibold text-white">Osobné údaje</h2>
            </div>
            <form onSubmit={saveSettings} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormLabel>Krstné meno</FormLabel>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="Jozef" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <FormLabel>Priezvisko</FormLabel>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Mrkvička" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button type="submit" disabled={loading} className="bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-all flex items-center gap-2">
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Uložiť zmeny
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'company' && isCompanyAdmin() && (
          <div className="grid gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6 group">
                <div className="relative shrink-0">
                  <div onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer group-hover:scale-105 group-hover:border-slate-400 transition-all duration-300">
                    {uploading ? <Loader2 className="animate-spin text-slate-600" size={20}/> : formData.logoUrl ? <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Building2 size={28} className="text-slate-400" />}
                    <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={16}/></div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">Logo spoločnosti</h3>
                  <p className="text-sm text-slate-500 mt-1">Hlavička a dokumenty</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6 group">
                <div className="relative shrink-0">
                  <div onClick={() => stampInputRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer group-hover:scale-105 group-hover:border-slate-400 transition-all duration-300">
                    {uploading ? <Loader2 className="animate-spin text-slate-600" size={20}/> : formData.stampUrl ? <img src={formData.stampUrl} alt="Stamp" className="w-full h-full object-contain p-2" /> : <FileSignature size={28} className="text-slate-400" />}
                    <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={16}/></div>
                  </div>
                  <input type="file" ref={stampInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'stamp')} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">Pečiatka a podpis</h3>
                  <p className="text-sm text-slate-500 mt-1">Digitálny podpis reportov</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center gap-3">
                 <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                   <Building2 size={18} className="text-brand-orange" />
                 </div>
                 <h2 className="text-lg font-semibold text-white">Firemné údaje</h2>
              </div>
              <form onSubmit={saveSettings} className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormLabel>Obchodné meno</FormLabel>
                    <input type="text" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} placeholder="Moja Spoločnosť s.r.o." className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Sídlo spoločnosti</FormLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Ulica, Číslo, PSČ, Mesto" className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormLabel>IČO</FormLabel>
                    <input type="text" value={formData.ico} onChange={(e) => setFormData({...formData, ico: e.target.value})} placeholder="12345678" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>DIČ</FormLabel>
                    <input type="text" value={formData.dic} onChange={(e) => setFormData({...formData, dic: e.target.value})} placeholder="2121022992" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isVatPayer: !formData.isVatPayer})}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        formData.isVatPayer 
                          ? 'bg-slate-800 border-slate-800' 
                          : 'bg-white border-slate-300'
                      }`}>
                        {formData.isVatPayer && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        formData.isVatPayer ? 'text-slate-800' : 'text-slate-600'
                      }`}>
                        Som platca DPH
                      </span>
                    </button>
                  </div>

                  {formData.isVatPayer && (
                    <div className="md:w-1/2 animate-in slide-in-from-top-2 duration-300">
                      <FormLabel>IČ DPH</FormLabel>
                      <input type="text" value={formData.icDph} onChange={(e) => setFormData({...formData, icDph: e.target.value})} placeholder="SK2121022992" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-end">
                  <button type="submit" disabled={loading} className="bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-all flex items-center gap-2">
                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Uložiť údaje firmy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center gap-3">
                 <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                   <Lock size={18} className="text-brand-orange" />
                 </div>
                 <h2 className="text-lg font-semibold text-white">Zabezpečenie účtu</h2>
              </div>
              <form onSubmit={changePassword} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel>Nové heslo</FormLabel>
                    <input type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} placeholder="••••••••" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Potvrdiť nové heslo</FormLabel>
                    <input type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} placeholder="••••••••" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="pt-6">
                   <button type="submit" disabled={loading} className="w-full bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <KeyRound size={18} />} Zmeniť heslo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'team' && isCompanyAdmin() && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center gap-3">
                 <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                   <Users size={18} className="text-brand-orange" />
                 </div>
                 <h2 className="text-lg font-semibold text-white">Môj Tím</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6 text-center md:text-left">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">ID vašej organizácie</h3>
                    <p className="text-slate-500 text-sm mt-1">Tento unikátny kód slúži na priradenie zamestnancov k vašej firme.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 w-fit mx-auto md:mx-0">
                    <code className="font-mono text-lg font-semibold text-slate-800 tracking-wider px-2 uppercase">{currentOrgId}</code>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(currentOrgId); setCopied(true); setTimeout(() => setCopied(false), 2000); showToast('ID skopírované', 'success'); }}
                      className={`p-2 rounded-lg transition-all ${copied ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-800'}`}
                    >
                      {copied ? <CheckCircle2 size={18}/> : <Copy size={18}/>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
