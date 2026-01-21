import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In-memory cache for glossary terms (1 hour)
// Glossary is static content that rarely changes
let glossaryCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * GET /api/glossary
 * Returns all glossary terms with 1-hour caching
 */
export async function GET() {
  try {
    // Check cache first
    if (glossaryCache && Date.now() - glossaryCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(glossaryCache.data, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600', // 1 hour browser cache
        },
      });
    }

    const glossaryPath = path.join(process.cwd(), 'content', 'glossary', 'terms.json');

    if (!fs.existsSync(glossaryPath)) {
      return NextResponse.json(
        { error: 'Glosario no encontrado' },
        { status: 404 }
      );
    }

    const glossaryContent = fs.readFileSync(glossaryPath, 'utf-8');
    const glossaryData = JSON.parse(glossaryContent);

    // Support both formats: direct array or wrapped in {terms} object
    const terms = Array.isArray(glossaryData) ? glossaryData : glossaryData.terms;
    const response = { terms };

    // Update cache
    glossaryCache = {
      data: response,
      timestamp: Date.now(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1 hour browser cache
      },
    });
  } catch (error) {
    console.error('Error in GET /api/glossary:', error);
    return NextResponse.json(
      { error: 'Error al obtener el glosario' },
      { status: 500 }
    );
  }
}
