'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/useToast';
import { CopyIcon, PlusIcon, ChevronLeftIcon, CheckIcon } from 'lucide-react';

interface InvitationCode {
  id: string;
  code: string;
  status: 'available' | 'used';
  usedBy: string | null;
  usedAt: string | null;
  createdAt: string;
}

/**
 * Admin Invitation Codes Page (US-081)
 * Manage invitation codes for new user registrations
 */
export default function AdminInvitationCodesPage() {
  const [codes, setCodes] = React.useState<InvitationCode[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const toast = useToast();

  React.useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      setIsLoading(true);

      // TODO: API Endpoints Agent is building this endpoint
      // Fetch codes from GET /api/admin/codes
      const response = await fetch('/api/admin/codes');

      if (!response.ok) {
        throw new Error('Error al cargar códigos');
      }

      const data = await response.json();

      // Expected response format:
      // {
      //   codes: InvitationCode[]
      // }
      setCodes(data.codes || []);
    } catch (error) {
      console.error('Error fetching invitation codes:', error);
      toast.error('Error al cargar los códigos de invitación');

      // Fallback: Use empty array for development
      setCodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      setIsGenerating(true);

      // TODO: API Endpoints Agent is building this endpoint
      // Generate new code via POST /api/admin/codes
      const response = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar código');
      }

      const data = await response.json();

      // Expected response format:
      // {
      //   code: InvitationCode
      // }
      const newCode = data.code;

      // Add new code to the list
      setCodes([newCode, ...codes]);

      // Show success toast with the new code
      toast.success('Código generado exitosamente', {
        description: `Código: ${newCode.code}`,
      });

      // Auto-copy to clipboard
      await copyToClipboard(newCode.code);
    } catch (error) {
      console.error('Error generating invitation code:', error);
      toast.error('Error al generar el código de invitación');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Código copiado al portapapeles');

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Error al copiar el código');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const availableCodes = codes.filter((c) => c.status === 'available').length;
  const usedCodes = codes.filter((c) => c.status === 'used').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Códigos de Invitación"
        description="Genera y administra códigos de invitación para nuevos usuarios"
        breadcrumbs={[
          { label: 'Administración', href: '/admin' },
          { label: 'Códigos de Invitación' },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin">
                <ChevronLeftIcon className="size-4" />
                Volver
              </Link>
            </Button>
            <Button onClick={generateCode} disabled={isGenerating}>
              <PlusIcon className="size-4" />
              {isGenerating ? 'Generando...' : 'Generar Código'}
            </Button>
          </div>
        }
      />

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Códigos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{codes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Códigos Disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">{availableCodes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Códigos Usados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-muted-foreground">{usedCodes}</p>
          </CardContent>
        </Card>
      </div>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Códigos</CardTitle>
          <CardDescription>
            {codes.length} código{codes.length !== 1 ? 's' : ''} generado{codes.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-12">
              <PlusIcon className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No hay códigos de invitación generados aún
              </p>
              <Button onClick={generateCode} disabled={isGenerating}>
                <PlusIcon className="size-4" />
                Generar Primer Código
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Código
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Estado
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Usado Por
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Fecha de Uso
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => (
                      <tr key={code.id} className="border-b last:border-0 hover:bg-accent/50">
                        <td className="py-3 px-4">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {code.code}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          {code.status === 'available' ? (
                            <Badge variant="default">Disponible</Badge>
                          ) : (
                            <Badge variant="outline">Usado</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {code.usedBy || '-'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {code.usedAt ? formatDate(code.usedAt) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(code.code)}
                            disabled={copiedCode === code.code}
                          >
                            {copiedCode === code.code ? (
                              <>
                                <CheckIcon className="size-4 text-success" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <CopyIcon className="size-4" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {codes.map((code) => (
                  <Card key={code.id}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {code.code}
                        </code>
                        {code.status === 'available' ? (
                          <Badge variant="default">Disponible</Badge>
                        ) : (
                          <Badge variant="outline">Usado</Badge>
                        )}
                      </div>
                      {code.usedBy && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Usado por:</span>
                          <span>{code.usedBy}</span>
                        </div>
                      )}
                      {code.usedAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Fecha de uso:</span>
                          <span>{formatDate(code.usedAt)}</span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => copyToClipboard(code.code)}
                        disabled={copiedCode === code.code}
                      >
                        {copiedCode === code.code ? (
                          <>
                            <CheckIcon className="size-4 text-success" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <CopyIcon className="size-4" />
                            Copiar Código
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
