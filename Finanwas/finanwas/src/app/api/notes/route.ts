import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserNotes, createNote } from '@/lib/db/queries/notes';
import { sanitizeString, sanitizeTicker } from '@/lib/utils/sanitize';

/**
 * GET /api/notes
 * Returns all notes for the authenticated user with optional filters
 * Query params: tag, ticker, search, page, limit
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const ticker = searchParams.get('ticker');
    const search = searchParams.get('search');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    // Build filters
    const filters: any = {};

    if (tag) {
      filters.tags = [sanitizeString(tag)];
    }

    if (ticker) {
      filters.linkedTicker = sanitizeTicker(ticker);
    }

    if (search) {
      filters.searchQuery = sanitizeString(search);
    }

    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        filters.limit = limitNum;

        if (page) {
          const pageNum = parseInt(page, 10);
          if (!isNaN(pageNum) && pageNum > 0) {
            filters.offset = (pageNum - 1) * limitNum;
          }
        }
      }
    }

    // Get user notes
    const notes = await getUserNotes(payload.userId, filters);

    return NextResponse.json({
      notes,
      total: notes.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/notes:', error);
    return NextResponse.json(
      { error: 'Error al obtener notas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * Creates a new note for the authenticated user
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

    // Parse request body
    const body = await request.json();
    const { title, content, tags, linked_ticker } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: title, content' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title, 255);
    const sanitizedContent = sanitizeString(content, 10000);
    const sanitizedTags = Array.isArray(tags)
      ? tags.map((tag: string) => sanitizeString(tag, 50)).filter(Boolean)
      : [];
    const sanitizedTicker = linked_ticker ? sanitizeTicker(linked_ticker) : null;

    // Validate title length after sanitization
    if (sanitizedTitle.length === 0) {
      return NextResponse.json(
        { error: 'El título no puede estar vacío' },
        { status: 400 }
      );
    }

    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        { error: 'El contenido no puede estar vacío' },
        { status: 400 }
      );
    }

    // Create note
    const note = await createNote(payload.userId, {
      title: sanitizedTitle,
      content: sanitizedContent,
      tags: sanitizedTags,
      linked_ticker: sanitizedTicker,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/notes:', error);
    return NextResponse.json(
      { error: 'Error al crear nota' },
      { status: 500 }
    );
  }
}
