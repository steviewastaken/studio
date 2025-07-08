
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

const USERS_STORAGE_KEY = 'dunlivrer-users';
const SESSION_STORAGE_KEY = 'dunlivrer-session-userId';


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // This effect runs once on mount to initialize state from localStorage
  useEffect(() => {
    try {
      const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
      const allUsers = storedUsers ? JSON.parse(storedUsers) : initialUsers;
      setUsers(allUsers);

      const sessionUserId = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionUserId) {
        const loggedInUser = allUsers.find((u: UserProfile) => u.id === sessionUserId);
        if (loggedInUser) {
          setUser(loggedInUser);
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth state from localStorage", error);
      setUsers(initialUsers);
      setUser(null);
    } finally {
        setLoading(false);
    }
  }, []);

  // This effect saves the user "database" back to localStorage whenever it changes
  useEffect(() => {
    // We don't save during the initial load to avoid overwriting with empty data
    if (!loading) {
        try {
            window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (error) {
            console.error("Failed to save users to localStorage", error);
        }
    }
  }, [users, loading]);
  
  // This effect handles cross-tab synchronization for login/logout
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY) {
        if (event.newValue) {
          const newUsers = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]');
          const loggedInUser = newUsers.find((u: UserProfile) => u.id === event.newValue);
          setUser(loggedInUser || null);
        } else {
          setUser(null); // Logged out in another tab
        }
      }
      if (event.key === USERS_STORAGE_KEY && event.newValue) {
        setUsers(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      window.localStorage.setItem(SESSION_STORAGE_KEY, foundUser.id);
      return foundUser;
    }
    return null;
  };
  
  const signup = async (name: string, email: string, password: string, role: 'driver' | 'customer' = 'customer'): Promise<UserProfile | null> => {
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

    if (userExists || !newUser) return null;

    setUser(newUser);
    window.localStorage.setItem(SESSION_STORAGE_KEY, newUser.id);
    return newUser;
  };


  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const updateUserKycStatus = (userId: string, status: UserProfile['kycStatus']) => {
    setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, kycStatus: status } : u
    ));
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
