import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserAssets, updateAssetPrice } from '@/lib/db/queries/portfolio';
import yahooFinance from 'yahoo-finance2';

/**
 * POST /api/portfolio/refresh-prices
 * Updates current prices for all assets with tickers using Yahoo Finance
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

    // Get all user assets
    const assets = await getUserAssets(payload.userId);

    // Filter assets that have tickers
    const assetsWithTickers = assets.filter(asset => asset.ticker);

    if (assetsWithTickers.length === 0) {
      return NextResponse.json({
        updated: 0,
        failed: 0,
        assets: [],
        message: 'No hay activos con ticker para actualizar',
      }, { status: 200 });
    }

    let updated = 0;
    let failed = 0;
    const updatedAssets: any[] = [];

    // Update prices for all assets in parallel for better performance
    const updatePromises = assetsWithTickers.map(async (asset) => {
      try {
        const quote = await yahooFinance.quote(asset.ticker!) as any;

        if (quote && quote.regularMarketPrice) {
          const updatedAsset = await updateAssetPrice(
            asset.id,
            quote.regularMarketPrice,
            'yahoo-finance'
          );
          return { success: true, asset: updatedAsset };
        } else {
          console.warn(`No price data for ticker: ${asset.ticker}`);
          return { success: false };
        }
      } catch (error) {
        console.error(`Error updating price for ${asset.ticker}:`, error);
        return { success: false };
      }
    });

    const results = await Promise.allSettled(updatePromises);

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        updatedAssets.push(result.value.asset);
        updated++;
      } else {
        failed++;
      }
    });

    return NextResponse.json({
      updated,
      failed,
      assets: updatedAssets,
      message: `Actualizado ${updated} de ${assetsWithTickers.length} activos`,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/portfolio/refresh-prices:', error);
    return NextResponse.json(
      { error: 'Error al actualizar precios del portafolio' },
      { status: 500 }
    );
  }
}
