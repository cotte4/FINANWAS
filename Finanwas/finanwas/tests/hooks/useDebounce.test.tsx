import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useDebounce,
  useDebouncedCallback,
  useDebouncePending,
} from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDebounce', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));

      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 },
        }
      );

      expect(result.current).toBe('initial');

      // Update value
      rerender({ value: 'updated', delay: 500 });

      // Value should not change immediately
      expect(result.current).toBe('initial');

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Now value should be updated
      expect(result.current).toBe('updated');
    });

    it('should reset timeout if value changes before delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'first' });

      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(result.current).toBe('initial');

      rerender({ value: 'second' });

      act(() => {
        vi.advanceTimersByTime(250);
      });

      // Should still be initial because timeout was reset
      expect(result.current).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(250);
      });

      // Now should be 'second'
      expect(result.current).toBe('second');
    });

    it('should use custom delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 1000),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'updated' });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    it('should handle complex objects', () => {
      const obj1 = { name: 'Test', count: 1 };
      const obj2 = { name: 'Test', count: 2 };

      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        {
          initialProps: { value: obj1 },
        }
      );

      expect(result.current).toBe(obj1);

      rerender({ value: obj2 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe(obj2);
    });
  });

  describe('useDebouncedCallback', () => {
    it('should debounce callback execution', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('arg1');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith('arg1');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous timeout on rapid calls', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('call1');
        vi.advanceTimersByTime(250);
        result.current('call2');
        vi.advanceTimersByTime(250);
        result.current('call3');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should only be called once with the last argument
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('call3');
    });

    it('should handle multiple arguments', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('arg1', 'arg2', 'arg3');
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('useDebouncePending', () => {
    it('should track pending state during debounce', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncePending(value, 500),
        {
          initialProps: { value: 'initial' },
        }
      );

      const [initialValue, initialPending] = result.current;
      expect(initialValue).toBe('initial');
      expect(initialPending).toBe(false);

      rerender({ value: 'updated' });

      // Should be pending immediately after change
      const [pendingValue, isPending] = result.current;
      expect(pendingValue).toBe('initial');
      expect(isPending).toBe(true);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should no longer be pending
      const [finalValue, finalPending] = result.current;
      expect(finalValue).toBe('updated');
      expect(finalPending).toBe(false);
    });

    it('should remain pending during rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncePending(value, 500),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'change1' });

      act(() => {
        vi.advanceTimersByTime(250);
      });

      const [, isPending1] = result.current;
      expect(isPending1).toBe(true);

      rerender({ value: 'change2' });

      act(() => {
        vi.advanceTimersByTime(250);
      });

      const [, isPending2] = result.current;
      expect(isPending2).toBe(true);

      act(() => {
        vi.advanceTimersByTime(250);
      });

      const [finalValue, finalPending] = result.current;
      expect(finalValue).toBe('change2');
      expect(finalPending).toBe(false);
    });
  });
});
