import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppAuthProvider, useAppAuth } from '@/auth/AppAuthProvider';
import { allowRecyclePreviewWithoutAuth } from '@/auth/preview';
import { RetornaStoreProvider } from '@/data/store';
import { RetornaMark } from '@/design/Logo';
import { RetornaThemeProvider, useTheme } from '@/design/theme';
import { OrganizationProvider } from '@/features/organizations/OrganizationProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: 0 },
  },
});

function RootNavigator() {
  const auth = useAppAuth();
  const { isDark, colors } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const firstSegment = segments[0];
  const isRecyclePreview = allowRecyclePreviewWithoutAuth && firstSegment === 'recycle';
  const isPublic = firstSegment === undefined || firstSegment === 'sign-in' || firstSegment === 'sign-up' || isRecyclePreview;

  useEffect(() => {
    if (!auth.isLoaded) return;
    if (!auth.isSignedIn && !isPublic) router.replace('/sign-in');
    if (auth.isSignedIn && (firstSegment === 'sign-in' || firstSegment === 'sign-up')) router.replace('/home');
  }, [auth.isLoaded, auth.isSignedIn, firstSegment, isPublic, router]);

  if (!isRecyclePreview && (!auth.isLoaded || (!auth.isSignedIn && !isPublic))) {
    return <View style={[styles.loading, { backgroundColor: colors.background }]}><RetornaMark size={58} /><ActivityIndicator color={colors.primary} /></View>;
  }
  return <>
    <StatusBar style={isDark ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'fade' }} />
  </>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RetornaThemeProvider>
        <AppAuthProvider>
          <OrganizationProvider>
            <RetornaStoreProvider>
              <RootNavigator />
            </RetornaStoreProvider>
          </OrganizationProvider>
        </AppAuthProvider>
      </RetornaThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
});
