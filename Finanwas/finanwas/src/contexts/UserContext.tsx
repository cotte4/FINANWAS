'use client';

import React, { createContext, useContext, ReactNode } from 'react';

/**
 * User data interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
  questionnaireCompleted?: boolean;
  investorType?: 'conservador' | 'moderado' | 'agresivo' | null;
}

/**
 * User context interface
 */
interface UserContextType {
  user: User;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * User context provider component
 * @param user - The authenticated user data
 * @param children - Child components
 */
export function UserProvider({ user, children }: { user: User; children: ReactNode }) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access user context
 * @returns User context with user data
 * @throws Error if used outside UserProvider
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
