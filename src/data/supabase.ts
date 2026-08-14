import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabaseConfigurationError = !supabaseUrl || !supabaseKey
  ? 'Falta configurar EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
  : undefined;

const nativeStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// expo export --platform web pre-renders routes in Node, where `window` does not
// exist; AsyncStorage's web adapter touches it eagerly, so guard for SSR there.
const ssrSafeWebStorage = {
  getItem: (key: string) => (typeof window === 'undefined' ? Promise.resolve(null) : AsyncStorage.getItem(key)),
  setItem: (key: string, value: string) => (typeof window === 'undefined' ? Promise.resolve() : AsyncStorage.setItem(key, value)),
  removeItem: (key: string) => (typeof window === 'undefined' ? Promise.resolve() : AsyncStorage.removeItem(key)),
};

export const supabase: SupabaseClient<Database> | null = supabaseUrl && supabaseKey
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        storage: Platform.OS === 'web' ? ssrSafeWebStorage : nativeStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigurationError);
  return supabase;
}
