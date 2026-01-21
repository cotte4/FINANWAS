"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/**
 * Modal Component
 *
 * A reusable modal dialog built on top of shadcn/ui Dialog.
 * Provides consistent modal behavior and styling across the application.
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>Modal content goes here</p>
 * </Modal>
 * ```
 */

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Modal title */
  title?: string | React.ReactNode
  /** Modal description */
  description?: string | React.ReactNode
  /** Modal content */
  children: React.ReactNode
  /** Footer content (typically buttons) */
  footer?: React.ReactNode
  /** Whether to show the close button */
  showCloseButton?: boolean
  /** Maximum width of the modal */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"
  /** Additional CSS classes for the modal content */
  className?: string
}

const maxWidthClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  maxWidth = "lg",
  className,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(maxWidthClasses[maxWidth], className)}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="py-4">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
