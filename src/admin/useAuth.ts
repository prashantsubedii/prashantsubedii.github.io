import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';

export type AuthStatus =
  | 'loading'       // initial session check
  | 'unconfigured'  // Supabase env not set
  | 'signed-out'
  | 'checking'      // signed in, verifying admin membership
  | 'admin'         // authorized
  | 'denied';       // authenticated but not an allowlisted admin

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const sb = getSupabase();
  const [status, setStatus] = useState<AuthStatus>(sb ? 'loading' : 'unconfigured');
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const verification = useRef(0);

  const verifyAdmin = useCallback(async (s: Session | null) => {
    if (!sb) return;
    const current = ++verification.current;
    if (!s) { setStatus('signed-out'); return; }
    setStatus('checking');
    try {
      // Authoritative check lives in the DB (RLS). This RPC is only for UX:
      // it decides whether to show the dashboard or an access-denied screen.
      const { data, error: rpcErr } = await sb.rpc('is_admin');
      if (current === verification.current) setStatus(!rpcErr && data === true ? 'admin' : 'denied');
    } catch { if (current === verification.current) setStatus('denied'); }
  }, [sb]);

  useEffect(() => {
    if (!sb) return;
    let mounted = true;
    sb.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      void verifyAdmin(data.session);
    }).catch(() => { if (mounted) { setStatus('signed-out'); setError('Could not connect. Please try again.'); } });
    const { data: sub } = sb.auth.onAuthStateChange((_evt, s) => {
      if (!mounted) return;
      setSession(s);
      // Leave Supabase's auth callback before issuing another client request.
      setTimeout(() => { if (mounted) void verifyAdmin(s); }, 0);
    });
    return () => { mounted = false; verification.current++; sub.subscription.unsubscribe(); };
  }, [sb, verifyAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!sb) return;
    setError(null);
    try {
      const { error: err } = await sb.auth.signInWithPassword({ email, password });
      if (err) setError('Sign-in failed. Check your credentials or try again later.');
    } catch { setError('Could not connect. Please try again.'); }
  }, [sb]);

  const signOut = useCallback(async () => {
    if (!sb) return;
    verification.current++;
    await sb.auth.signOut({ scope: 'local' });
    setSession(null);
    setStatus('signed-out');
  }, [sb]);

  return { status, user: session?.user ?? null, session, error, signIn, signOut };
}
