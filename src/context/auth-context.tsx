
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

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
  users: UserProfile[];
  updateUserKycStatus: (userId: string, status: UserProfile['kycStatus']) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);

  useEffect(() => {
    // This effect runs once on the client after the initial render.
    // It loads the persisted user list from localStorage.
    try {
      const item = window.localStorage.getItem('dunlivrer-users');
      if (item) {
        setUsers(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load users from localStorage", error);
    } finally {
        setLoading(false); // Stop loading after attempting to load from storage
    }
  }, []); // Empty dependency array ensures it runs only once on mount.

  useEffect(() => {
    // This effect runs whenever 'users' state changes, saving it to localStorage.
    // This check prevents overwriting localStorage with initialUsers on the first render.
    if (!loading) {
        try {
            window.localStorage.setItem('dunlivrer-users', JSON.stringify(users));
        } catch (error) {
            console.error("Failed to save users to localStorage", error);
        }
    }
  }, [users, loading]);


  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return foundUser;
    }
    return null;
  };
  
  const signup = async (name: string, email: string, password: string, role: 'driver' | 'customer' = 'customer'): Promise<UserProfile | null> => {
    // Use the functional form of setUsers to ensure we have the latest state
    let newUser: UserProfile | null = null;
    let userExists = false;

    setUsers(prevUsers => {
        if (prevUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            userExists = true;
            return prevUsers;
        }
        newUser = {
            id: `user-${Date.now()}`,
            name,
            email,
            password,
            role: role,
            kycStatus: role === 'driver' ? 'none' : 'verified',
        };
        return [...prevUsers, newUser];
    });

    if (userExists) return null;

    setUser(newUser);
    return newUser;
  };


  const logout = () => {
    setUser(null);
  };

  const updateUserKycStatus = (userId: string, status: UserProfile['kycStatus']) => {
    setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, kycStatus: status } : u
    ));
    // Also update the currently logged-in user's state if they are the one being changed
    if (user?.id === userId) {
        setUser(prevUser => prevUser ? { ...prevUser, kycStatus: status } : null);
    }
  };

  const value = { user, loading, setLoading, login, signup, logout, users, updateUserKycStatus };

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
