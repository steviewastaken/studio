
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    // This effect runs once on component mount on the client side.
    // It's responsible for hydrating the state from localStorage.
    try {
      const storedUsers = window.localStorage.getItem('dunlivrer-users');
      // Load from storage, or fall back to initialUsers if nothing is in storage.
      setUsers(storedUsers ? JSON.parse(storedUsers) : initialUsers);
    } catch (error) {
      console.error("Failed to load users from localStorage", error);
      // Fallback to initial data on any error.
      setUsers(initialUsers);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect runs whenever the `users` state changes.
    // It's responsible for persisting the state back to localStorage.
    if (!loading) {
        try {
            window.localStorage.setItem('dunlivrer-users', JSON.stringify(users));
        } catch (error) {
            console.error("Failed to save users to localStorage", error);
        }
    }
  }, [users, loading]);
  
  // This effect listens for storage changes from other tabs and syncs the state.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'dunlivrer-users' && event.newValue) {
        try {
          const newUsers: UserProfile[] = JSON.parse(event.newValue);
          setUsers(newUsers);

          // Use the functional form of setUser to avoid stale state issues.
          // This correctly updates the logged-in user's info if it changed in another tab.
          setUser(currentUser => {
            if (!currentUser) return null; // If not logged in, do nothing.

            const updatedCurrentUser = newUsers.find(u => u.id === currentUser.id);
            
            // If user was deleted in another tab, log them out.
            if (!updatedCurrentUser) return null; 

            // If user data has changed, update the state.
            if (JSON.stringify(updatedCurrentUser) !== JSON.stringify(currentUser)) {
                return updatedCurrentUser;
            }

            return currentUser; // Otherwise, keep the current user state.
          });
        } catch (error) {
          console.error("Failed to parse users from storage event", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array ensures this runs once and cleans up on unmount.


  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (foundUser) {
      setUser(foundUser);
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
