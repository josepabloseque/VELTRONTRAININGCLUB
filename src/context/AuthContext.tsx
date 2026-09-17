import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { Membership } from '../types/database';

interface AuthContextType {
  user: User | null;
  membership: Membership | null;
  isActive: boolean;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMembership: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  membership: null,
  isActive: false,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshMembership: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMembership = async (userId: string) => {
    const { data } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    setMembership(data);
    setLoading(false);
  };

  useEffect(() => {
    // 1. Carga inicial rápida desde sesión local
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      if (currentUser) {
        setUser(currentUser);
        loadMembership(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Obtener datos frescos del servidor (actualizaciones de metadata en Supabase)
    supabase.auth.getUser().then(({ data: { user: freshUser } }) => {
      if (freshUser) {
        setUser(freshUser);
        loadMembership(freshUser.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadMembership(currentUser.id);
      } else {
        setMembership(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Verificación estricta de rol en backend (Auth metadata o Membership role)
  const isAdmin = Boolean(
    user?.app_metadata?.role === 'admin' || 
    user?.user_metadata?.role === 'admin' ||
    user?.user_metadata?.isAdmin === true ||
    (membership as unknown as { role?: string })?.role === 'admin'
  );

  // Un admin siempre está activo. Para atletas: status active y (expires_at null o fecha futura)
  const isActive = Boolean(
    isAdmin || 
    (membership?.status === 'active' && (
      membership.expires_at === null || 
      new Date(membership.expires_at).getTime() > Date.now()
    ))
  );

  const refreshMembership = async () => {
    if (user) {
      await loadMembership(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        membership,
        isActive,
        isAdmin,
        loading,
        signOut,
        refreshMembership,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);