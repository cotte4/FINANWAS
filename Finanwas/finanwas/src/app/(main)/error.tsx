'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error boundary for authenticated routes
 * Catches errors that occur in the main app section
 * Provides more context-aware error handling for logged-in users
 *
 * @param error - The error that was thrown
 * @param reset - Function to attempt recovering from the error
 */
export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details
    console.error('Main section error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-16 md:pt-0 md:pl-64">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-error/10 p-4">
            <AlertCircle className="h-12 w-12 text-error" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Error en la aplicación
        </h1>

        <p className="mb-6 text-muted-foreground">
          Ocurrió un problema al cargar esta sección. Tus datos están seguros.
        </p>

        {error.message && process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-lg bg-muted/50 p-4 text-left">
            <p className="text-sm font-medium text-foreground mb-1">
              Detalles del error (solo visible en desarrollo):
            </p>
            <p className="text-sm text-muted-foreground font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Intentar de nuevo
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ir al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
