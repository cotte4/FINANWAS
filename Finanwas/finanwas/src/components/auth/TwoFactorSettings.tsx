'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ShieldCheckIcon, KeyIcon, CopyIcon, CheckIcon } from 'lucide-react'

interface TwoFactorSettingsProps {
  is2FAEnabled: boolean
  onStatusChange?: () => void
}

export function TwoFactorSettings({ is2FAEnabled, onStatusChange }: TwoFactorSettingsProps) {
  const [isEnabling, setIsEnabling] = React.useState(false)
  const [isDisabling, setIsDisabling] = React.useState(false)
  const [showSetup, setShowSetup] = React.useState(false)
  const [qrCode, setQrCode] = React.useState<string>('')
  const [secret, setSecret] = React.useState<string>('')
  const [verificationCode, setVerificationCode] = React.useState('')
  const [disablePassword, setDisablePassword] = React.useState('')
  const [backupCodes, setBackupCodes] = React.useState<string[]>([])
  const [copiedCodes, setCopiedCodes] = React.useState(false)

  // Generate QR code for 2FA setup
  const handleStartSetup = React.useCallback(async () => {
    try {
      setIsEnabling(true)
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al generar código QR')
      }

      const data = await response.json()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setShowSetup(true)
    } catch (error) {
      console.error('Failed to start 2FA setup:', error)
      toast.error(error instanceof Error ? error.message : 'Error al configurar 2FA')
    } finally {
      setIsEnabling(false)
    }
  }, [])

  // Enable 2FA after verifying code
  const handleEnable2FA = React.useCallback(async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Ingresá un código de 6 dígitos')
      return
    }

    try {
      setIsEnabling(true)
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret,
          token: verificationCode,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al habilitar 2FA')
      }

      const data = await response.json()
      setBackupCodes(data.backupCodes)
      setVerificationCode('')
      toast.success('2FA habilitado correctamente')

      // Will show backup codes first before finishing
    } catch (error) {
      console.error('Failed to enable 2FA:', error)
      toast.error(error instanceof Error ? error.message : 'Código de verificación inválido')
    } finally {
      setIsEnabling(false)
    }
  }, [secret, verificationCode])

  // Finish setup after showing backup codes
  const handleFinishSetup = React.useCallback(() => {
    setShowSetup(false)
    setQrCode('')
    setSecret('')
    setBackupCodes([])
    setCopiedCodes(false)
    onStatusChange?.()
  }, [onStatusChange])

  // Disable 2FA
  const handleDisable2FA = React.useCallback(async () => {
    if (!disablePassword) {
      toast.error('Ingresá tu contraseña para desactivar 2FA')
      return
    }

    try {
      setIsDisabling(true)
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: disablePassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al desactivar 2FA')
      }

      setDisablePassword('')
      toast.success('2FA desactivado correctamente')
      onStatusChange?.()
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      toast.error(error instanceof Error ? error.message : 'Error al desactivar 2FA')
    } finally {
      setIsDisabling(false)
    }
  }, [disablePassword, onStatusChange])

  // Copy backup codes to clipboard
  const handleCopyBackupCodes = React.useCallback(() => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    setCopiedCodes(true)
    toast.success('Códigos copiados al portapapeles')
    setTimeout(() => setCopiedCodes(false), 3000)
  }, [backupCodes])

  // Show backup codes after enabling
  if (backupCodes.length > 0) {
    return (
      <Card className="p-6 space-y-4 border-primary/50 bg-primary/5">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="size-6 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Códigos de Respaldo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Guardá estos códigos en un lugar seguro. Podés usarlos para acceder a tu cuenta si perdés tu dispositivo de autenticación.
            </p>
            <p className="text-sm text-warning font-semibold mb-4">
              ⚠️ Estos códigos solo se muestran una vez. No podrás volver a verlos.
            </p>
          </div>
        </div>

        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((code, index) => (
              <div key={index} className="p-2 bg-muted rounded">
                {code}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleCopyBackupCodes} variant="outline" className="gap-2">
            {copiedCodes ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            {copiedCodes ? 'Copiado' : 'Copiar Códigos'}
          </Button>
          <Button onClick={handleFinishSetup} disabled={!copiedCodes}>
            Continuar
          </Button>
        </div>
      </Card>
    )
  }

  // Show QR code setup
  if (showSetup && qrCode) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <KeyIcon className="size-6 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Configurar Autenticación de Dos Factores</h3>
            <p className="text-sm text-muted-foreground">
              Escaneá el código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.)
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-4">
          <img src={qrCode} alt="QR Code" className="size-64 border border-border rounded-lg" />

          <div className="w-full max-w-md">
            <p className="text-xs text-muted-foreground mb-2">O ingresá este código manualmente:</p>
            <div className="p-3 bg-muted rounded font-mono text-sm break-all text-center">
              {secret}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="verification-code">Código de Verificación</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-lg tracking-widest font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ingresá el código de 6 dígitos de tu aplicación de autenticación
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowSetup(false)
                setQrCode('')
                setSecret('')
                setVerificationCode('')
              }}
              variant="outline"
              disabled={isEnabling}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnable2FA}
              disabled={isEnabling || verificationCode.length !== 6}
            >
              {isEnabling ? 'Verificando...' : 'Verificar y Habilitar'}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Show enable/disable controls
  return (
    <div className="flex items-start justify-between p-4 rounded-lg border border-border bg-muted/50">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheckIcon className="size-5 text-primary" />
          <h3 className="font-semibold">Autenticación de Dos Factores (2FA)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {is2FAEnabled
            ? 'La autenticación de dos factores está habilitada en tu cuenta. Se te solicitará un código cada vez que inicies sesión.'
            : 'Agregá una capa extra de seguridad a tu cuenta. Necesitarás tu contraseña y un código de tu teléfono para iniciar sesión.'}
        </p>

        {is2FAEnabled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
              <CheckIcon className="size-5 text-success" />
              <span className="text-sm font-medium text-success">2FA Activo</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="disable-password">Contraseña</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Ingresá tu contraseña"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleDisable2FA}
              disabled={isDisabling || !disablePassword}
              variant="destructive"
              size="sm"
            >
              {isDisabling ? 'Desactivando...' : 'Desactivar 2FA'}
            </Button>
          </div>
        ) : (
          <Button onClick={handleStartSetup} disabled={isEnabling} className="gap-2">
            <ShieldCheckIcon className="size-4" />
            {isEnabling ? 'Configurando...' : 'Habilitar 2FA'}
          </Button>
        )}
      </div>
    </div>
  )
}
