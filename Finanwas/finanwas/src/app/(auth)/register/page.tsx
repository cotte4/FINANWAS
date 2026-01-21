'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'code' | 'form'>('code');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Código de invitación inválido o ya utilizado');
        setLoading(false);
        return;
      }

      if (data.valid) {
        setStep('form');
      } else {
        setError('Código de invitación inválido o ya utilizado');
      }
    } catch (err) {
      setError('Error al validar el código. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear la cuenta');
        setLoading(false);
        return;
      }

      // Registration successful - redirect to onboarding
      router.push('/onboarding');
    } catch (err) {
      setError('Error al crear la cuenta. Intentá nuevamente.');
      setLoading(false);
    }
  };

  if (step === 'form') {
    return (
      <Card className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Crear cuenta</h2>
        <p className="text-sm text-muted mb-6">
          Completá tus datos para finalizar el registro.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              disabled={loading}
              className="min-h-[44px]"
            />
          </div>

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
              placeholder="Mínimo 8 caracteres"
              required
              disabled={loading}
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí tu contraseña"
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted">¿Ya tenés cuenta? </span>
          <Link href="/login" className="text-primary hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Crear cuenta</h2>
      <p className="text-sm text-muted mb-6">
        Necesitás un código de invitación para registrarte.
      </p>

      <form onSubmit={handleValidateCode} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código de invitación</Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ingresá tu código"
            required
            disabled={loading}
            className="uppercase min-h-[44px]"
          />
        </div>

        {error && (
          <div className="text-sm text-error bg-error/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full min-h-[44px]" disabled={loading || !code}>
          {loading ? 'Validando...' : 'Continuar'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted">¿Ya tenés cuenta? </span>
        <Link href="/login" className="text-primary hover:underline">
          Iniciar sesión
        </Link>
      </div>
    </Card>
  );
}
