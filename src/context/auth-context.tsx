
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User, AuthError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export type UserProfile = {
  id: string;
  full_name: string;
  role: 'driver' | 'admin' | 'customer';
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signup: (name: string, email: string, password: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the client once. It's safe in a "use client" file.
// It will gracefully handle missing env vars and return a dummy client.
const supabase = createClientComponentClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
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
  }, []);


  useEffect(() => {
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
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error };
  };
  
  const signup = async (name: string, email: string, password: string) => {
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
    const { error } = await supabase.auth.signOut();
    return { error };
  };
  
  const value = { user, profile, loading, login, signup, logout };

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
