'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Briefcase,
  Target,
  FileText,
  User,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/aprender', label: 'Aprender', icon: BookOpen },
  { href: '/investigar', label: 'Investigar', icon: Search },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/notas', label: 'Notas', icon: FileText },
  { href: '/perfil', label: 'Perfil', icon: User },
];

/**
 * Mobile navigation header with hamburger menu
 * Features:
 * - Shows on screens < 768px (mobile), hides on desktop
 * - Hamburger icon opens slide-out drawer with navigation links
 * - Close button or tap outside closes drawer
 * - Finanwas title/logo centered in header
 */
export function MobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  // Get user initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
        router.refresh();
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-surface px-4 md:hidden">
      {/* Hamburger Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <h1 className="text-2xl font-bold text-primary">Finanwas</h1>
                <p className="text-xs text-muted">Tu camino hacia la libertad financiera</p>
              </Link>
            </SheetTitle>
          </SheetHeader>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text/70 hover:bg-gray-100 hover:text-text'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Centered Logo */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold text-primary">Finanwas</h1>
        </Link>
      </div>

      {/* User Menu */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-white text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Menú de usuario</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted truncate">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/perfil')}
              className="cursor-pointer"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-error focus:text-error"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
