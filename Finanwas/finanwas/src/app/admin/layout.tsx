import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { createClient } from '@/lib/db/supabase';
import { ChevronLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Fetches the current authenticated admin user
 * @returns User data if authenticated and admin
 * @throws Redirects to /login if not authenticated or /dashboard if not admin
 */
async function getCurrentAdmin() {
  try {
    // Get auth token from cookie
    const token = await getAuthCookie();

    if (!token) {
      redirect('/login');
    }

    // Verify JWT token
    const payload = await verifyToken(token);

    if (!payload) {
      redirect('/login');
    }

    // Check if user is admin
    if (payload.role !== 'admin') {
      redirect('/dashboard');
    }

    // Fetch user from database
    const supabase = createClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', payload.userId)
      .single() as { data: { id: string; email: string; name: string; role: string } | null; error: any };

    if (error || !user || user.role !== 'admin') {
      redirect('/dashboard');
    }

    return user;
  } catch (error) {
    console.error('Error fetching current admin:', error);
    redirect('/login');
  }
}

/**
 * Admin layout shell
 * Simple layout with header and back to dashboard link
 * Middleware already checks role, but we double-check here for security
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ChevronLeftIcon className="size-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-6 py-8">
        {children}
      </main>
    </div>
  );
}
