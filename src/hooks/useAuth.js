// Manages Supabase authentication state and exposes session details.
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    }).catch((err) => {
      setError(err.message || 'Unable to restore session');
      setInitializing(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, authSession) => {
      setSession(authSession);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setError(null);
    setAuthLoading(true);
    const { error: authError, data } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (authError) {
      setError(authError.message);
      return null;
    }
    setSession(data.session);
    return data.session;
  };

  // Returns { session, needsConfirmation } — session is null when email confirmation is required.
  const signUp = async (email, password) => {
    setError(null);
    setAuthLoading(true);
    const { error: authError, data } = await supabase.auth.signUp({ email, password });
    setAuthLoading(false);
    if (authError) {
      setError(authError.message);
      return null;
    }
    // data.session is null when email confirmation is required (Supabase default).
    setSession(data.session);
    return { session: data.session, needsConfirmation: !data.session };
  };

  const signOut = async () => {
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
    setSession(null);
  };

  return {
    session,
    initializing,
    authLoading,
    authError: error,
    signIn,
    signUp,
    signOut,
  };
}
