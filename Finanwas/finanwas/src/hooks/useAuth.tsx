'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_ROUTES, DEFAULT_LOGGED_OUT_REDIRECT, DEFAULT_LOGGED_IN_REDIRECT } from '@/lib/constants/routes';

/**
 * User data interface
 */
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

/**
 * Auth context value interface
 */
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth provider component
 * Wraps the application and provides authentication state and methods
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Fetch current user from API
   */
  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(API_ROUTES.AUTH.ME, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Login user with email and password
   * @param email - User email
   * @param password - User password
   * @throws Error if login fails
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await fetch(API_ROUTES.AUTH.LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al iniciar sesión');
        }

        setUser(data.user);
        router.push(DEFAULT_LOGGED_IN_REDIRECT);
      } catch (error) {
        throw error;
      }
    },
    [router]
  );

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    try {
      await fetch(API_ROUTES.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      router.push(DEFAULT_LOGGED_OUT_REDIRECT);
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear user state even if API call fails
      setUser(null);
      router.push(DEFAULT_LOGGED_OUT_REDIRECT);
    }
  }, [router]);

  /**
   * Refresh user data from API
   */
  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * @returns Auth context value
 * @throws Error if used outside AuthProvider
 * @example
 * const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
