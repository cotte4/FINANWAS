'use client'

import * as React from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchIcon, BookIcon, ExternalLinkIcon } from "lucide-react"
import { toast } from "sonner"

/**
 * Glossary Page
 * Searchable financial terms dictionary with alphabetical navigation
 * US-047: Glossary page with search
 */

interface GlossaryTerm {
  term: string
  definition: string
  related_terms: string[]
  related_lesson: string | null
}

export default function GlosarioPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedLetter, setSelectedLetter] = React.useState<string | null>(null)
  const [terms, setTerms] = React.useState<GlossaryTerm[]>([])

  // Fetch glossary terms
  React.useEffect(() => {
    async function loadGlossary() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/glossary')
        if (!response.ok) throw new Error('Failed to fetch glossary')
        const { terms: glossaryTerms } = await response.json()
        setTerms(glossaryTerms)
      } catch (error) {
        console.error('Error loading glossary:', error)
        toast.error('Error al cargar el glosario')
      } finally {
        setIsLoading(false)
      }
    }

    loadGlossary()
  }, [])

  const alphabet = React.useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), [])

  const filteredTerms = React.useMemo(() => terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLetter = !selectedLetter || term.term.toUpperCase().startsWith(selectedLetter)
    return matchesSearch && matchesLetter
  }), [terms, searchQuery, selectedLetter])

  // Group terms by first letter
  const groupedTerms = React.useMemo(() => filteredTerms.reduce((acc, term) => {
    const firstLetter = term.term[0].toUpperCase()
    if (!acc[firstLetter]) {
      acc[firstLetter] = []
    }
    acc[firstLetter].push(term)
    return acc
  }, {} as Record<string, GlossaryTerm[]>), [filteredTerms])

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Glosario Financiero"
        description="Diccionario de términos financieros y de inversión"
      />

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar término..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Alphabet Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Navegar por letra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedLetter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLetter(null)}
            >
              Todas
            </Button>
            {alphabet.map((letter) => {
              const hasTerms = terms.some(t => t.term.toUpperCase().startsWith(letter))
              return (
                <Button
                  key={letter}
                  variant={selectedLetter === letter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLetter(letter)}
                  disabled={!hasTerms}
                >
                  {letter}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Terms List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredTerms.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookIcon className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron términos</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTerms)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, letterTerms]) => (
              <div key={letter} className="space-y-4">
                <h2 className="text-3xl font-bold text-primary">{letter}</h2>
                <div className="space-y-4">
                  {letterTerms.map((term, index) => (
                    <Card key={`${term.term}-${index}`}>
                      <CardHeader>
                        <CardTitle className="text-xl">{term.term}</CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {term.definition}
                        </CardDescription>
                      </CardHeader>
                      {(term.related_terms.length > 0 || term.related_lesson) && (
                        <CardContent className="space-y-3">
                          {term.related_terms.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Términos relacionados:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {term.related_terms.map((related, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {related}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {term.related_lesson && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Lección relacionada:
                              </p>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/aprender${term.related_lesson}`}>
                                  Ver lección
                                  <ExternalLinkIcon className="ml-2 size-3" />
                                </Link>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas del Glosario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{terms.length}</p>
              <p className="text-sm text-muted-foreground">Términos totales</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {terms.filter(t => t.related_lesson).length}
              </p>
              <p className="text-sm text-muted-foreground">Con lecciones relacionadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {Object.keys(groupedTerms).length}
              </p>
              <p className="text-sm text-muted-foreground">Letras con términos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
