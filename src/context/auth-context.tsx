
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient, User, AuthError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export type UserProfile = {
  id: string;
  full_name: string;
  role: 'driver' | 'admin' | 'customer';
};

type AuthContextType = {
  supabase: SupabaseClient | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signup: (name: string, email: string, password: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs ONLY on the client, after the initial server render.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // We check for keys and create the client here, inside the client-side effect.
    if (supabaseUrl && supabaseAnonKey) {
        const client = createClientComponentClient({
          supabaseUrl,
          supabaseKey: supabaseAnonKey,
        });
        setSupabase(client);
    } else {
        // If keys are missing, we explicitly set supabase to null and stop loading.
        // This prevents the app from crashing and allows it to run in a logged-out state.
        console.warn("Supabase credentials not found. Auth features will be disabled.");
        setSupabase(null);
        setLoading(false);
    }
  }, []); // The empty dependency array ensures this runs only once on mount (client-side).

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return; // Guard clause

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } else {
      setProfile(data as UserProfile);
    }
  }, [supabase]);


  useEffect(() => {
    // This effect waits for the Supabase client to be initialized.
    if (!supabase) {
      // If supabase is null (either initially, or because keys were missing), we do nothing.
      // The loading state is handled by the first effect in the no-key scenario.
      return;
    }

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const login = async (email: string, password: string) => {
    if (!supabase) return { error: { message: "Supabase not configured.", name:"ConfigError", status: 500 } as AuthError };
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error };
  };
  
  const signup = async (name: string, email: string, password: string) => {
     if (!supabase) return { error: { message: "Supabase not configured.", name:"ConfigError", status: 500 } as AuthError };
    setLoading(true);
    let role: UserProfile['role'] = 'customer';
    if (email.toLowerCase() === 'admin@dunlivrer.com') {
        role = 'admin';
    } else if (email.toLowerCase() === 'driver@dunlivrer.com') {
        role = 'driver';
    }
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        },
      },
    });

    if (authError) {
      setLoading(false);
      return { error: authError };
    }
    
    if (authData.user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();
        
      if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: authData.user.id, full_name: name, role: role });

          if (profileError) {
            console.error('Manual profile creation failed:', profileError);
            setLoading(false);
            return { error: profileError };
          }
      }
    }

    setLoading(false);
    toast({
        title: "Account Created!",
        description: `A confirmation email has been sent to ${email}. Please verify your email to sign in.`,
    });
    return { error: null };
  };

  const logout = async () => {
    if (!supabase) {
      setUser(null);
      setProfile(null);
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  };
  
  const value = { supabase, user, profile, loading, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
