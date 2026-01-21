import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

// In-memory cache for dollar rates (1 hour)
let dollarCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * GET /api/market/dollar
 * Returns USD/ARS exchange rates from DolarApi
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

    // Check cache
    if (dollarCache && Date.now() - dollarCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(dollarCache.data, { status: 200 });
    }

    // Fetch from DolarApi
    try {
      const responses = await Promise.all([
        fetch('https://dolarapi.com/v1/dolares/oficial'),
        fetch('https://dolarapi.com/v1/dolares/blue'),
        fetch('https://dolarapi.com/v1/dolares/bolsa'), // MEP
        fetch('https://dolarapi.com/v1/dolares/contadoconliqui'), // CCL
      ]);

      const [oficialData, blueData, mepData, cclData] = await Promise.all(
        responses.map(r => r.json())
      );

      const response = {
        official: oficialData.venta || 0,
        blue: blueData.venta || 0,
        mep: mepData.venta || 0,
        ccl: cclData.venta || 0,
        timestamp: new Date().toISOString(),
        source: 'dolarapi.com',
      };

      // Cache the result
      dollarCache = {
        data: response,
        timestamp: Date.now(),
      };

      return NextResponse.json(response, { status: 200 });
    } catch (apiError: any) {
      console.error('DolarApi error:', apiError);
      return NextResponse.json(
        { error: 'No se pudo obtener cotización del dólar' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/market/dollar:', error);
    return NextResponse.json(
      { error: 'Error al obtener cotización del dólar' },
      { status: 500 }
    );
  }
}
