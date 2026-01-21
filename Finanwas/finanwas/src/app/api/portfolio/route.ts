import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserAssets, createAsset, getPortfolioSummary } from '@/lib/db/queries/portfolio';
import { getUserPreferredCurrency } from '@/lib/db/queries/user-preferences';
import { sanitizeString, sanitizeTicker, sanitizeNumber } from '@/lib/utils/sanitize';
import { logApiError } from '@/lib/monitoring/logger';

/**
 * GET /api/portfolio
 * Returns all portfolio assets for the authenticated user with summary
 */
export async function GET(request: NextRequest) {
  let userId: string | undefined;

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

    userId = payload.userId;

    // Get user's preferred currency
    const preferredCurrency = await getUserPreferredCurrency(payload.userId);

    // Get user assets and summary (in preferred currency)
    const assets = await getUserAssets(payload.userId);
    const summary = await getPortfolioSummary(payload.userId, preferredCurrency);

    return NextResponse.json({
      assets,
      summary: {
        totalValue: summary.totalCurrentValue,
        totalInvested: summary.totalInvested,
        totalGainLoss: summary.totalGainLoss,
        totalGainLossPercent: summary.percentageGainLoss,
        currency: summary.currency,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/portfolio:', error);

    // Log error to monitoring system
    await logApiError(error, {
      endpoint: '/api/portfolio',
      method: 'GET',
      userId,
      statusCode: 500,
    });

    return NextResponse.json(
      { error: 'Error al obtener activos del portafolio' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio
 * Creates a new portfolio asset for the authenticated user
 */
export async function POST(request: NextRequest) {
  let userId: string | undefined;
  let requestBody: any;

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

    userId = payload.userId;

    // Parse request body
    const body = await request.json();
    requestBody = body;
    const { type, ticker, name, quantity, purchase_price, purchase_date, currency, notes } = body;

    // Validate required fields
    if (!type || !name || !quantity || !purchase_price || !purchase_date || !currency) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: type, name, quantity, purchase_price, purchase_date, currency' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedType = sanitizeString(type, 50);
    const sanitizedTicker = ticker ? sanitizeTicker(ticker) : null;
    const sanitizedName = sanitizeString(name, 255);
    const sanitizedQuantity = sanitizeNumber(quantity, 0, 0.00000001);
    const sanitizedPurchasePrice = sanitizeNumber(purchase_price, 0, 0.01);
    const sanitizedCurrency = sanitizeString(currency, 10).toUpperCase();
    const sanitizedNotes = notes ? sanitizeString(notes, 1000) : null;

    // Validate numeric values after sanitization
    if (sanitizedQuantity <= 0 || sanitizedPurchasePrice <= 0) {
      return NextResponse.json(
        { error: 'Cantidad y precio deben ser mayores a 0' },
        { status: 400 }
      );
    }

    // Validate sanitized strings
    if (!sanitizedType || !sanitizedName || !sanitizedCurrency) {
      return NextResponse.json(
        { error: 'Los campos tipo, nombre y moneda no pueden estar vacíos' },
        { status: 400 }
      );
    }

    // Create asset
    const asset = await createAsset(payload.userId, {
      type: sanitizedType,
      ticker: sanitizedTicker,
      name: sanitizedName,
      quantity: sanitizedQuantity,
      purchase_price: sanitizedPurchasePrice,
      purchase_date,
      currency: sanitizedCurrency,
      notes: sanitizedNotes,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/portfolio:', error);

    // Log error to monitoring system
    await logApiError(error, {
      endpoint: '/api/portfolio',
      method: 'POST',
      userId,
      requestData: requestBody,
      statusCode: 500,
    });

    return NextResponse.json(
      { error: 'Error al crear activo en portafolio' },
      { status: 500 }
    );
  }
}
