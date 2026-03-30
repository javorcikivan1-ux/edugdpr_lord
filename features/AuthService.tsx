
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setState({ user: mapUser(session.user), isAuthenticated: true, loading: false, error: null });
      } else {
        setState({ user: null, isAuthenticated: false, loading: false, error: null });
      }
    } catch (e) {
      setState({ user: null, isAuthenticated: false, loading: false, error: null });
    }
  };

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setState({ user: mapUser(session.user), isAuthenticated: true, loading: false, error: null });
      } else {
        setState({ user: null, isAuthenticated: false, loading: false, error: null });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setState(p => ({ ...p, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState(p => ({ ...p, loading: false, error: error.message }));
      return false;
    }
    return true;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      // Ignorujeme špecificky 403 Forbidden chyby - sú bežné pri expirovaných sessionoch
      if (error?.status !== 403) {
        console.warn('Supabase logout error:', error);
      }
    } finally {
      // Vždy vyčistíme lokálny stav, nezávisle od toho, či Supabase logout zlyhal
      setState({ user: null, loading: false, error: null });
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
