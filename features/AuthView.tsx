
import React, { useState, useEffect, useRef } from 'react';
import { AuthMode } from '../types';
import { supabase } from '../lib/supabase';
import { 
  Eye, EyeOff, Lock, Mail, ChevronRight, ShieldCheck, Zap, 
  Globe, Star, LogIn, Building2, UserPlus, ArrowLeft, Check, 
  Briefcase, User, RefreshCw
} from 'lucide-react';

const LOGO_WHITE = "/biele.png";

interface AuthViewProps {
  onSuccess: (role: string) => void;
  onCancel: () => void;
  initialMode?: AuthMode;
}

type ViewMode = 'LOGIN' | 'CHOICE' | 'REGISTER_STEP1' | 'REGISTER_STEP2' | 'JOIN_STEP1' | 'JOIN_STEP2' | 'FORGOT_PASSWORD';

export const AuthView = ({ onSuccess, onCancel, initialMode = 'LOGIN' }: AuthViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode as ViewMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  
  // Data pre registráciu
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    inviteToken: '',
    password: '',
    confirmPassword: ''
  });

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Skontroluj, či je pozvánka v URL a nastav appropriate view mode
  useEffect(() => {
    // Najprv skontroluj URL parameter pri prvom načítaní
    const urlParams = new URLSearchParams(window.location.search);
    const urlCompanyToken = urlParams.get('companyToken');
    
    if (urlCompanyToken) {
      // Ak je token v URL, nastav ho a ulož
      setInviteToken(urlCompanyToken);
      setViewMode('JOIN_STEP1');
      localStorage.setItem('inviteCompanyToken', urlCompanyToken);
      return;
    }
    
    // Potom skontroluj localStorage
    const inviteCompanyToken = localStorage.getItem('inviteCompanyToken');
    
    if (inviteCompanyToken && (viewMode === 'LOGIN' || viewMode === 'JOIN_COMPANY')) {
      setInviteToken(inviteCompanyToken);
      setViewMode('JOIN_STEP1');
    }
  }, [viewMode]);

  // Samostatný useEffect pre prvotnú kontrolu URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCompanyToken = urlParams.get('companyToken');
    
    console.log('URL company token:', urlCompanyToken);
    
    if (urlCompanyToken) {
      console.log('Setting invite token:', urlCompanyToken);
      setInviteToken(urlCompanyToken);
      setViewMode('JOIN_STEP1');
      localStorage.setItem('inviteCompanyToken', urlCompanyToken);
      
      // Zároveň nastav aj v regData
      updateRegData('inviteToken', urlCompanyToken);
    }
  }, []); // Prázdne dependencies = spustí sa len raz

  // Helper funkcie pre 2-krokovú registráciu
  const updateRegData = (field: string, value: string) => {
    setRegData(prev => ({ ...prev, [field]: value }));
  };

  const resetRegData = () => {
    setRegData({
      fullName: '',
      email: '',
      companyName: '',
      inviteToken: '',
      password: '',
      confirmPassword: ''
    });
    setConfirmPassword('');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccessMsg('Link na obnovu hesla bol odoslaný na váš e-mail. Skontrolujte si schránku.');
      setResetEmail('');
      // Po 3 sekundách presmerujeme späť na login
      setTimeout(() => {
        setViewMode('LOGIN');
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Došlo k chybe pri odosielaní e-mailu.');
    } finally {
      setLoading(false);
    }
  };

  const particlesInitRef = useRef(false);

  useEffect(() => {
    if (!particlesInitRef.current && (window as any).tsParticles) {
      (window as any).tsParticles.load("auth-tsparticles", {
        fpsLimit: 60,
        interactivity: {
          events: { onHover: { enable: true, mode: "grab" }, onClick: { enable: true, mode: "push" }, resize: true },
          modes: { grab: { distance: 180, links: { opacity: 0.4 } }, push: { quantity: 4 } }
        },
        particles: {
          color: { value: ["#ffffff", "#F7941D"] },
          links: { color: "#ffffff", distance: 130, enable: true, opacity: 0.08, width: 1 },
          move: { enable: true, speed: 0.5, direction: "none", outModes: { default: "out" } },
          number: { density: { enable: true, area: 800 }, value: 90 },
          opacity: { value: { min: 0.1, max: 0.4 } },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2 } }
        },
        detectRetina: true
      });
      particlesInitRef.current = true;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Pre 2-krokovú registráciu použijeme data z regData
    const finalFullName = regData.fullName || fullName;
    const finalEmail = regData.email || email;
    const finalPassword = regData.password || password;
    const finalConfirmPassword = regData.confirmPassword || confirmPassword;
    const finalCompanyName = regData.companyName || companyName;
    const finalInviteToken = regData.inviteToken || inviteToken;

    // Validácia hesiel pre registráciu
    if (viewMode !== 'LOGIN' && finalPassword !== finalConfirmPassword) {
      setError('Heslá sa nezhodujú!');
      setLoading(false);
      return;
    }

    const nameParts = finalFullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Užívateľ';
    const lastName = nameParts.slice(1).join(' ') || ' ';

    try {
      if (viewMode === 'REGISTER_STEP2') {
        const role = 'COMPANY';
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: finalEmail,
          password: finalPassword,
          options: { 
            data: { role, company_name: finalCompanyName, full_name: finalFullName, firstName, lastName } 
          }
        });
        
        if (signUpError) throw signUpError;
        if (!data.user) throw new Error("Chyba účtu.");

        const myToken = `LB-${data.user.id.slice(0, 8).toUpperCase()}`;
        
        await supabase.from('employees').insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          full_name: finalFullName,
          email: finalEmail,
          company_token: myToken,
          position: 'ADMIN_ROOT',
          company_name: finalCompanyName,
          status: 'ACTIVE'
        });

        // LOG AKTIVITY PRE FIRMU
        await supabase.from('activity_log').insert({
          company_token: myToken,
          user_name: 'Systém',
          action_text: `Založený účet firmy: ${finalCompanyName}`,
          action_type: 'REGISTRATION'
        });

        setSuccessMsg('Firma úspešne registrovaná! Potvrďte prosím svoj e-mail v schránke a následne sa prihláste.');
        resetRegData();
      } 
      else if (viewMode === 'JOIN_STEP2') {
        const token = finalInviteToken.trim().toUpperCase();
        
        // Najprv skontrolujeme, či firma s týmto kódom existuje
        const { data: companyData, error: companyError } = await supabase
          .from('employees')
          .select('company_token, company_name')
          .eq('company_token', token)
          .eq('position', 'ADMIN_ROOT')
          .single();
        
        if (companyError || !companyData) {
          setError('Neplatný pozývací kód. Firma s týmto kódom neexistuje.');
          setLoading(false);
          return;
        }
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: finalEmail,
          password: finalPassword,
          options: { 
            data: { 
              role: 'EMPLOYEE', 
              full_name: finalFullName, 
              position, 
              company_token: token,
              token: token,
              firstName,
              lastName
            } 
          }
        });
        
        if (signUpError) throw signUpError;
        if (!data.user) throw new Error("Chyba účtu.");

        await supabase.from('employees').insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          full_name: finalFullName,
          email: finalEmail,
          status: 'ACTIVE',
          company_token: token,
          position: position
        });

        // LOG AKTIVITY PRE FIRMU (Admin uvidí nového človeka)
        await supabase.from('activity_log').insert({
          company_token: token,
          user_name: finalFullName,
          action_text: `Nový člen sa pridal k tímu (${position}).`,
          action_type: 'JOIN'
        });
        
        setSuccessMsg('Registrácia úspešná! Skontrolujte si e-mailovú schránku.');
        resetRegData();
      } 
      else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onSuccess(data.user?.user_metadata?.role || 'EMPLOYEE');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="min-h-screen bg-[#002b4e] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] p-10 max-w-md w-full text-center space-y-6 shadow-2xl animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-5xl animate-bounce">📩</div>
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-black text-white tracking-tight">E-mail odoslaný</h2>
            <p className="text-white/60 text-base leading-relaxed font-medium">{successMsg}</p>
          </div>
          <button onClick={() => setViewMode('LOGIN')} className="w-full py-3 bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white rounded-xl font-bold uppercase text-sm tracking-normal shadow-lg hover:shadow-brand-orange/25 hover:scale-[1.02] transition-all">
            Prejsť na prihlásenie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a2e] via-[#002b4e] to-[#003d5c] flex items-center justify-center p-4 overflow-hidden relative font-sans">
      <div id="auth-tsparticles" className="absolute inset-0 z-0"></div>
      
      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in duration-700">
        <div className="bg-white/8 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl p-8">
          {viewMode === 'LOGIN' && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center cursor-pointer" onClick={onCancel}>
                <img src={LOGO_WHITE} alt="Logo" className="h-16 w-auto object-contain" />
              </div>
            </div>
          )}

          <div className="space-y-4">
              
              {viewMode === 'LOGIN' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-white/80 ml-2">E-mail</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-orange transition-colors" />
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="vas@email.sk" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-white/80 ml-2">Heslo</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-orange transition-colors" />
                          <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="••••••" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm font-medium text-rose-200 rounded-xl text-center">{error}</div>}

                    <div className="flex justify-start pt-2">
                      <button type="button" onClick={() => setViewMode('FORGOT_PASSWORD')} className="text-sm font-medium text-white/40 hover:text-brand-orange transition-colors">
                        Zabudol som heslo
                      </button>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white py-3 rounded-xl font-bold uppercase text-sm tracking-normal shadow-lg hover:shadow-brand-orange/25 active:scale-[0.98] transition-all disabled:opacity-50 hover:from-brand-orange/95 hover:to-brand-orange/85">
                      {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'Prihlásiť sa'}
                    </button>

                    <div className="flex justify-between items-center pt-2">
                      <button type="button" onClick={() => setViewMode('CHOICE')} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                        Nemáte účet? <span className="text-brand-orange underline">Zaregistrujte sa</span>
                      </button>
                      <button onClick={onCancel} className="text-sm font-medium text-white/40 hover:text-white transition-colors">
                        Späť
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {viewMode === 'CHOICE' && (
                <div className="space-y-4 animate-in zoom-in duration-500">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white relative inline-block pb-1">
                      Vyberte si, kto sa registruje
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"></div>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => setViewMode('JOIN_STEP1')} className="group flex items-center gap-3 bg-white/8 border border-white/10 hover:border-brand-blue/50 p-4 rounded-xl transition-all hover:bg-white/12 hover:scale-[1.01]">
                       <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:bg-brand-blue group-hover:text-white transition-all shadow-lg border-2 border-brand-blue/40"><UserPlus size={20} /></div>
                       <div className="text-left">
                          <h4 className="text-white font-semibold text-base">Zamestnanec</h4>
                          <p className="text-white/50 text-sm mt-1">Mám pozývací kód</p>
                       </div>
                    </button>

                    <button onClick={() => setViewMode('REGISTER_STEP1')} className="group flex items-center gap-3 bg-white/8 border border-white/10 hover:border-brand-orange/50 p-4 rounded-xl transition-all hover:bg-white/12 hover:scale-[1.01]">
                       <div className="w-12 h-12 bg-brand-orange/20 rounded-xl flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all shadow-lg"><Building2 size={20} /></div>
                       <div className="text-left">
                          <h4 className="text-white font-semibold text-base">Zamestnávateľ</h4>
                          <p className="text-white/50 text-sm mt-1">Registrujem firmu</p>
                       </div>
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button onClick={() => setViewMode('LOGIN')} className="text-sm font-medium text-white/50 hover:text-white transition-colors">
                      <ArrowLeft size={14} className="inline mr-2" /> Späť na prihlásenie
                    </button>
                    <button onClick={onCancel} className="text-sm font-medium text-white/40 hover:text-white transition-colors">
                      Zrušiť
                    </button>
                  </div>
                </div>
              )}

              {viewMode === 'REGISTER_STEP1' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex justify-center mb-4">
                    <div className="flex-1 max-w-md">
                      <div className="flex items-center justify-center mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-brand-orange text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                          <div className="w-12 h-1 bg-brand-orange rounded-full"></div>
                          <div className="w-8 h-8 bg-white/20 text-white/60 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        </div>
                      </div>
                      <p className="text-center text-white/80 text-sm font-medium">Základné údaje</p>
                    </div>
                  </div>

                  <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setViewMode('REGISTER_STEP2'); }}>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80 ml-2">Názov spoločnosti</label>
                      <input type="text" value={regData.companyName} onChange={e => updateRegData('companyName', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="Firma s.r.o." />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80 ml-2">Celé meno</label>
                      <input type="text" value={regData.fullName} onChange={e => updateRegData('fullName', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="Ján Novák" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80 ml-2">E-mail</label>
                      <input type="email" value={regData.email} onChange={e => updateRegData('email', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="vas@email.sk" />
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white py-3 rounded-xl font-bold uppercase text-sm tracking-normal shadow-lg mt-4 hover:shadow-brand-orange/25 active:scale-[0.98] transition-all hover:from-brand-orange/95 hover:to-brand-orange/85">
                      Pokračovať na krok 2
                    </button>

                    <div className="flex justify-between items-center pt-2">
                      <button type="button" onClick={() => setViewMode('CHOICE')} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                        <ArrowLeft size={14} className="inline mr-2" /> Späť
                      </button>
                      <button onClick={onCancel} className="text-sm font-medium text-white/40 hover:text-white transition-colors">
                        Zrušiť
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {viewMode === 'REGISTER_STEP2' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex justify-center mb-4">
                    <div className="flex-1 max-w-md">
                      <div className="flex items-center justify-center mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                          <div className="w-12 h-1 bg-brand-orange rounded-full"></div>
                          <div className="w-8 h-8 bg-brand-orange text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        </div>
                      </div>
                      <p className="text-center text-white/80 text-sm font-medium">Heslo a súhlasy</p>
                    </div>
                  </div>

                  <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80 ml-2">Heslo</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-orange transition-colors" />
                        <input type={showPassword ? 'text' : 'password'} value={regData.password} onChange={e => updateRegData('password', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80 ml-2">Zopakujte heslo</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-orange transition-colors" />
                        <input type={showConfirmPassword ? 'text' : 'password'} value={regData.confirmPassword} onChange={e => updateRegData('confirmPassword', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="••••••" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={gdprConsent} 
                            onChange={e => setGdprConsent(e.target.checked)}
                            className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-white/5 checked:bg-brand-orange checked:border-brand-orange transition-all cursor-pointer"
                          />
                          <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <span className="text-xs text-white/60 leading-tight group-hover:text-white/80 transition-colors">
                          Súhlasím so spracovaním osobných údajov (GDPR)
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={termsConsent} 
                            onChange={e => setTermsConsent(e.target.checked)}
                            className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-white/5 checked:bg-brand-orange checked:border-brand-orange transition-all cursor-pointer"
                          />
                          <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <span className="text-xs text-white/60 leading-tight group-hover:text-white/80 transition-colors">
                          Súhlasím s obchodnými podmienkami a podmienkami používania
                        </span>
                      </label>
                    </div>

                    {error && <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm font-medium text-rose-200 rounded-xl text-center">{error}</div>}

                    <button type="submit" disabled={loading || !gdprConsent || !termsConsent} className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white py-3 rounded-xl font-bold uppercase text-sm tracking-normal shadow-lg mt-4 disabled:opacity-50 hover:shadow-brand-orange/25 active:scale-[0.98] transition-all hover:from-brand-orange/95 hover:to-brand-orange/85">
                      {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'Vytvoriť účet'}
                    </button>

                    <div className="flex justify-between items-center pt-2">
                      <button type="button" onClick={() => setViewMode('REGISTER_STEP1')} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                        <ArrowLeft size={14} className="inline mr-2" /> Späť
                      </button>
                      <button onClick={onCancel} className="text-sm font-medium text-white/40 hover:text-white transition-colors">
                        Zrušiť
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {viewMode === 'JOIN_STEP1' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex justify-center mb-8">
                    <div className="flex items-center cursor-pointer" onClick={onCancel}>
                      <img src={LOGO_WHITE} alt="Logo" className="h-16 w-auto object-contain" />
                    </div>
                  </div>

                  <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setViewMode('JOIN_STEP2'); }}>
                    <div className="p-4 bg-brand-blue/10 border border-brand-blue/20 rounded-xl space-y-2">
                      <label className="text-sm font-semibold text-white/80 ml-1">Kód od zamestnávateľa</label>
                      <input type="text" value={regData.inviteToken} onChange={e => updateRegData('inviteToken', e.target.value.toUpperCase())} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 text-center text-white font-mono font-semibold text-lg tracking-normal outline-none focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 transition-all placeholder-white/40" placeholder="LB-XXXX" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80 ml-2">Celé meno</label>
                      <input type="text" value={regData.fullName} onChange={e => updateRegData('fullName', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="Ján Novák" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80 ml-2">E-mail</label>
                      <input type="email" value={regData.email} onChange={e => updateRegData('email', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="vas@email.sk" />
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white py-3 rounded-xl font-bold uppercase text-sm tracking-normal shadow-lg mt-4 hover:shadow-brand-orange/25 active:scale-[0.98] transition-all hover:from-brand-orange/95 hover:to-brand-orange/85">
                      Pokračovať na krok 2
                    </button>

                    <div className="flex justify-between items-center pt-2">
                      <button type="button" onClick={() => setViewMode('CHOICE')} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                        <ArrowLeft size={14} className="inline mr-2" /> Späť
                      </button>
                      <button onClick={onCancel} className="text-sm font-medium text-white/40 hover:text-white transition-colors">
                        Zrušiť
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {viewMode === 'JOIN_STEP2' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex justify-center mb-8">
                    <div className="flex items-center cursor-pointer" onClick={onCancel}>
                      <img src={LOGO_WHITE} alt="Logo" className="h-16 w-auto object-contain" />
                    </div>
                  </div>

                  <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80 ml-2">Heslo</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-orange transition-colors" />
                        <input type={showPassword ? 'text' : 'password'} value={regData.password} onChange={e => updateRegData('password', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80 ml-2">Zopakujte heslo</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-orange transition-colors" />
                        <input type={showConfirmPassword ? 'text' : 'password'} value={regData.confirmPassword} onChange={e => updateRegData('confirmPassword', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" placeholder="••••••" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={gdprConsent} 
                            onChange={e => setGdprConsent(e.target.checked)}
                            className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-white/5 checked:bg-brand-orange checked:border-brand-orange transition-all cursor-pointer"
                          />
                          <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <span className="text-xs text-white/60 leading-tight group-hover:text-white/80 transition-colors">
                          Súhlasím so spracovaním osobných údajov (GDPR)
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={termsConsent} 
                            onChange={e => setTermsConsent(e.target.checked)}
                            className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-white/5 checked:bg-brand-orange checked:border-brand-orange transition-all cursor-pointer"
                          />
                          <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <span className="text-xs text-white/60 leading-tight group-hover:text-white/80 transition-colors">
                          Súhlasím s obchodnými podmienkami a podmienkami používania
                        </span>
                      </label>
                    </div>

                    {error && <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm font-medium text-rose-200 rounded-xl text-center">{error}</div>}

                    <button type="submit" disabled={loading || !gdprConsent || !termsConsent} className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white py-3 rounded-xl font-bold uppercase text-sm tracking-normal shadow-lg mt-4 disabled:opacity-50 hover:shadow-brand-orange/25 active:scale-[0.98] transition-all hover:from-brand-orange/95 hover:to-brand-orange/85">
                      {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'Vytvoriť účet'}
                    </button>

                    <div className="flex justify-between items-center pt-2">
                      <button type="button" onClick={() => setViewMode('JOIN_STEP1')} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                        <ArrowLeft size={14} className="inline mr-2" /> Späť
                      </button>
                      <button onClick={onCancel} className="text-sm font-medium text-white/40 hover:text-white transition-colors">
                        Zrušiť
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {viewMode === 'FORGOT_PASSWORD' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex justify-center mb-6">
                    <div className="flex-1 max-w-md">
                      <h2 className="text-xl font-semibold text-white text-center">Zabudnuté heslo</h2>
                      <p className="text-center text-white/60 text-sm mt-2">Zadajte váš e-mail a pošleme vám link na obnovu</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80 ml-2">E-mail</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-orange transition-colors" />
                        <input 
                          type="email" 
                          value={resetEmail} 
                          onChange={e => setResetEmail(e.target.value)} 
                          required 
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" 
                          placeholder="vas@email.sk" 
                        />
                      </div>
                    </div>

                    {error && <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm font-medium text-rose-200 rounded-xl text-center">{error}</div>}

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white py-3 rounded-xl font-bold uppercase text-sm tracking-normal shadow-lg hover:shadow-brand-orange/25 active:scale-[0.98] transition-all disabled:opacity-50 hover:from-brand-orange/95 hover:to-brand-orange/85">
                      {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'Odoslať link na obnovu'}
                    </button>

                    <div className="flex justify-between items-center pt-2">
                      <button type="button" onClick={() => setViewMode('LOGIN')} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                        <ArrowLeft size={14} className="inline mr-2" /> Späť na prihlásenie
                      </button>
                      <button onClick={onCancel} className="text-sm font-medium text-white/40 hover:text-white transition-colors">
                        Zrušiť
                      </button>
                    </div>
                  </form>
                </div>
              )}

          </div>
        </div>
      </div>
    </div>
  );
};
