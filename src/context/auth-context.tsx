
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'driver' | 'admin';
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback((userToLogin: UserProfile) => {
    setUser(userToLogin);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = { user, loading, setLoading, login, logout };

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
