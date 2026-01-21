import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getNoteById, updateNote, deleteNote } from '@/lib/db/queries/notes';
import { sanitizeString, sanitizeTicker } from '@/lib/utils/sanitize';

/**
 * PUT /api/notes/[id]
 * Updates an existing note
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

    // Get note ID from params
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID de nota es requerido' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingNote = await getNoteById(id, payload.userId);
    if (!existingNote) {
      return NextResponse.json(
        { error: 'Nota no encontrada o no tienes permiso para editarla' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, content, tags, linked_ticker } = body;

    // Sanitize inputs if provided
    const updates: any = {};

    if (title !== undefined) {
      const sanitizedTitle = sanitizeString(title, 255);
      if (sanitizedTitle.length === 0) {
        return NextResponse.json(
          { error: 'El título no puede estar vacío' },
          { status: 400 }
        );
      }
      updates.title = sanitizedTitle;
    }

    if (content !== undefined) {
      const sanitizedContent = sanitizeString(content, 10000);
      if (sanitizedContent.length === 0) {
        return NextResponse.json(
          { error: 'El contenido no puede estar vacío' },
          { status: 400 }
        );
      }
      updates.content = sanitizedContent;
    }

    if (tags !== undefined) {
      updates.tags = Array.isArray(tags)
        ? tags.map((tag: string) => sanitizeString(tag, 50)).filter(Boolean)
        : [];
    }

    if (linked_ticker !== undefined) {
      updates.linked_ticker = linked_ticker ? sanitizeTicker(linked_ticker) : null;
    }

    // Update note
    const note = await updateNote(id, payload.userId, updates);

    return NextResponse.json({ note }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/notes/[id]:', error);
    if (error.message.includes('no encontrada') || error.message.includes('permiso')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Error al actualizar nota' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/[id]
 * Deletes a note
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

    // Get note ID from params
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID de nota es requerido' },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const existingNote = await getNoteById(id, payload.userId);
    if (!existingNote) {
      return NextResponse.json(
        { error: 'Nota no encontrada o no tienes permiso para eliminarla' },
        { status: 404 }
      );
    }

    // Delete note
    await deleteNote(id, payload.userId);

    return NextResponse.json(
      { message: 'Nota eliminada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/notes/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar nota' },
      { status: 500 }
    );
  }
}
