import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getGoalById, updateGoal, deleteGoal } from '@/lib/db/queries/goals';
import { sanitizeString, sanitizeNumber } from '@/lib/utils/sanitize';

/**
 * PUT /api/goals/[id]
 * Updates an existing savings goal
 */
export async function PUT(
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
    const existingGoal = await getGoalById(id, payload.userId);
    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Meta no encontrada o no tienes permiso para editarla' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, target_amount, currency, target_date, current_amount } = body;

    // Sanitize inputs if provided
    const updates: any = {};

    if (name !== undefined) {
      const sanitizedName = sanitizeString(name, 255);
      if (sanitizedName.length === 0) {
        return NextResponse.json(
          { error: 'El nombre de la meta no puede estar vacío' },
          { status: 400 }
        );
      }
      updates.name = sanitizedName;
    }

    if (target_amount !== undefined) {
      const sanitizedTargetAmount = sanitizeNumber(target_amount, 0, 0.01);
      if (sanitizedTargetAmount <= 0) {
        return NextResponse.json(
          { error: 'El monto objetivo debe ser mayor a 0' },
          { status: 400 }
        );
      }
      updates.target_amount = sanitizedTargetAmount;
    }

    if (currency !== undefined) {
      const sanitizedCurrency = sanitizeString(currency, 10).toUpperCase();
      if (sanitizedCurrency.length === 0) {
        return NextResponse.json(
          { error: 'La moneda no puede estar vacía' },
          { status: 400 }
        );
      }
      updates.currency = sanitizedCurrency;
    }

    if (target_date !== undefined) {
      updates.target_date = target_date;
    }

    if (current_amount !== undefined) {
      const sanitizedCurrentAmount = sanitizeNumber(current_amount, 0, 0);
      if (sanitizedCurrentAmount < 0) {
        return NextResponse.json(
          { error: 'El monto actual no puede ser negativo' },
          { status: 400 }
        );
      }
      updates.current_amount = sanitizedCurrentAmount;
    }

    // Update goal
    const goal = await updateGoal(id, payload.userId, updates);

    return NextResponse.json({ goal }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/goals/[id]:', error);
    if (error.message.includes('no encontrada') || error.message.includes('permiso')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Error al actualizar meta de ahorro' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goals/[id]
 * Deletes a savings goal and its contributions
 */
export async function DELETE(
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

    // Verify ownership before deleting
    const existingGoal = await getGoalById(id, payload.userId);
    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Meta no encontrada o no tienes permiso para eliminarla' },
        { status: 404 }
      );
    }

    // Delete goal (cascade deletes contributions)
    await deleteGoal(id, payload.userId);

    return NextResponse.json(
      { message: 'Meta de ahorro eliminada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/goals/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar meta de ahorro' },
      { status: 500 }
    );
  }
}
