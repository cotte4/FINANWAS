import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getAssetById, updateAsset, deleteAsset } from '@/lib/db/queries/portfolio';
import { sanitizeString, sanitizeTicker, sanitizeNumber } from '@/lib/utils/sanitize';

/**
 * PUT /api/portfolio/[id]
 * Updates an existing portfolio asset
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

    // Get asset ID from params
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID de activo es requerido' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingAsset = await getAssetById(id, payload.userId);
    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Activo no encontrado o no tienes permiso para editarlo' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, ticker, name, quantity, purchase_price, purchase_date, currency, notes } = body;

    // Sanitize inputs if provided
    const updates: any = {};

    if (type !== undefined) {
      const sanitizedType = sanitizeString(type, 50);
      if (sanitizedType.length === 0) {
        return NextResponse.json(
          { error: 'El tipo no puede estar vacío' },
          { status: 400 }
        );
      }
      updates.type = sanitizedType;
    }

    if (ticker !== undefined) {
      updates.ticker = ticker ? sanitizeTicker(ticker) : null;
    }

    if (name !== undefined) {
      const sanitizedName = sanitizeString(name, 255);
      if (sanitizedName.length === 0) {
        return NextResponse.json(
          { error: 'El nombre no puede estar vacío' },
          { status: 400 }
        );
      }
      updates.name = sanitizedName;
    }

    if (quantity !== undefined) {
      const sanitizedQuantity = sanitizeNumber(quantity, 0, 0.00000001);
      if (sanitizedQuantity <= 0) {
        return NextResponse.json(
          { error: 'Cantidad debe ser mayor a 0' },
          { status: 400 }
        );
      }
      updates.quantity = sanitizedQuantity;
    }

    if (purchase_price !== undefined) {
      const sanitizedPurchasePrice = sanitizeNumber(purchase_price, 0, 0.01);
      if (sanitizedPurchasePrice <= 0) {
        return NextResponse.json(
          { error: 'Precio debe ser mayor a 0' },
          { status: 400 }
        );
      }
      updates.purchase_price = sanitizedPurchasePrice;
    }

    if (purchase_date !== undefined) {
      updates.purchase_date = purchase_date;
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

    if (notes !== undefined) {
      updates.notes = notes ? sanitizeString(notes, 1000) : null;
    }

    // Update asset
    const asset = await updateAsset(id, payload.userId, updates);

    return NextResponse.json({ asset }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/portfolio/[id]:', error);
    if (error.message.includes('no encontrado') || error.message.includes('permiso')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Error al actualizar activo' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portfolio/[id]
 * Deletes a portfolio asset
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

    // Get asset ID from params
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID de activo es requerido' },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const existingAsset = await getAssetById(id, payload.userId);
    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Activo no encontrado o no tienes permiso para eliminarlo' },
        { status: 404 }
      );
    }

    // Delete asset
    await deleteAsset(id, payload.userId);

    return NextResponse.json(
      { message: 'Activo eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/portfolio/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar activo' },
      { status: 500 }
    );
  }
}
