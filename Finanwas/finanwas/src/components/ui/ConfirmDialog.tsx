"use client"

import * as React from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * ConfirmDialog Component
 *
 * A confirmation dialog with yes/no actions.
 * Provides consistent confirmation UX across the application.
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete Transaction"
 *   description="Are you sure you want to delete this transaction? This action cannot be undone."
 *   onConfirm={handleDelete}
 *   variant="destructive"
 * />
 * ```
 */

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title: string
  /** Dialog description/message */
  description: string | React.ReactNode
  /** Callback when user confirms */
  onConfirm: () => void | Promise<void>
  /** Callback when user cancels (optional, defaults to closing dialog) */
  onCancel?: () => void
  /** Text for the confirm button */
  confirmText?: string
  /** Text for the cancel button */
  cancelText?: string
  /** Visual variant of the dialog */
  variant?: "default" | "destructive" | "warning"
  /** Whether the confirm action is loading */
  isLoading?: boolean
  /** Additional CSS classes for the modal */
  className?: string
}

const variantConfig = {
  default: {
    icon: null,
    iconColor: "",
    confirmVariant: "default" as const,
  },
  destructive: {
    icon: AlertTriangleIcon,
    iconColor: "text-destructive",
    confirmVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangleIcon,
    iconColor: "text-warning",
    confirmVariant: "secondary" as const,
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
  className,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Error handling should be done in onConfirm callback
      console.error("Confirm action failed:", error)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="sm"
      className={className}
      footer={
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        {Icon && (
          <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full bg-muted", config.iconColor)}>
            <Icon className="size-6" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
    </Modal>
  )
}
