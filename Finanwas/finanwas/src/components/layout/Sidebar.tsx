'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Briefcase,
  Target,
  FileText,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';

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
 * Navigation sidebar component for desktop view
 * Provides primary navigation links with icons and active state highlighting
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-surface px-4 py-6 flex flex-col">
      {/* Logo / Brand */}
      <div className="mb-8">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold text-primary">Finanwas</h1>
          <p className="text-xs text-muted">Tu camino hacia la libertad financiera</p>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text/70 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Menu at bottom */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-800 pt-4">
        <UserMenu />
      </div>
    </aside>
  );
}
