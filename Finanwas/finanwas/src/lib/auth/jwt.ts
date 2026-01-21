import { SignJWT, jwtVerify, decodeJwt, type JWTPayload } from 'jose';

/**
 * JWT payload structure for authenticated users
 */
export interface AuthPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Get JWT secret from environment variable
 * @throws Error if JWT_SECRET is not defined
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Creates a JWT token with the given payload
 * @param payload - The user authentication payload
 * @returns Signed JWT token string
 */
export async function signToken(payload: AuthPayload): Promise<string> {
  const secret = getJWTSecret();

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 day expiry
    .sign(secret);

  return token;
}

/**
 * Verifies a JWT token and returns the payload if valid
 * @param token - JWT token string to verify
 * @returns AuthPayload if valid, null if invalid or expired
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token, secret);

    return payload as AuthPayload;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Decodes a JWT token without verification
 * Useful for extracting payload data when signature verification is not needed
 * @param token - JWT token string to decode
 * @returns Decoded payload or null if decoding fails
 */
export function decodeToken(token: string): AuthPayload | null {
  try {
    const payload = decodeJwt(token);
    return payload as AuthPayload;
  } catch (error) {
    return null;
  }
}
