import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { mockUsers, mockFormData } from '../utils/mock-data';
import React from 'react';

// Wrapper component for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    // Clear any stored cookies/state before each test
    vi.clearAllMocks();
  });

  it('should throw error when used outside AuthProvider', () => {
    // Suppress console error for this test
    const consoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = consoleError;
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should fetch user on mount when authenticated', async () => {
    // Mock successful auth check
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ user: mockUsers.user1 }),
      } as Response)
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUsers.user1);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login successfully', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not authenticated' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUsers.user1 }),
      } as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.login(
      mockFormData.validLogin.email,
      mockFormData.validLogin.password
    );

    expect(result.current.user).toEqual(mockUsers.user1);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login failure', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not authenticated' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email o contraseña incorrectos' }),
      } as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      result.current.login('wrong@example.com', 'wrongpassword')
    ).rejects.toThrow('Email o contraseña incorrectos');

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle logout', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUsers.user1 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUsers.user1);
    });

    await result.current.logout();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should refresh user data', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUsers.user1 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { ...mockUsers.user1, name: 'Updated Name' } }),
      } as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user?.name).toBe('Test User');
    });

    await result.current.refreshUser();

    await waitFor(() => {
      expect(result.current.user?.name).toBe('Updated Name');
    });
  });

  it('should handle network errors during fetch', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
