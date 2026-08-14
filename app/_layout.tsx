import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { AppAuthProvider } from '@/auth/AppAuthProvider';
import { RetornaStoreProvider } from '@/data/store';
import { RetornaThemeProvider, useTheme } from '@/design/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: 0 },
  },
});

function RootNavigator() {
  const { isDark, colors } = useTheme();
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
          <RetornaStoreProvider>
            <RootNavigator />
          </RetornaStoreProvider>
        </AppAuthProvider>
      </RetornaThemeProvider>
    </QueryClientProvider>
  );
}
