import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, avatarIcon: string) => Promise<{ error: Error | null }>;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const signUp = async (email: string, password: string, username: string, avatarIcon: string) => {
    const redirectUrl = 'https://www.porelas.online/auth';
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          avatar_icon: avatarIcon,
          terms_accepted: true,
        },
      },
    });
    
    return { error };
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    // Check if input is email or username
    const isEmail = emailOrUsername.includes('@');
    
    if (isEmail) {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });
      return { error };
    } else {
      // Find email by username first
      const { data: profile, error: profileError } = await supabase
        .rpc('check_username_available', { username_to_check: emailOrUsername });
      
      if (profileError || profile === true) {
        return { error: new Error('Usuário não encontrado') };
      }

      // For username login, we need to get the user's email
      // This requires a different approach - we'll use a workaround
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });
      
      if (error?.message?.includes('Invalid login credentials')) {
        return { error: new Error('Credenciais inválidas. Tente usar seu e-mail.') };
      }
      
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.porelas.online/reset-password',
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};