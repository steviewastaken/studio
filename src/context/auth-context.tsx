
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  password?: string; // It's a mock, so we can store it here.
  role: 'driver' | 'admin' | 'customer';
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
};

// Initial state for the mock user "database"
const initialUsers: UserProfile[] = [
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@dunlivrer.com',
    password: 'admin',
    role: 'admin',
    kycStatus: 'verified',
  },
  {
    id: 'user-123',
    name: 'Demo DunGuy',
    email: 'demo@dunlivrer.com',
    password: 'demo',
    role: 'driver',
    kycStatus: 'verified',
  }
];

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  signup: (name: string, email: string, password: string, role: 'driver' | 'customer') => Promise<UserProfile | null>;
  logout: () => void;
  updateUserKycStatus: (userId: string, status: UserProfile['kycStatus']) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);

  const login = useCallback(async (email: string, password: string): Promise<UserProfile | null> => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return foundUser;
    }
    return null;
  }, [users]);
  
  const signup = useCallback(async (name: string, email: string, password: string, role: 'driver' | 'customer' = 'customer'): Promise<UserProfile | null> => {
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return null; // User already exists
    }
    const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role: role,
        kycStatus: role === 'driver' ? 'none' : 'verified',
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setUser(newUser);
    return newUser;
  }, [users]);


  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateUserKycStatus = useCallback((userId: string, status: UserProfile['kycStatus']) => {
    setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, kycStatus: status } : u
    ));
    if (user?.id === userId) {
        setUser(prevUser => prevUser ? { ...prevUser, kycStatus: status } : null);
    }
  }, [user?.id]);

  const value = { user, loading, setLoading, login, signup, logout, updateUserKycStatus };

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
