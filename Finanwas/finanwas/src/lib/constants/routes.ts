/**
 * Application route constants
 * Centralized route definitions for type-safe navigation
 */

/**
 * Public routes (accessible without authentication)
 */
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
} as const;

/**
 * Authentication routes
 */
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
} as const;

/**
 * Protected dashboard routes
 */
export const DASHBOARD_ROUTES = {
  ROOT: '/dashboard',
  OVERVIEW: '/dashboard/overview',
  PORTFOLIO: '/dashboard/portfolio',
  SAVINGS: '/dashboard/savings',
  NOTES: '/dashboard/notes',
  PROFILE: '/dashboard/profile',
} as const;

/**
 * Learning/education routes
 */
export const LEARNING_ROUTES = {
  ROOT: '/learn',
  COURSES: '/learn/courses',
  COURSE: (slug: string) => `/learn/courses/${slug}`,
  LESSON: (courseSlug: string, lessonSlug: string) =>
    `/learn/courses/${courseSlug}/lessons/${lessonSlug}`,
  TIPS: '/learn/tips',
} as const;

/**
 * Onboarding routes
 */
export const ONBOARDING_ROUTES = {
  WELCOME: '/onboarding/welcome',
  QUESTIONNAIRE: '/onboarding/questionnaire',
  COMPLETE: '/onboarding/complete',
} as const;

/**
 * Admin routes (restricted to admin role)
 */
export const ADMIN_ROUTES = {
  ROOT: '/admin',
  USERS: '/admin/users',
  CODES: '/admin/invitation-codes',
  ANALYTICS: '/admin/analytics',
} as const;

/**
 * API routes (for client-side fetching)
 */
export const API_ROUTES = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    VALIDATE_CODE: '/api/auth/validate-code',
  },
  // Portfolio endpoints
  PORTFOLIO: {
    LIST: '/api/portfolio',
    CREATE: '/api/portfolio',
    UPDATE: (id: string) => `/api/portfolio/${id}`,
    DELETE: (id: string) => `/api/portfolio/${id}`,
  },
  // Savings goals endpoints
  SAVINGS: {
    LIST: '/api/savings',
    CREATE: '/api/savings',
    UPDATE: (id: string) => `/api/savings/${id}`,
    DELETE: (id: string) => `/api/savings/${id}`,
    CONTRIBUTIONS: (goalId: string) => `/api/savings/${goalId}/contributions`,
  },
  // Notes endpoints
  NOTES: {
    LIST: '/api/notes',
    CREATE: '/api/notes',
    UPDATE: (id: string) => `/api/notes/${id}`,
    DELETE: (id: string) => `/api/notes/${id}`,
  },
  // User profile endpoints
  PROFILE: {
    GET: '/api/profile',
    UPDATE: '/api/profile',
    QUESTIONNAIRE: '/api/profile/questionnaire',
  },
  // Learning endpoints
  LEARNING: {
    PROGRESS: '/api/learning/progress',
    COMPLETE_LESSON: '/api/learning/complete-lesson',
    TIPS: '/api/learning/tips',
  },
} as const;

/**
 * Default redirect after login
 */
export const DEFAULT_LOGGED_IN_REDIRECT = DASHBOARD_ROUTES.ROOT;

/**
 * Default redirect after logout
 */
export const DEFAULT_LOGGED_OUT_REDIRECT = PUBLIC_ROUTES.HOME;

/**
 * Routes that require authentication
 */
export const PROTECTED_ROUTE_PATTERNS = [
  '/dashboard',
  '/learn',
  '/onboarding',
  '/admin',
  '/api',
];

/**
 * Routes that require admin role
 */
export const ADMIN_ROUTE_PATTERNS = ['/admin'];

/**
 * Helper function to check if a path is protected
 * @param path - The path to check
 * @returns True if the path requires authentication
 */
export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTE_PATTERNS.some((pattern) => path.startsWith(pattern));
}

/**
 * Helper function to check if a path requires admin access
 * @param path - The path to check
 * @returns True if the path requires admin role
 */
export function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTE_PATTERNS.some((pattern) => path.startsWith(pattern));
}
