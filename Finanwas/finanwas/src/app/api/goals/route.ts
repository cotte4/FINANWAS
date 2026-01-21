import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserGoals, createGoal } from '@/lib/db/queries/goals';
import { sanitizeString, sanitizeNumber } from '@/lib/utils/sanitize';

/**
 * GET /api/goals
 * Returns all savings goals for the authenticated user
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

    // Get user goals
    const goals = await getUserGoals(payload.userId);

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/goals:', error);
    return NextResponse.json(
      { error: 'Error al obtener metas de ahorro' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals
 * Creates a new savings goal for the authenticated user
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { name, target_amount, currency, target_date } = body;

    // Validate required fields
    if (!name || !target_amount || !currency) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, target_amount, currency' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name, 255);
    const sanitizedTargetAmount = sanitizeNumber(target_amount, 0, 0.01);
    const sanitizedCurrency = sanitizeString(currency, 10).toUpperCase();

    // Validate sanitized values
    if (sanitizedName.length === 0) {
      return NextResponse.json(
        { error: 'El nombre de la meta no puede estar vacío' },
        { status: 400 }
      );
    }

    if (sanitizedTargetAmount <= 0) {
      return NextResponse.json(
        { error: 'El monto objetivo debe ser mayor a 0' },
        { status: 400 }
      );
    }

    if (sanitizedCurrency.length === 0) {
      return NextResponse.json(
        { error: 'La moneda no puede estar vacía' },
        { status: 400 }
      );
    }

    // Create goal
    const goal = await createGoal(payload.userId, {
      name: sanitizedName,
      target_amount: sanitizedTargetAmount,
      currency: sanitizedCurrency,
      target_date: target_date || null,
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/goals:', error);
    return NextResponse.json(
      { error: 'Error al crear meta de ahorro' },
      { status: 500 }
    );
  }
}
