import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Public Supabase client (anon key). Safe to ship to the browser: the anon key
 * permits only public reads without an admin session. Every table uses the RLS
 * policies in supabase/policies.sql. Used both at build time (prerendering the
 * public site) and in the browser (the /adminprashant app authenticates here).
 */
const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

/** True when Supabase is configured; false lets the site fall back to defaults. */
export const isSupabaseConfigured = Boolean(url && anon);

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (_client) return _client;
  _client = createClient(url!, anon!, {
    auth: {
      persistSession: true,
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return _client;
}
