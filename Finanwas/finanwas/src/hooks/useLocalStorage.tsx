'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with TypeScript support
 * Provides type-safe storage with automatic JSON serialization
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [storedValue, setValue, removeValue]
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage<string>('theme', 'light');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Return a wrapped version of useState's setter function that persists the new value to localStorage
   */
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  /**
   * Remove the value from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  /**
   * Listen for changes to localStorage from other tabs/windows
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage update for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing a boolean value in localStorage
 * Simplified version of useLocalStorage specifically for boolean flags
 * @param key - localStorage key
 * @param initialValue - Initial boolean value (default: false)
 * @returns Tuple of [value, toggle, setValue]
 * @example
 * const [isOpen, toggleOpen, setIsOpen] = useLocalStorageBoolean('sidebar-open', true);
 */
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue, removeValue] = useLocalStorage<boolean>(key, initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, [setValue]);

  return [value, toggle, setValue];
}

/**
 * Hook for managing an array in localStorage
 * Provides helper methods for array operations
 * @param key - localStorage key
 * @param initialValue - Initial array value (default: [])
 * @returns Object with array and helper methods
 * @example
 * const recentSearches = useLocalStorageArray<string>('recent-searches');
 * recentSearches.push('AAPL');
 * recentSearches.remove('AAPL');
 */
export function useLocalStorageArray<T>(key: string, initialValue: T[] = []) {
  const [array, setArray, removeArray] = useLocalStorage<T[]>(key, initialValue);

  const push = useCallback(
    (item: T) => {
      setArray((prev) => [...prev, item]);
    },
    [setArray]
  );

  const remove = useCallback(
    (item: T) => {
      setArray((prev) => prev.filter((i) => i !== item));
    },
    [setArray]
  );

  const removeAt = useCallback(
    (index: number) => {
      setArray((prev) => prev.filter((_, i) => i !== index));
    },
    [setArray]
  );

  const clear = useCallback(() => {
    setArray([]);
  }, [setArray]);

  const update = useCallback(
    (index: number, item: T) => {
      setArray((prev) => prev.map((i, idx) => (idx === index ? item : i)));
    },
    [setArray]
  );

  return {
    array,
    setArray,
    push,
    remove,
    removeAt,
    clear,
    update,
    removeAll: removeArray,
  };
}
