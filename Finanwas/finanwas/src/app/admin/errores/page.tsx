'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/useToast';
import {
  AlertTriangleIcon,
  AlertCircleIcon,
  InfoIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  ServerIcon,
  MonitorIcon,
  CloudIcon,
} from 'lucide-react';
import { ErrorLogResponse } from '@/lib/monitoring/logger';

interface ErrorStats {
  total: number;
  unresolved: number;
  critical: number;
  byLevel: {
    error: number;
    warning: number;
    critical: number;
  };
  bySource: {
    client: number;
    server: number;
    api: number;
  };
}

/**
 * Admin Error Monitoring Dashboard
 * View and manage application errors
 */
export default function AdminErrorsPage() {
  const [errors, setErrors] = React.useState<ErrorLogResponse[]>([]);
  const [stats, setStats] = React.useState<ErrorStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<{
    level?: string;
    source?: string;
    resolved?: boolean;
  }>({});
  const toast = useToast();

  React.useEffect(() => {
    fetchErrors();
  }, [filter]);

  const fetchErrors = async () => {
    try {
      setIsLoading(true);

      // Build query string
      const params = new URLSearchParams();
      if (filter.level) params.append('level', filter.level);
      if (filter.source) params.append('source', filter.source);
      if (filter.resolved !== undefined) params.append('resolved', String(filter.resolved));

      const response = await fetch(`/api/admin/errors?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error al cargar errores');
      }

      const data = await response.json();
      setErrors(data.errors || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching errors:', error);
      toast.error('Error al cargar los registros de errores');
      setErrors([]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsResolved = async (errorId: string, resolved: boolean) => {
    try {
      const response = await fetch('/api/admin/errors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorId, resolved }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar error');
      }

      toast.success(resolved ? 'Error marcado como resuelto' : 'Error marcado como no resuelto');
      fetchErrors();
    } catch (error) {
      console.error('Error updating error:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangleIcon className="size-4 text-destructive" />;
      case 'error':
        return <AlertCircleIcon className="size-4 text-orange-500" />;
      case 'warning':
        return <InfoIcon className="size-4 text-yellow-500" />;
      default:
        return <InfoIcon className="size-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'client':
        return <MonitorIcon className="size-4" />;
      case 'server':
        return <ServerIcon className="size-4" />;
      case 'api':
        return <CloudIcon className="size-4" />;
      default:
        return <ServerIcon className="size-4" />;
    }
  };

  const getLevelBadgeVariant = (level: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'default';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Monitor de Errores"
        description="Visualiza y gestiona errores de la aplicación"
        action={
          <Button onClick={() => fetchErrors()} variant="outline">
            <RefreshCwIcon className="size-4" />
            Actualizar
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total de Errores"
          value={stats?.total || 0}
          description="Últimos 10,000 errores"
          icon={AlertCircleIcon}
          variant="secondary"
          isLoading={isLoading}
        />
        <StatsCard
          title="Sin Resolver"
          value={stats?.unresolved || 0}
          description="Requieren atención"
          icon={AlertTriangleIcon}
          variant="primary"
          isLoading={isLoading}
        />
        <StatsCard
          title="Críticos"
          value={stats?.critical || 0}
          description="Prioridad alta"
          icon={AlertTriangleIcon}
          variant="destructive"
          isLoading={isLoading}
        />
        <StatsCard
          title="Cliente"
          value={stats?.bySource.client || 0}
          description="Errores del navegador"
          icon={MonitorIcon}
          variant="success"
          isLoading={isLoading}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra errores por nivel, origen y estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!filter.level ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter({ ...filter, level: undefined })}
            >
              Todos
            </Button>
            <Button
              variant={filter.level === 'critical' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setFilter({ ...filter, level: 'critical' })}
            >
              Críticos ({stats?.byLevel.critical || 0})
            </Button>
            <Button
              variant={filter.level === 'error' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter({ ...filter, level: 'error' })}
            >
              Errores ({stats?.byLevel.error || 0})
            </Button>
            <Button
              variant={filter.level === 'warning' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setFilter({ ...filter, level: 'warning' })}
            >
              Advertencias ({stats?.byLevel.warning || 0})
            </Button>
            <div className="w-px h-8 bg-border mx-2" />
            <Button
              variant={filter.resolved === false ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setFilter({ ...filter, resolved: filter.resolved === false ? undefined : false })
              }
            >
              Solo no resueltos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Errors List */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Errores</CardTitle>
          <CardDescription>
            Mostrando {errors.length} error{errors.length !== 1 ? 'es' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : errors.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="size-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">
                {filter.level || filter.source || filter.resolved !== undefined
                  ? 'No se encontraron errores con estos filtros'
                  : 'No hay errores registrados'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {errors.map((error) => (
                <Card key={error.id} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 shrink-0">
                            {getLevelIcon(error.level)}
                            {getSourceIcon(error.source)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2">{error.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(error.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={getLevelBadgeVariant(error.level)}>
                            {error.level}
                          </Badge>
                          <Badge variant="outline">{error.source}</Badge>
                          {error.resolved && (
                            <Badge variant="secondary">
                              <CheckCircleIcon className="size-3 mr-1" />
                              Resuelto
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      {(error.url || error.error_code) && (
                        <div className="text-xs text-muted-foreground space-y-1 pl-9">
                          {error.url && (
                            <p>
                              <span className="font-medium">URL:</span> {error.url}
                            </p>
                          )}
                          {error.error_code && (
                            <p>
                              <span className="font-medium">Código:</span> {error.error_code}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Stack Trace */}
                      {error.stack_trace && (
                        <details className="pl-9">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            Ver stack trace
                          </summary>
                          <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-x-auto">
                            {error.stack_trace}
                          </pre>
                        </details>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        {!error.resolved ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsResolved(error.id, true)}
                          >
                            <CheckCircleIcon className="size-4" />
                            Marcar como resuelto
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsResolved(error.id, false)}
                          >
                            Marcar como no resuelto
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
