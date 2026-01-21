import { cookies } from 'next/headers';

const COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Sets the authentication cookie with the JWT token
 * @param token - The JWT token to store in the cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Clears the authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}

/**
 * Extracts the JWT token from the authentication cookie
 * @returns The JWT token if present, null otherwise
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();

  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value ?? null;
}
