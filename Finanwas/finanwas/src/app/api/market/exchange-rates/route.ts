import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getExchangeRates, getExchangeRate, convertCurrency } from '@/lib/services/exchange-rates';

/**
 * GET /api/market/exchange-rates
 * Returns all exchange rates (USD base) or specific conversion
 *
 * Query parameters:
 * - from: Source currency (optional)
 * - to: Target currency (optional)
 * - amount: Amount to convert (optional, defaults to 1)
 *
 * Examples:
 * - /api/market/exchange-rates (returns all rates)
 * - /api/market/exchange-rates?from=USD&to=ARS (returns USD to ARS rate)
 * - /api/market/exchange-rates?from=EUR&to=USD&amount=100 (converts 100 EUR to USD)
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const fromCurrency = searchParams.get('from');
    const toCurrency = searchParams.get('to');
    const amountParam = searchParams.get('amount');

    // If specific conversion requested
    if (fromCurrency && toCurrency) {
      const amount = amountParam ? parseFloat(amountParam) : 1;

      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount parameter' },
          { status: 400 }
        );
      }

      const convertedAmount = await convertCurrency(amount, fromCurrency, toCurrency);
      const rate = await getExchangeRate(fromCurrency, toCurrency);

      return NextResponse.json({
        from: fromCurrency,
        to: toCurrency,
        amount,
        converted: convertedAmount,
        rate,
        timestamp: new Date().toISOString(),
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=3600', // 1 hour browser cache
        },
      });
    }

    // Return all exchange rates
    const rates = await getExchangeRates();

    return NextResponse.json({
      base: rates.base,
      rates: rates.rates,
      timestamp: new Date(rates.timestamp).toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=3600', // 1 hour browser cache
      },
    });
  } catch (error) {
    console.error('Error in GET /api/market/exchange-rates:', error);
    return NextResponse.json(
      { error: 'Error al obtener tasas de cambio' },
      { status: 500 }
    );
  }
}
