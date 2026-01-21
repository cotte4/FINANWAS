import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { createClient } from '@supabase/supabase-js';
import { ErrorLogResponse } from '@/lib/monitoring/logger';

/**
 * GET /api/admin/errors
 * Returns error logs for admin monitoring dashboard
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get and verify auth token
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verify admin status
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', payload.userId)
      .single();

    if (!user?.is_admin) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level') || undefined;
    const source = searchParams.get('source') || undefined;
    const resolved = searchParams.get('resolved') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Build query
    let query = supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 500)); // Max 500 errors

    if (level) {
      query = query.eq('level', level);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (resolved !== undefined) {
      query = query.eq('resolved', resolved);
    }

    const { data: errors, error: queryError } = await query;

    if (queryError) {
      throw queryError;
    }

    // Get error stats
    const { data: stats } = await supabase
      .from('error_logs')
      .select('level, source, resolved')
      .limit(10000); // Get recent errors for stats

    const errorStats = {
      total: stats?.length || 0,
      unresolved: stats?.filter(e => !e.resolved).length || 0,
      critical: stats?.filter(e => e.level === 'critical').length || 0,
      byLevel: {
        error: stats?.filter(e => e.level === 'error').length || 0,
        warning: stats?.filter(e => e.level === 'warning').length || 0,
        critical: stats?.filter(e => e.level === 'critical').length || 0,
      },
      bySource: {
        client: stats?.filter(e => e.source === 'client').length || 0,
        server: stats?.filter(e => e.source === 'server').length || 0,
        api: stats?.filter(e => e.source === 'api').length || 0,
      },
    };

    return NextResponse.json({
      errors: errors || [],
      stats: errorStats,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/errors:', error);
    return NextResponse.json(
      { error: 'Error al obtener registros de errores' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/errors
 * Mark an error as resolved
 * Requires admin authentication
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get and verify auth token
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verify admin status
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', payload.userId)
      .single();

    if (!user?.is_admin) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { errorId, resolved } = body;

    if (!errorId) {
      return NextResponse.json(
        { error: 'errorId es requerido' },
        { status: 400 }
      );
    }

    // Update error
    const { error: updateError } = await supabase
      .from('error_logs')
      .update({
        resolved: resolved === true,
        resolved_at: resolved === true ? new Date().toISOString() : null,
        resolved_by: resolved === true ? payload.userId : null,
      })
      .eq('id', errorId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/admin/errors:', error);
    return NextResponse.json(
      { error: 'Error al actualizar error' },
      { status: 500 }
    );
  }
}
