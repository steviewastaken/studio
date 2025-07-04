"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

// A mock user for demonstration
const mockUser: UserProfile = {
    id: 'user-123',
    name: 'Demo DunGuy',
    email: 'demo@dunlivrer.com'
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false); // Set to false as it's a mock

  const login = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
    }, 500);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = { user, loading, login, logout };

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
