'use client'

import * as React from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { SwipeableCard } from "@/components/ui/SwipeableCard"
import { PullToRefresh } from "@/components/ui/PullToRefresh"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  Edit2Icon,
  Trash2Icon,
  TagIcon,
  TrendingUpIcon,
  LoaderIcon,
  XIcon,
} from "lucide-react"
import type { Note } from "@/types/database"

/**
 * Notes Page - US-077, US-078
 * List and manage investment notes with search and filters
 */

interface NoteFormData {
  title: string
  content: string
  tags: string[]
  linked_ticker: string
}

export default function NotasPage() {
  const [notes, setNotes] = React.useState<Note[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null)

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form state
  const [noteForm, setNoteForm] = React.useState<NoteFormData>({
    title: '',
    content: '',
    tags: [],
    linked_ticker: '',
  })
  const [tagInput, setTagInput] = React.useState('')

  // Fetch notes from API - US-077
  const fetchNotes = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notes')

      if (!response.ok) {
        throw new Error('Error al cargar notas')
      }

      const data = await response.json()
      setNotes(data.notes || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Error al cargar notas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // Create note - US-078
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!noteForm.title || !noteForm.content) {
      toast.error('Por favor completá el título y contenido')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteForm.title,
          content: noteForm.content,
          tags: noteForm.tags,
          linked_ticker: noteForm.linked_ticker || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear nota')
      }

      toast.success('Nota creada exitosamente')
      setShowCreateDialog(false)
      setNoteForm({ title: '', content: '', tags: [], linked_ticker: '' })
      setTagInput('')
      await fetchNotes()
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear nota')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit note - US-078
  const handleEditNote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!showEditDialog || !noteForm.title || !noteForm.content) {
      toast.error('Por favor completá el título y contenido')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/notes/${showEditDialog}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteForm.title,
          content: noteForm.content,
          tags: noteForm.tags,
          linked_ticker: noteForm.linked_ticker || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar nota')
      }

      toast.success('Nota actualizada exitosamente')
      setShowEditDialog(null)
      setNoteForm({ title: '', content: '', tags: [], linked_ticker: '' })
      setTagInput('')
      await fetchNotes()
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar nota')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete note - US-078
  const handleDeleteNote = async () => {
    if (!showDeleteDialog) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/notes/${showDeleteDialog}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar nota')
      }

      toast.success('Nota eliminada exitosamente')
      setShowDeleteDialog(null)
      await fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar nota')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit dialog with note data
  const openEditDialog = React.useCallback((note: Note) => {
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      linked_ticker: note.linked_ticker || '',
    })
    setShowEditDialog(note.id)
  }, [])

  // Tag management
  const addTag = React.useCallback(() => {
    const trimmedTag = tagInput.trim().toLowerCase()
    if (trimmedTag && !noteForm.tags.includes(trimmedTag)) {
      setNoteForm({ ...noteForm, tags: [...noteForm.tags, trimmedTag] })
      setTagInput('')
    }
  }, [tagInput, noteForm])

  const removeTag = React.useCallback((tagToRemove: string) => {
    setNoteForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }, [])

  const handleTagInputKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }, [addTag])

  // Get all unique tags with memoization - US-077
  const allTags = React.useMemo(() => {
    return [...new Set(notes.flatMap(note => note.tags || []))]
  }, [notes])

  // Filter notes with memoization - US-077
  const filteredNotes = React.useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.linked_ticker?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag))
      return matchesSearch && matchesTag
    })
  }, [notes, searchQuery, selectedTag])

  const formatDate = React.useCallback((dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }, [])

  // Calculate stats with memoization
  const stats = React.useMemo(() => {
    const withTicker = notes.filter(n => n.linked_ticker).length
    const thisMonth = notes.filter(n => {
      const noteDate = new Date(n.created_at)
      const now = new Date()
      return noteDate.getMonth() === now.getMonth() &&
        noteDate.getFullYear() === now.getFullYear()
    }).length
    return { withTicker, thisMonth }
  }, [notes])

  return (
    <PullToRefresh onRefresh={fetchNotes}>
      <div className="p-6 space-y-8">
      <PageHeader
        title="Mis Notas"
        description="Notas y análisis de inversiones"
        action={
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusIcon className="mr-2 size-4" />
            Nueva Nota
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag(null)}
          >
            Todas
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(tag)}
            >
              <TagIcon className="mr-1 size-3" />
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={FileTextIcon}
              title={searchQuery || selectedTag ? "No se encontraron notas" : "No tenés notas guardadas"}
              description={searchQuery || selectedTag
                ? "Intentá con otros términos de búsqueda o filtros"
                : "¡Creá tu primera nota para guardar análisis e ideas de inversión!"}
              action={!searchQuery && !selectedTag ? {
                label: "Crear Nota",
                onClick: () => setShowCreateDialog(true)
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <SwipeableCard
              key={note.id}
              onDelete={() => setShowDeleteDialog(note.id)}
              deleteLabel="Eliminar"
              className="md:pointer-events-none"
            >
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {note.linked_ticker && (
                      <Badge variant="default" className="shrink-0">
                        <TrendingUpIcon className="mr-1 size-3" />
                        {note.linked_ticker}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Actualizada: {formatDate(note.updated_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(note)}
                    >
                      <Edit2Icon className="mr-2 size-4" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive md:inline-flex hidden"
                      onClick={() => setShowDeleteDialog(note.id)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SwipeableCard>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
            <FileTextIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags Únicos</CardTitle>
            <TagIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Ticker</CardTitle>
            <TrendingUpIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.withTicker}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <FileTextIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.thisMonth}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Note Dialog - US-078 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Nota</DialogTitle>
            <DialogDescription>
              Creá una nueva nota para documentar tus análisis e ideas de inversión.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNote}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="ej. Análisis de Apple Q4 2023"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Contenido *</Label>
                <Textarea
                  id="content"
                  placeholder="Escribe tus notas aquí..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  rows={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linked_ticker">Ticker relacionado (opcional)</Label>
                <Input
                  id="linked_ticker"
                  placeholder="ej. AAPL"
                  value={noteForm.linked_ticker}
                  onChange={(e) => setNoteForm({ ...noteForm, linked_ticker: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Agregar tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                  />
                  <Button type="button" onClick={addTag}>
                    Agregar
                  </Button>
                </div>
                {noteForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {noteForm.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Crear Nota
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog - US-078 */}
      <Dialog open={!!showEditDialog} onOpenChange={() => setShowEditDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Nota</DialogTitle>
            <DialogDescription>
              Modificá los detalles de tu nota.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditNote}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  placeholder="ej. Análisis de Apple Q4 2023"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Contenido *</Label>
                <Textarea
                  id="edit-content"
                  placeholder="Escribe tus notas aquí..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  rows={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-linked_ticker">Ticker relacionado (opcional)</Label>
                <Input
                  id="edit-linked_ticker"
                  placeholder="ej. AAPL"
                  value={noteForm.linked_ticker}
                  onChange={(e) => setNoteForm({ ...noteForm, linked_ticker: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-tags"
                    placeholder="Agregar tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                  />
                  <Button type="button" onClick={addTag}>
                    Agregar
                  </Button>
                </div>
                {noteForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {noteForm.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Note Dialog - US-078 */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Nota</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar esta nota? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(null)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNote}
              disabled={isSubmitting}
            >
              {isSubmitting && <LoaderIcon className="mr-2 size-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </PullToRefresh>
  )
}
