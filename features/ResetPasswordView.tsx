import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff, Check, RefreshCw } from 'lucide-react';

const LOGO_WHITE = "/biele.png";

export const ResetPasswordView = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Získanie tokenu z URL
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } else {
      setError('Neplatný alebo expirovaný odkaz na obnovu hesla.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Heslá sa nezhodujú!');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mať aspoň 6 znakov.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Došlo k chybe pri zmene hesla.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001a2e] via-[#002b4e] to-[#003d5c] flex items-center justify-center p-4 overflow-hidden relative font-sans">
        <div className="absolute inset-0 z-0"></div>
        
        <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in duration-700">
          <div className="bg-white/8 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-5xl">
                <Check size={40} />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">Heslo bolo úspešne zmenené</h2>
              <p className="text-white/60">Vaše heslo bolo úspešne aktualizované. Teraz sa môžete prihlásiť s novým heslom.</p>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white py-3 rounded-xl font-bold uppercase text-sm tracking-normal shadow-lg hover:shadow-brand-orange/25 active:scale-[0.98] transition-all hover:from-brand-orange/95 hover:to-brand-orange/85"
              >
                Prejsť na prihlásenie
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a2e] via-[#002b4e] to-[#003d5c] flex items-center justify-center p-4 overflow-hidden relative font-sans">
      <div className="absolute inset-0 z-0"></div>
      
      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in duration-700">
        <div className="bg-white/8 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <img src={LOGO_WHITE} alt="Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white">Nastavenie nového hesla</h2>
            <p className="text-white/60 text-sm mt-2">Zadajte vaše nové heslo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/80 ml-2">Nové heslo</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-orange transition-colors" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" 
                  placeholder="••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-white/80 ml-2">Potvrďte nové heslo</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-orange transition-colors" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white text-base font-medium focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange/50 outline-none transition-all placeholder-white/40" 
                  placeholder="••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm font-medium rounded-xl text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white py-3 rounded-xl font-bold uppercase text-sm tracking-normal shadow-lg hover:shadow-brand-orange/25 active:scale-[0.98] transition-all disabled:opacity-50 hover:from-brand-orange/95 hover:to-brand-orange/85"
            >
              {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'Nastaviť nové heslo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
