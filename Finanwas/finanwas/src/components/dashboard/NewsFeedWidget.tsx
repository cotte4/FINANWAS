'use client'

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ExternalLinkIcon, NewspaperIcon, TrendingUpIcon, BitcoinIcon, BuildingIcon } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from "@/lib/utils"

/**
 * News Feed Widget for Dashboard
 *
 * Features:
 * - Personalized news based on portfolio holdings
 * - Market news (Argentina business news)
 * - Cryptocurrency news
 * - Economy news
 * - Tabs to filter by category
 * - External link to full articles
 */

interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  imageUrl: string | null
  source: string
  publishedAt: string
  category?: 'market' | 'company' | 'economy' | 'crypto'
}

interface NewsFeedData {
  portfolio: NewsArticle[]
  market: NewsArticle[]
  crypto: NewsArticle[]
  economy: NewsArticle[]
  timestamp: string
}

interface NewsFeedWidgetProps {
  className?: string
}

export function NewsFeedWidget({ className }: NewsFeedWidgetProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [news, setNews] = React.useState<NewsFeedData | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchNews() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/news')
        if (!response.ok) throw new Error('Error al cargar noticias')

        const result = await response.json()

        if (result.success) {
          setNews(result.data)
        } else {
          throw new Error(result.error || 'Error desconocido')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Calculate total news count
  const newsCount = React.useMemo(() => {
    if (!news) return 0
    return news.portfolio.length + news.market.length + news.crypto.length + news.economy.length
  }, [news])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <NewspaperIcon className="size-5 text-primary" />
            <CardTitle>Noticias Financieras</CardTitle>
          </div>
          <CardDescription>Últimas noticias personalizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <NewspaperIcon className="size-5 text-primary" />
            <CardTitle>Noticias Financieras</CardTitle>
          </div>
          <CardDescription>Últimas noticias personalizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <NewspaperIcon className="size-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!news || newsCount === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <NewspaperIcon className="size-5 text-primary" />
            <CardTitle>Noticias Financieras</CardTitle>
          </div>
          <CardDescription>Últimas noticias personalizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <NewspaperIcon className="size-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No hay noticias disponibles en este momento.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <NewspaperIcon className="size-5 text-primary" />
          <CardTitle>Noticias Financieras</CardTitle>
        </div>
        <CardDescription>
          {newsCount} {newsCount === 1 ? 'noticia actualizada' : 'noticias actualizadas'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={news.portfolio.length > 0 ? "portfolio" : "market"} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            {news.portfolio.length > 0 && (
              <TabsTrigger value="portfolio" className="text-xs">
                <BuildingIcon className="size-3 mr-1" />
                Portfolio
                {news.portfolio.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                    {news.portfolio.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger value="market" className="text-xs">
              <TrendingUpIcon className="size-3 mr-1" />
              Mercado
              {news.market.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                  {news.market.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="crypto" className="text-xs">
              <BitcoinIcon className="size-3 mr-1" />
              Crypto
              {news.crypto.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                  {news.crypto.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="economy" className="text-xs">
              Economía
              {news.economy.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                  {news.economy.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {news.portfolio.length > 0 && (
            <TabsContent value="portfolio" className="mt-0">
              <NewsArticleList articles={news.portfolio} />
            </TabsContent>
          )}

          <TabsContent value="market" className="mt-0">
            <NewsArticleList articles={news.market} />
          </TabsContent>

          <TabsContent value="crypto" className="mt-0">
            <NewsArticleList articles={news.crypto} />
          </TabsContent>

          <TabsContent value="economy" className="mt-0">
            <NewsArticleList articles={news.economy} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function NewsArticleList({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <NewspaperIcon className="size-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No hay noticias en esta categoría.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {articles.slice(0, 10).map((article) => (
        <NewsArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}

function NewsArticleCard({ article }: { article: NewsArticle }) {
  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(article.publishedAt), {
        addSuffix: true,
        locale: es
      })
    } catch {
      return ''
    }
  }, [article.publishedAt])

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
      )}
    >
      <div className="flex gap-3">
        {article.imageUrl && (
          <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h4>
            <ExternalLinkIcon className="size-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          </div>
          {article.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {article.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{article.source}</span>
            {timeAgo && (
              <>
                <span>•</span>
                <span>{timeAgo}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  )
}
