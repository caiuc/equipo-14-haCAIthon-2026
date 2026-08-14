const skipAuthFlag = process.env.EXPO_PUBLIC_SKIP_AUTH_FOR_RECYCLE;
const hasSupabaseConfig = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() && process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim());

export const allowRecyclePreviewWithoutAuth = skipAuthFlag === 'true' || (!hasSupabaseConfig && skipAuthFlag !== 'false');
