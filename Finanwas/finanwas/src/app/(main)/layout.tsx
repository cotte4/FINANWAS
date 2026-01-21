import { redirect } from 'next/navigation';
import { UserProvider } from '@/contexts/UserContext';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { createClient } from '@/lib/db/supabase';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';

/**
 * Fetches the current authenticated user
 * @returns User data if authenticated
 * @throws Redirects to /login if not authenticated
 */
async function getCurrentUser() {
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

    // Fetch user from database
    const supabase = createClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('id', payload.userId)
      .single();

    if (error || !user) {
      redirect('/login');
    }

    // Fetch user profile for questionnaire completion status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('questionnaire_completed, risk_tolerance')
      .eq('user_id', payload.userId)
      .single();

    // Determine investor type from risk_tolerance
    let investorType: 'conservador' | 'moderado' | 'agresivo' | null = null;
    if (profile?.risk_tolerance) {
      if (profile.risk_tolerance === 'conservative') {
        investorType = 'conservador';
      } else if (profile.risk_tolerance === 'moderate') {
        investorType = 'moderado';
      } else if (profile.risk_tolerance === 'aggressive') {
        investorType = 'agresivo';
      }
    }

    return {
      ...user,
      questionnaireCompleted: profile?.questionnaire_completed ?? false,
      investorType,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    redirect('/login');
  }
}

/**
 * Authenticated layout shell for all main application pages
 * Features:
 * - Fetches current user and redirects to /login if not authenticated
 * - Provides user data to children via UserProvider context
 * - Flex layout with sidebar area (hidden on mobile) and main content area
 * - Cream background color (#FFFBEB)
 */
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <UserProvider user={user}>
      <div className="flex min-h-screen bg-background">
        {/* Mobile Header - shown on mobile, hidden on desktop */}
        <MobileHeader />

        {/* Sidebar - hidden on mobile, shown on desktop */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main content area */}
        <main className="flex-1 pt-16 md:pt-0 md:pl-64">
          {children}
        </main>
      </div>
    </UserProvider>
  );
}
