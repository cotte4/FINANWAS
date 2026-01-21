import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/hooks/useAuth';

/**
 * Custom render function that wraps components with necessary providers
 * @param ui - Component to render
 * @param options - Additional render options
 * @returns Render result
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Creates a mock fetch response
 */
export function createMockFetchResponse<T>(data: T, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response);
}

/**
 * Creates a mock error fetch response
 */
export function createMockFetchError(error: string, status = 400) {
  return createMockFetchResponse({ error }, status);
}

/**
 * Waits for the next tick
 */
export function waitForNextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
