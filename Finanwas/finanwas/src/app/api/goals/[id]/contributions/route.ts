import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getGoalById, getGoalContributions, addContribution } from '@/lib/db/queries/goals';
import { sanitizeString, sanitizeNumber } from '@/lib/utils/sanitize';

/**
 * GET /api/goals/[id]/contributions
 * Returns all contributions for a specific savings goal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get goal ID from params
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID de meta es requerido' },
        { status: 400 }
      );
    }

    // Verify ownership
    const goal = await getGoalById(id, payload.userId);
    if (!goal) {
      return NextResponse.json(
        { error: 'Meta no encontrada o no tienes permiso para acceder' },
        { status: 404 }
      );
    }

    // Get contributions
    const contributions = await getGoalContributions(id);

    return NextResponse.json({ contributions }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/goals/[id]/contributions:', error);
    return NextResponse.json(
      { error: 'Error al obtener contribuciones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals/[id]/contributions
 * Adds a new contribution to a savings goal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get goal ID from params
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID de meta es requerido' },
        { status: 400 }
      );
    }

    // Verify ownership
    const goal = await getGoalById(id, payload.userId);
    if (!goal) {
      return NextResponse.json(
        { error: 'Meta no encontrada o no tienes permiso para agregar contribuciones' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { amount, date, notes } = body;

    // Validate required fields
    if (!amount || !date) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: amount, date' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedAmount = sanitizeNumber(amount, 0, 0.01);
    const sanitizedNotes = notes ? sanitizeString(notes, 500) : null;

    // Validate sanitized values
    if (sanitizedAmount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Add contribution
    const contribution = await addContribution(id, {
      amount: sanitizedAmount,
      date,
      notes: sanitizedNotes,
    });

    // Get updated goal
    const updatedGoal = await getGoalById(id, payload.userId);

    return NextResponse.json({
      contribution,
      goal: updatedGoal,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/goals/[id]/contributions:', error);
    return NextResponse.json(
      { error: 'Error al agregar contribución' },
      { status: 500 }
    );
  }
}
