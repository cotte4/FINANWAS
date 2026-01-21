import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getQuote, getKeyStats } from '@/lib/api/yahoo-finance';

/**
 * GET /api/market/stock/[ticker]
 * Returns combined stock quote and key statistics from Yahoo Finance
 * Cached for 15 minutes at the yahoo-finance module level
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
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

    // Get ticker from params
    const { ticker } = await params;
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker es requerido' },
        { status: 400 }
      );
    }

    const tickerUpper = ticker.toUpperCase();

    // Fetch from Yahoo Finance (both quote and key stats)
    try {
      const [quoteData, statsData] = await Promise.all([
        getQuote(tickerUpper),
        getKeyStats(tickerUpper),
      ]);

      if (!quoteData) {
        return NextResponse.json(
          { error: 'No encontramos esa empresa' },
          { status: 404 }
        );
      }

      const response = {
        quote: {
          ticker: quoteData.symbol,
          price: quoteData.price,
          change: quoteData.change,
          changePercent: quoteData.changePercent,
          currency: quoteData.currency,
          timestamp: quoteData.lastUpdate.toISOString(),
        },
        stats: {
          peRatio: statsData?.peRatio ?? null,
          pbRatio: statsData?.pbRatio ?? null,
          roe: statsData?.roe ?? null,
          roa: statsData?.roa ?? null,
          debtToEquity: statsData?.debtToEquity ?? null,
          dividendYield: statsData?.dividendYield ?? null,
          marketCap: statsData?.marketCap ?? null,
          sector: statsData?.sector ?? null,
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (apiError: any) {
      console.error('Yahoo Finance API error:', apiError);

      // Check for specific error messages
      if (apiError.message?.includes('No encontramos esa empresa') ||
          apiError.message?.includes('no existe o no está disponible')) {
        return NextResponse.json(
          { error: 'No encontramos esa empresa' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Error al obtener datos' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/market/stock/[ticker]:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de mercado' },
      { status: 500 }
    );
  }
}
