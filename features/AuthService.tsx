
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE_EVENT, disableDemoMode, getDemoRole, isDemoMode } from '../lib/demoMode';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'company_admin' | 'employee';
  companyId?: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isCompanyAdmin: () => boolean;
  isEmployee: () => boolean;
} | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  const getDemoUser = (): User => {
    const role = getDemoRole();
    const isCompanyDemo = role === 'company_admin';
    return {
      id: 'demo',
      email: isCompanyDemo ? 'demo@edugdpr.sk' : 'jan.novak@demo.sk',
      firstName: isCompanyDemo ? 'Vaša organizácia' : 'Ján',
      lastName: isCompanyDemo ? 's.r.o.' : 'Novák',
      role,
      companyId: 'DEMO',
      permissions: []
    };
  };

  const mapUser = (user: any): User => {
    const meta = user.user_metadata || {};
    let role: 'super_admin' | 'company_admin' | 'employee' = 'employee';
    
    if (meta.role === 'SUPER_ADMIN' || user.email === 'sluzby@lordsbenison.eu') role = 'super_admin';
    else if (meta.role === 'COMPANY') role = 'company_admin';
    
    // PRIORITA: Najprv skúsime firstName/lastName, až potom splitovanie full_name
    const fName = meta.firstName || meta.full_name?.split(' ')[0] || 'Užívateľ';
    const lName = meta.lastName || meta.full_name?.split(' ').slice(1).join(' ') || '';
    
    return {
      id: user.id,
      email: user.email || '',
      firstName: fName,
      lastName: lName,
      role: role,
      companyId: meta.company_token || meta.token,
      permissions: []
    };
  };

  const checkUser = async () => {
    try {
      // DEMO režim má prioritu pred Supabase session
      if (isDemoMode()) {
        setState({ user: getDemoUser(), isAuthenticated: true, loading: false, error: null });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setState({ user: mapUser(session.user), isAuthenticated: true, loading: false, error: null });
      } else {
        setState({ user: null, isAuthenticated: false, loading: false, error: null });
      }
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('Invalid Refresh Token')) {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
      }
      setState({ user: null, isAuthenticated: false, loading: false, error: null });
    }
  };

  useEffect(() => {
    checkUser();

    // V DEMO režime nechceme, aby Supabase onAuthStateChange prepisoval lokálny demo stav.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isDemoMode()) return;
      if (session?.user) {
        setState({ user: mapUser(session.user), isAuthenticated: true, loading: false, error: null });
      } else {
        setState({ user: null, isAuthenticated: false, loading: false, error: null });
      }
    });

    // Sync demo role / zapnutie-vypnutie dema v rámci tej istej karty
    const handleDemoChanged = () => {
      if (isDemoMode()) {
        setState({ user: getDemoUser(), isAuthenticated: true, loading: false, error: null });
      } else {
        // po vypnutí dema skontrolujeme reálnu session
        checkUser();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener(DEMO_MODE_EVENT as any, handleDemoChanged);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener(DEMO_MODE_EVENT as any, handleDemoChanged);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setState(p => ({ ...p, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Preklad error message do slovenčiny
      let slovakError = error.message;
      if (error.message.includes('Invalid login credentials')) {
        slovakError = 'Nesprávne prihlasovacie údaje';
      } else if (error.message.includes('Email not confirmed')) {
        slovakError = 'E-mail nebol potvrdený';
      } else if (error.message.includes('Too many requests')) {
        slovakError = 'Príliš veľa pokusov, skúste to neskôr';
      }
      setState(p => ({ ...p, loading: false, error: slovakError }));
      return false;
    }
    return true;
  };

  const logout = async () => {
    if (isDemoMode()) {
      disableDemoMode();
      setState({ user: null, isAuthenticated: false, loading: false, error: null });
      return;
    }
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      // Ignorujeme špecificky 403 Forbidden chyby - sú bežné pri expirovaných sessionoch
      if (error?.status !== 403) {
        console.warn('Supabase logout error:', error);
      }
    } finally {
      // Vždy vyčistíme lokálny stav, nezávisle od toho, či Supabase logout zlyhal
      setState({ user: null, isAuthenticated: false, loading: false, error: null });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      state, login, logout, 
      isAdmin: () => state.user?.role === 'super_admin',
      isCompanyAdmin: () => state.user?.role === 'company_admin',
      isEmployee: () => state.user?.role === 'employee'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
