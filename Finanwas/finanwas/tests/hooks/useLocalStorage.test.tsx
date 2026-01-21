import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useLocalStorage,
  useLocalStorageBoolean,
  useLocalStorageArray,
} from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('useLocalStorage', () => {
    it('should initialize with default value when localStorage is empty', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default-value')
      );

      expect(result.current[0]).toBe('default-value');
    });

    it('should initialize with stored value when localStorage has data', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default-value')
      );

      expect(result.current[0]).toBe('stored-value');
    });

    it('should update localStorage when value changes', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      );

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
    });

    it('should support functional updates', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1]((prev) => prev + 5);
      });

      expect(result.current[0]).toBe(6);
    });

    it('should remove value from localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify('value'));

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      act(() => {
        result.current[2](); // removeValue
      });

      expect(result.current[0]).toBe('default');
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should handle complex objects', () => {
      const complexObject = { name: 'Test', age: 30, active: true };

      const { result } = renderHook(() =>
        useLocalStorage('user', complexObject)
      );

      expect(result.current[0]).toEqual(complexObject);

      const updatedObject = { ...complexObject, age: 31 };

      act(() => {
        result.current[1](updatedObject);
      });

      expect(result.current[0]).toEqual(updatedObject);
      expect(JSON.parse(localStorage.getItem('user')!)).toEqual(updatedObject);
    });

    it('should handle invalid JSON gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem('test-key', 'invalid-json{');

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      expect(result.current[0]).toBe('default');
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('useLocalStorageBoolean', () => {
    it('should initialize with default boolean value', () => {
      const { result } = renderHook(() =>
        useLocalStorageBoolean('feature-flag', false)
      );

      expect(result.current[0]).toBe(false);
    });

    it('should toggle boolean value', () => {
      const { result } = renderHook(() =>
        useLocalStorageBoolean('toggle', false)
      );

      act(() => {
        result.current[1](); // toggle
      });

      expect(result.current[0]).toBe(true);

      act(() => {
        result.current[1](); // toggle again
      });

      expect(result.current[0]).toBe(false);
    });

    it('should set boolean value directly', () => {
      const { result } = renderHook(() =>
        useLocalStorageBoolean('flag', false)
      );

      act(() => {
        result.current[2](true); // setValue
      });

      expect(result.current[0]).toBe(true);
    });
  });

  describe('useLocalStorageArray', () => {
    it('should initialize with empty array by default', () => {
      const { result } = renderHook(() =>
        useLocalStorageArray<string>('items')
      );

      expect(result.current.array).toEqual([]);
    });

    it('should push items to array', () => {
      const { result } = renderHook(() =>
        useLocalStorageArray<string>('items')
      );

      act(() => {
        result.current.push('item1');
      });

      expect(result.current.array).toEqual(['item1']);

      act(() => {
        result.current.push('item2');
      });

      expect(result.current.array).toEqual(['item1', 'item2']);
    });

    it('should remove items from array', () => {
      const { result } = renderHook(() =>
        useLocalStorageArray<string>('items', ['a', 'b', 'c'])
      );

      act(() => {
        result.current.remove('b');
      });

      expect(result.current.array).toEqual(['a', 'c']);
    });

    it('should remove items by index', () => {
      const { result } = renderHook(() =>
        useLocalStorageArray<string>('items', ['a', 'b', 'c'])
      );

      act(() => {
        result.current.removeAt(1);
      });

      expect(result.current.array).toEqual(['a', 'c']);
    });

    it('should update items by index', () => {
      const { result } = renderHook(() =>
        useLocalStorageArray<string>('items', ['a', 'b', 'c'])
      );

      act(() => {
        result.current.update(1, 'updated');
      });

      expect(result.current.array).toEqual(['a', 'updated', 'c']);
    });

    it('should clear array', () => {
      const { result } = renderHook(() =>
        useLocalStorageArray<string>('items', ['a', 'b', 'c'])
      );

      act(() => {
        result.current.clear();
      });

      expect(result.current.array).toEqual([]);
    });

    it('should remove all and reset to empty array', () => {
      const { result } = renderHook(() =>
        useLocalStorageArray<string>('items', ['a', 'b', 'c'])
      );

      act(() => {
        result.current.removeAll();
      });

      expect(result.current.array).toEqual([]);
      expect(localStorage.getItem('items')).toBeNull();
    });
  });
});
