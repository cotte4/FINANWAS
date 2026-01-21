'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/useToast';
import { UsersIcon, UserPlusIcon, CheckCircleIcon, ArrowRightIcon } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  hasCompletedQuestionnaire: boolean;
}

interface AdminStats {
  totalUsers: number;
  usersThisMonth: number;
  questionnaireCompletionRate: number;
}

/**
 * Admin Users List Page (US-080)
 * Main admin page showing user statistics and list
 */
export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const toast = useToast();

  React.useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);

      // TODO: API Endpoints Agent is building this endpoint
      // Fetch users list from GET /api/admin/users
      const response = await fetch('/api/admin/users');

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const data = await response.json();

      // Expected response format:
      // {
      //   users: User[],
      //   stats: AdminStats
      // }
      setUsers(data.users || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error al cargar los datos de administración');

      // Fallback: Use placeholder data for development
      setUsers([]);
      setStats({
        totalUsers: 0,
        usersThisMonth: 0,
        questionnaireCompletionRate: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestión de Usuarios"
        description="Visualiza y administra todos los usuarios de la plataforma"
        action={
          <Button asChild>
            <Link href="/admin/invitaciones">
              <UserPlusIcon className="size-4" />
              Códigos de Invitación
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total de Usuarios"
          value={stats?.totalUsers || 0}
          description="Usuarios registrados"
          icon={UsersIcon}
          variant="primary"
          isLoading={isLoading}
        />
        <StatsCard
          title="Usuarios este Mes"
          value={stats?.usersThisMonth || 0}
          description="Nuevos registros"
          icon={UserPlusIcon}
          variant="success"
          isLoading={isLoading}
        />
        <StatsCard
          title="Cuestionarios Completados"
          value={`${stats?.questionnaireCompletionRate || 0}%`}
          description="Tasa de completitud"
          icon={CheckCircleIcon}
          variant="secondary"
          isLoading={isLoading}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Total de {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay usuarios registrados aún</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Fecha de Registro
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Cuestionario
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-accent/50">
                        <td className="py-3 px-4">
                          <span className="font-medium">{user.name}</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          {user.hasCompletedQuestionnaire ? (
                            <Badge variant="default">Sí</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="pt-6 space-y-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Registro:</span>
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cuestionario:</span>
                        {user.hasCompletedQuestionnaire ? (
                          <Badge variant="default">Sí</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </div>
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
