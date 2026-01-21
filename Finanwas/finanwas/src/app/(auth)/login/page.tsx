'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { captureEvent, identifyUser } from '@/lib/analytics/posthog';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email.trim() || !password) {
      setError('Email y contraseña son obligatorios');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Email o contraseña incorrectos');
        setLoading(false);
        return;
      }

      // Check if 2FA is required
      if (data.requires2FA) {
        // Track login attempt requiring 2FA
        captureEvent('user_login_2fa_required', {
          userId: data.userId,
        });
        // Redirect to 2FA verification page
        router.push(`/login/verify-2fa?userId=${data.userId}&name=${encodeURIComponent(data.name)}`);
        return;
      }

      // Login successful - redirect to dashboard
      identifyUser(data.userId, {
        email: data.email || email,
        name: data.name,
      });

      captureEvent('user_logged_in', {
        method: 'password',
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Error al iniciar sesión. Intentá nuevamente.');
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Iniciar sesión</h2>
      <p className="text-sm text-muted mb-6">
        Ingresá tus datos para acceder a tu cuenta.
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            disabled={loading}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
            disabled={loading}
            className="min-h-[44px]"
          />
        </div>

        {error && (
          <div className="text-sm text-error bg-error/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted">¿No tenés cuenta? </span>
        <Link href="/register" className="text-primary hover:underline">
          Crear cuenta
        </Link>
      </div>
    </Card>
  );
}
