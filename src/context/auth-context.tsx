
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  password?: string; // It's a mock, so we can store it here.
  role: 'driver' | 'admin';
};

// Mock user "database"
const mockUsers: UserProfile[] = [
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@dunlivrer.com',
    password: 'admin',
    role: 'admin',
  },
  {
    id: 'user-123',
    name: 'Demo DunGuy',
    email: 'demo@dunlivrer.com',
    password: 'demo',
    role: 'driver',
  }
];

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  signup: (name: string, email: string, password: string) => Promise<UserProfile | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<UserProfile | null> => {
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return foundUser;
    }
    return null;
  }, []);
  
  const signup = useCallback(async (name: string, email: string, password: string): Promise<UserProfile | null> => {
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return null; // User already exists
    }
    const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role: 'driver'
    };
    mockUsers.push(newUser);
    setUser(newUser);
    return newUser;
  }, []);


  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = { user, loading, setLoading, login, signup, logout };

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
