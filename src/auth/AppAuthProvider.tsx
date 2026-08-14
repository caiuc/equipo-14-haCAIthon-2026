import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Database } from '@/data/database.types';
import { requireSupabase, supabase, supabaseConfigurationError } from '@/data/supabase';

export type AuthProfile = Database['public']['Tables']['profiles']['Row'];

interface Credentials {
  email: string;
  password: string;
}

interface Registration extends Credentials {
  displayName: string;
}

interface AppAuthValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  isDemoMode: boolean;
  configurationError?: string;
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  identityName?: string;
  identityEmail?: string;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (registration: Registration) => Promise<void>;
  enterDemo: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AppAuthValue | null>(null);

function fallbackProfile(user: User): AuthProfile {
  const displayName = typeof user.user_metadata.display_name === 'string'
    ? user.user_metadata.display_name
    : user.email?.split('@')[0] ?? 'Usuario Retorna';
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'RT';
  return {
    id: user.id,
    username: user.email?.split('@')[0] ?? user.id.slice(0, 8),
    display_name: displayName,
    initials,
    avatar_color: '#FF6246',
    bio: null,
    affiliation: null,
    campus: null,
    created_at: user.created_at,
  };
}

export function AppAuthProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(!supabase);

  const loadProfile = useCallback(async (user: User | null) => {
    if (!user || !supabase) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) throw new Error('No pudimos cargar tu perfil. Inténtalo nuevamente.');
    setProfile(data ?? fallbackProfile(user));
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return;
      if (error) throw error;
      setSession(data.session);
      await loadProfile(data.session?.user ?? null);
    }).catch(() => {
      if (active) {
        setSession(null);
        setProfile(null);
      }
    }).finally(() => {
      if (active) setIsLoaded(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      void loadProfile(nextSession?.user ?? null).finally(() => setIsLoaded(true));
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async ({ email, password }: Credentials) => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithPassword({ email: email.trim().toLocaleLowerCase('es-CL'), password });
    if (error) throw new Error(error.status === 400 ? 'El correo o la contraseña no son correctos.' : 'No pudimos iniciar sesión. Inténtalo nuevamente.');
  }, []);

  const signUp = useCallback(async ({ displayName, email, password }: Registration) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email: email.trim().toLocaleLowerCase('es-CL'),
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    if (error) {
      if (error.status === 422 || error.message.toLowerCase().includes('registered')) throw new Error('Ya existe una cuenta con ese correo.');
      throw new Error('No pudimos crear la cuenta. Revisa los datos e inténtalo nuevamente.');
    }
    if (!data.session) throw new Error('La cuenta fue creada, pero el proyecto Supabase exige confirmar correo. Desactiva esa opción para este MVP.');
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      return;
    }
    const client = requireSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw new Error('No pudimos cerrar la sesión. Inténtalo nuevamente.');
  }, [isDemoMode]);

  const value = useMemo<AppAuthValue>(() => ({
    isLoaded,
    isSignedIn: Boolean(session) || isDemoMode,
    isDemoMode,
    configurationError: supabaseConfigurationError,
    session,
    user: session?.user ?? null,
    profile,
    identityName: isDemoMode ? 'Martina Rojas' : profile?.display_name,
    identityEmail: isDemoMode ? 'martina@demo.retorna.cl' : session?.user.email,
    signIn,
    signUp,
    enterDemo: () => setIsDemoMode(true),
    signOut,
    refreshProfile: () => loadProfile(session?.user ?? null),
  }), [isDemoMode, isLoaded, loadProfile, profile, session, signIn, signOut, signUp]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAppAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAppAuth debe usarse dentro de AppAuthProvider.');
  return value;
}
