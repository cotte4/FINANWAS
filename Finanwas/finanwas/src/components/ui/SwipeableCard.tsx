'use client'

import { useSwipeable } from 'react-swipeable'
import { useState } from 'react'
import { Trash2Icon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface SwipeableCardProps {
  children: React.ReactNode
  onDelete: () => void | Promise<void>
  deleteLabel?: string
  className?: string
  disabled?: boolean
  requireConfirmation?: boolean
  confirmationDialog?: React.ReactNode
}

export function SwipeableCard({
  children,
  onDelete,
  deleteLabel = 'Delete',
  className,
  disabled = false,
  requireConfirmation = false,
  confirmationDialog,
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const SWIPE_THRESHOLD = 60 // Pixels to swipe before showing delete
  const MAX_SWIPE = 100 // Maximum swipe distance

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      // Only allow left swipe (negative delta) on touch devices
      if (eventData.deltaX < 0 && !disabled) {
        setOffset(Math.max(eventData.deltaX, -MAX_SWIPE))
      }
    },
    onSwipedLeft: () => {
      if (disabled) return

      // If swiped past threshold, show delete button
      if (offset < -SWIPE_THRESHOLD) {
        setOffset(-MAX_SWIPE)
      } else {
        setOffset(0)
      }
    },
    onSwipedRight: () => {
      setOffset(0) // Reset on right swipe
    },
    trackMouse: false, // Only touch, not mouse drag
    trackTouch: true,
    preventScrollOnSwipe: false,
    delta: 10, // Minimum distance before recognizing swipe
  })

  const handleDelete = async () => {
    if (isDeleting || disabled) return

    if (requireConfirmation && !showConfirmation) {
      setShowConfirmation(true)
      return
    }

    try {
      setIsDeleting(true)
      await onDelete()
      // Card will be removed by parent component's state update
    } catch (error) {
      // Error handling done by parent component
      setIsDeleting(false)
      setOffset(0)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setOffset(0)
  }

  // Calculate background color based on swipe distance
  const deleteOpacity = Math.min(Math.abs(offset) / MAX_SWIPE, 1)

  return (
    <div className="relative overflow-hidden">
      {/* Delete background - visible when swiped */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-end pr-4 transition-opacity',
          'bg-destructive text-destructive-foreground',
          offset < -SWIPE_THRESHOLD ? 'opacity-100' : 'opacity-50'
        )}
        style={{ opacity: deleteOpacity }}
      >
        <div className="flex items-center gap-2">
          <Trash2Icon className="h-5 w-5" />
          <span className="font-medium">{deleteLabel}</span>
        </div>
      </div>

      {/* Main content - slides left on swipe */}
      <div
        {...handlers}
        className={cn(
          'relative transition-transform duration-200 ease-out',
          'touch-pan-y', // Allow vertical scrolling
          isDeleting && 'opacity-50',
          className
        )}
        style={{
          transform: `translateX(${offset}px)`,
        }}
      >
        {children}

        {/* Delete button - appears when swiped far enough */}
        {offset <= -SWIPE_THRESHOLD && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting || disabled}
              className="h-10 w-10 shadow-lg"
            >
              <Trash2Icon className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Optional confirmation dialog */}
      {showConfirmation && confirmationDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          {confirmationDialog}
        </div>
      )}
    </div>
  )
}
