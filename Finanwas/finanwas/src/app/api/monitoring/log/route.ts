import { NextRequest, NextResponse } from 'next/server';
import { logError, ErrorLevel, ErrorSource } from '@/lib/monitoring/logger';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * POST /api/monitoring/log
 * Logs client-side errors to the database
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID if authenticated (optional)
    let userId: string | undefined;
    try {
      const token = await getAuthCookie();
      if (token) {
        const payload = await verifyToken(token);
        if (payload) {
          userId = payload.userId;
        }
      }
    } catch {
      // User not authenticated, continue without userId
    }

    // Parse request body
    const body = await request.json();
    const { level, source, message, stackTrace, errorCode, url, metadata } = body;

    // Validate required fields
    if (!level || !source || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: level, source, message' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validLevels: ErrorLevel[] = ['error', 'warning', 'critical'];
    const validSources: ErrorSource[] = ['client', 'server', 'api'];

    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: 'Invalid level. Must be: error, warning, or critical' },
        { status: 400 }
      );
    }

    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be: client, server, or api' },
        { status: 400 }
      );
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || undefined;

    // Log the error
    await logError({
      level,
      source,
      message: String(message).substring(0, 5000), // Truncate long messages
      stackTrace: stackTrace ? String(stackTrace).substring(0, 10000) : undefined,
      errorCode: errorCode || undefined,
      userId,
      url: url || undefined,
      userAgent,
      ipAddress,
      metadata: metadata || {},
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Don't let logging errors crash the endpoint
    console.error('Error in POST /api/monitoring/log:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}
