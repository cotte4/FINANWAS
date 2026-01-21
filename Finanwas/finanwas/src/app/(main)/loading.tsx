import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Loading UI for authenticated routes
 * Shown during page transitions and data fetching
 * Displayed within the main layout (with sidebar)
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">
          Cargando...
        </p>
      </div>
    </div>
  );
}
