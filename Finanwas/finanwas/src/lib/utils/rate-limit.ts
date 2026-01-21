/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Time until reset in milliseconds */
  resetMs: number;
  /** Reset time as Date */
  resetTime: Date;
}

/**
 * In-memory store for rate limit data
 * Key format: {identifier}:{endpoint}
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically (every 10 minutes)
 */
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Start the cleanup interval
 */
function startCleanup(): void {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);

  // Don't keep the process alive just for cleanup
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

/**
 * Stop the cleanup interval (useful for testing)
 */
export function stopRateLimitCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Check rate limit for an identifier and endpoint
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param endpoint - Endpoint name (e.g., "login", "register")
 * @param config - Rate limit configuration
 * @returns Rate limit result
 *
 * @example
 * ```ts
 * const result = checkRateLimit("192.168.1.1", "login", {
 *   maxRequests: 5,
 *   windowMs: 60000 // 1 minute
 * });
 *
 * if (!result.allowed) {
 *   return NextResponse.json(
 *     { error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(result.resetMs / 1000)} segundos` },
 *     { status: 429 }
 *   );
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  // Start cleanup if not already running
  startCleanup();

  const key = `${identifier}:${endpoint}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetMs: config.windowMs,
      resetTime: new Date(entry.resetTime),
    };
  }

  // Increment count
  entry.count++;

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetMs = entry.resetTime - now;

  return {
    allowed,
    remaining,
    resetMs,
    resetTime: new Date(entry.resetTime),
  };
}

/**
 * Reset rate limit for an identifier and endpoint
 * @param identifier - Unique identifier
 * @param endpoint - Endpoint name
 */
export function resetRateLimit(identifier: string, endpoint: string): void {
  const key = `${identifier}:${endpoint}`;
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get rate limit info without incrementing
 * @param identifier - Unique identifier
 * @param endpoint - Endpoint name
 * @param config - Rate limit configuration
 * @returns Rate limit info or null if no entry exists
 */
export function getRateLimitInfo(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult | null {
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    return null;
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetMs = entry.resetTime - now;

  return {
    allowed: entry.count < config.maxRequests,
    remaining,
    resetMs,
    resetTime: new Date(entry.resetTime),
  };
}

/**
 * Predefined rate limit configurations for common endpoints
 */
export const RATE_LIMITS = {
  /** Login endpoint: 5 requests per minute */
  login: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  } as RateLimitConfig,

  /** Register endpoint: 3 requests per minute */
  register: {
    maxRequests: 3,
    windowMs: 60 * 1000, // 1 minute
  } as RateLimitConfig,

  /** Password reset: 3 requests per hour */
  passwordReset: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  } as RateLimitConfig,

  /** General API: 100 requests per minute */
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  } as RateLimitConfig,

  /** Strict API: 10 requests per minute */
  strictApi: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  } as RateLimitConfig,
};

/**
 * Get client IP from request headers
 * @param headers - Request headers
 * @returns Client IP address
 */
export function getClientIp(headers: Headers): string {
  // Check common headers for client IP
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Create a rate limit error message in Spanish
 * @param resetMs - Time until reset in milliseconds
 * @returns Error message
 */
export function createRateLimitMessage(resetMs: number): string {
  const seconds = Math.ceil(resetMs / 1000);

  if (seconds < 60) {
    return `Demasiados intentos. Intenta de nuevo en ${seconds} segundo${seconds !== 1 ? 's' : ''}.`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `Demasiados intentos. Intenta de nuevo en ${minutes} minuto${minutes !== 1 ? 's' : ''}.`;
}
