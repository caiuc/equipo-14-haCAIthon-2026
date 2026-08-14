import { ClerkProvider, useAuth, useClerk, useUser } from '@clerk/expo';
import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { tokenCache } from '@clerk/expo/token-cache';
import React, { createContext, useContext, useMemo, useState } from 'react';

interface AppAuthValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  isDemo: boolean;
  identityName?: string;
  identityEmail?: string;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AppAuthValue | null>(null);
const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const forceDemo = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
export const isDemoAuth = forceDemo || !clerkKey;

function DemoAuthProvider({ children }: React.PropsWithChildren) {
  const [signedIn, setSignedIn] = useState(false);
  const value = useMemo<AppAuthValue>(() => ({
    isLoaded: true,
    isSignedIn: signedIn,
    isDemo: true,
    identityName: signedIn ? 'Martina Rojas' : undefined,
    identityEmail: signedIn ? 'martina.rojas@uc.cl' : undefined,
    signIn: async () => setSignedIn(true),
    signUp: async () => setSignedIn(true),
    signOut: async () => setSignedIn(false),
  }), [signedIn]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ClerkBridge({ children }: React.PropsWithChildren) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const { startHostedAuth } = useHostedAuth();
  const value = useMemo<AppAuthValue>(() => ({
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    isDemo: false,
    identityName: user?.fullName ?? undefined,
    identityEmail: user?.primaryEmailAddress?.emailAddress,
    signIn: async () => { await startHostedAuth({ mode: 'sign-in' }); },
    signUp: async () => { await startHostedAuth({ mode: 'sign-up' }); },
    signOut: async () => { await clerk.signOut(); },
  }), [clerk, isLoaded, isSignedIn, startHostedAuth, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AppAuthProvider({ children }: React.PropsWithChildren) {
  if (isDemoAuth) return <DemoAuthProvider>{children}</DemoAuthProvider>;
  return (
    <ClerkProvider publishableKey={clerkKey!} tokenCache={tokenCache}>
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}

export function useAppAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAppAuth debe usarse dentro de AppAuthProvider.');
  return value;
}
