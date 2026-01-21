'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

/**
 * Global error boundary - catches errors in root layout
 * This is a last-resort error handler for critical failures
 * Must be a client component and must include <html> and <body> tags
 *
 * @param error - The error that was thrown
 * @param reset - Function to attempt recovering from the error
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html lang="es-AR">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Error crítico
            </h1>

            <p className="mb-6 text-gray-600">
              Ocurrió un error crítico en la aplicación. Por favor, recarga la página.
            </p>

            {error.message && (
              <div className="mb-6 rounded-lg bg-gray-100 p-4 text-left">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Detalles:
                </p>
                <p className="text-sm text-gray-600 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <RefreshCcw className="h-4 w-4" />
              Reintentar
            </button>

            <p className="mt-6 text-xs text-gray-500">
              Si el problema persiste, contacta a soporte técnico.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
