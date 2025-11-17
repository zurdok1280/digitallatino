/*import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
  */

// src/hooks/useAuth.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode, useRef} from 'react';
import { jwtDecode } from 'jwt-decode'; 
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: { email: string; role: string; firstName: string } | null; 
  login: (token: string) => void;
  logout: () => void;
  showLoginDialog: boolean;
  setShowLoginDialog: (isOpen: boolean) => void;
}
interface DecodedToken {
  email: string;
  role: string;
  firstName: string;
  exp: number; // exp: number
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; role: string; firstName: string } | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const navigate = useNavigate();
  const logoutTimer = useRef<NodeJS.Timeout | null>(null);


  //Function to start the logout logoutTimer
  const startLogoutTimer = (expirationTime: number) => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }
    const currentTime = Date.now();
    const expiresIn = (expirationTime * 1000) - currentTime;
    if (expiresIn <= 0) {
      logout();
      return;
    }
    const timerDuration = expiresIn - 10000;
    if (timerDuration > 0) {
      logoutTimer.current = setTimeout(() => {
        console.log("Token a punto de expirar. Cerrando sesión automáticamente.");
        logout();
        }, timerDuration);
      }
    };



  
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decoded: DecodedToken = jwtDecode(storedToken);
        if (decoded.exp * 1000 < Date.now()) {
          throw new Error("Token expirado");
        }
        
        //const decoded: { email: string; role: string; firstName: string } = jwtDecode(storedToken);
        setUser({ email: decoded.email, role: decoded.role, firstName: decoded.firstName });
        setToken(storedToken);
        startLogoutTimer(decoded.exp);

      } catch (error) {
        
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  
  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken); 
    try {
      const decoded: DecodedToken = jwtDecode(newToken);
      //const decoded: { email: string; role: string; firstName: string } = jwtDecode(newToken);
      setUser({ email: decoded.email, role: decoded.role, firstName: decoded.firstName });
      setToken(newToken); 
      startLogoutTimer(decoded.exp);// Start to timer
    } catch (error) {
      console.error("Token JWT inválido:", error);
    }
  };

  
  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
    navigate('/', { replace: true });
  };

  const isAuthenticated = !!token;

  
  const value = { token, 
    isAuthenticated,
     user,
      login,
      logout,
      showLoginDialog,
      setShowLoginDialog
     };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
