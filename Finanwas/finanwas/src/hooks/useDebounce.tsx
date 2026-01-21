'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 * Useful for search inputs to avoid excessive API calls
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // Make API call with debouncedSearchTerm
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook that debounces a callback function
 * Useful for debouncing event handlers
 * @param callback - Callback function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced callback function
 * @example
 * const handleSearch = useDebouncedCallback((term: string) => {
 *   // Make API call
 * }, 500);
 *
 * <input onChange={(e) => handleSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

/**
 * Hook that tracks if a value is currently being debounced
 * Useful for showing loading states during debounce
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Tuple of [debouncedValue, isPending]
 * @example
 * const [debouncedSearch, isSearching] = useDebouncePending(searchTerm);
 * {isSearching && <Spinner />}
 */
export function useDebouncePending<T>(
  value: T,
  delay: number = 500
): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    setIsPending(true);

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, isPending];
}
