import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Custom 404 Not Found page
 * Shown when a route doesn't exist
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>

        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Página no encontrada
        </h2>

        <p className="mb-8 text-muted-foreground">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Ir al Dashboard
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="javascript:history.back()" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver atrás
            </Link>
          </Button>
        </div>

        <div className="mt-12 rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Páginas disponibles:</strong>
          </p>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <Link href="/dashboard" className="text-sm text-primary hover:underline">
              Dashboard
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/aprender" className="text-sm text-primary hover:underline">
              Aprender
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/portfolio" className="text-sm text-primary hover:underline">
              Portfolio
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/metas" className="text-sm text-primary hover:underline">
              Metas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
