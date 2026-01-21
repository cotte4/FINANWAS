'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ShieldCheckIcon, KeyIcon } from 'lucide-react'

/**
 * 2FA Verification Page
 * Users are redirected here after successful password login if 2FA is enabled
 */
export default function Verify2FAPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [totpCode, setTotpCode] = React.useState('')
  const [backupCode, setBackupCode] = React.useState('')
  const [activeTab, setActiveTab] = React.useState<'totp' | 'backup'>('totp')

  // Get user ID from URL params (passed from login page)
  const userId = searchParams.get('userId')
  const userName = searchParams.get('name')

  // Redirect if no userId
  React.useEffect(() => {
    if (!userId) {
      router.push('/login')
    }
  }, [userId, router])

  // Handle TOTP verification
  const handleVerifyTOTP = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !totpCode || totpCode.length !== 6) {
      toast.error('Ingresá un código de 6 dígitos')
      return
    }

    try {
      setIsVerifying(true)
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token: totpCode,
          isBackupCode: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Código de verificación inválido')
      }

      toast.success('Verificación exitosa')
      router.push('/dashboard')
    } catch (error) {
      console.error('2FA verification error:', error)
      toast.error(error instanceof Error ? error.message : 'Código de verificación inválido')
      setTotpCode('')
    } finally {
      setIsVerifying(false)
    }
  }, [userId, totpCode, router])

  // Handle backup code verification
  const handleVerifyBackupCode = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !backupCode) {
      toast.error('Ingresá un código de respaldo')
      return
    }

    try {
      setIsVerifying(true)
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token: backupCode,
          isBackupCode: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Código de respaldo inválido')
      }

      const remainingCodes = data.remainingBackupCodes || 0
      if (remainingCodes === 0) {
        toast.warning('Este fue tu último código de respaldo. Generá nuevos códigos desde tu perfil.')
      } else if (remainingCodes <= 2) {
        toast.warning(`Te quedan ${remainingCodes} códigos de respaldo. Generá nuevos desde tu perfil.`)
      }

      toast.success('Verificación exitosa')
      router.push('/dashboard')
    } catch (error) {
      console.error('Backup code verification error:', error)
      toast.error(error instanceof Error ? error.message : 'Código de respaldo inválido')
      setBackupCode('')
    } finally {
      setIsVerifying(false)
    }
  }, [userId, backupCode, router])

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheckIcon className="size-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verificación de Dos Factores</CardTitle>
          <CardDescription>
            Hola {userName}. Ingresá el código de verificación para completar el inicio de sesión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'totp' | 'backup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="totp">Aplicación</TabsTrigger>
              <TabsTrigger value="backup">Código de Respaldo</TabsTrigger>
            </TabsList>

            <TabsContent value="totp" className="space-y-4">
              <form onSubmit={handleVerifyTOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totp-code">Código de Autenticación</Label>
                  <Input
                    id="totp-code"
                    type="text"
                    placeholder="123456"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest font-mono"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresá el código de 6 dígitos de tu aplicación de autenticación
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isVerifying || totpCode.length !== 6}>
                  {isVerifying ? 'Verificando...' : 'Verificar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              <form onSubmit={handleVerifyBackupCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-code">Código de Respaldo</Label>
                  <Input
                    id="backup-code"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    className="text-center font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usá uno de los códigos de respaldo que guardaste al habilitar 2FA
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isVerifying || !backupCode}>
                  {isVerifying ? 'Verificando...' : 'Verificar'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => router.push('/login')} className="text-sm">
              Volver al inicio de sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
