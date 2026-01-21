import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * Middleware to protect authenticated routes
 * - Checks JWT cookie on routes matching /(main)/* and /admin/*
 * - Redirects to /login if no valid token
 * - For /admin/*, also checks role === 'admin', redirects to /dashboard if not admin
 * - Allows public routes: /login, /register, /api/auth/*
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookie
  const token = request.cookies.get('auth-token')?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  const payload = await verifyToken(token);

  // If token is invalid or expired, redirect to login
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For admin routes, check role
  if (pathname.startsWith('/admin')) {
    if (payload.role !== 'admin') {
      // Non-admin users trying to access admin routes -> redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

/**
 * Matcher configuration
 * - Protects all routes under /(main)/* and /admin/*
 * - Excludes public routes: /login, /register, /api/auth/*, static files, _next
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - /login (public login page)
     * - /register (public registration page)
     * - /api/auth (public auth endpoints)
     * - /_next (Next.js internals)
     * - /favicon.ico, /robots.txt, etc. (static files)
     */
    '/((?!login|register|api/auth|_next|favicon.ico|robots.txt).*)',
  ],
};
