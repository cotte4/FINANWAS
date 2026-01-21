import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/glossary
 * Returns all glossary terms
 */
export async function GET() {
  try {
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
    return NextResponse.json({ terms }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/glossary:', error);
    return NextResponse.json(
      { error: 'Error al obtener el glosario' },
      { status: 500 }
    );
  }
}
