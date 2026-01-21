'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

/**
 * Theme toggle component that can be used in dropdown menus
 * Cycles through: light -> dark -> system
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeLabel = () => {
    if (theme === 'light') return 'Modo claro';
    if (theme === 'dark') return 'Modo oscuro';
    return 'Sistema';
  };

  const getNextThemeLabel = () => {
    if (theme === 'light') return 'Cambiar a modo oscuro';
    if (theme === 'dark') return 'Usar preferencia del sistema';
    return 'Cambiar a modo claro';
  };

  return (
    <DropdownMenuItem onClick={cycleTheme} className="cursor-pointer">
      {theme === 'dark' ? (
        <Moon className="mr-2 h-4 w-4" />
      ) : (
        <Sun className="mr-2 h-4 w-4" />
      )}
      <span>{getNextThemeLabel()}</span>
      <span className="ml-auto text-xs text-muted-foreground">
        ({getThemeLabel()})
      </span>
    </DropdownMenuItem>
  );
}
