'use client'

import { useState, useRef, useCallback } from 'react'
import { RefreshCwIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  disabled?: boolean
  pullThreshold?: number
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  pullThreshold = 80,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return

    // Only start pull-to-refresh if scrolled to top
    const container = containerRef.current
    if (!container) return

    const scrollTop = window.scrollY || document.documentElement.scrollTop
    if (scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
    }
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || touchStartY.current === 0) return

    const touchY = e.touches[0].clientY
    const distance = touchY - touchStartY.current

    // Only pull down (positive distance)
    if (distance > 0) {
      // Apply resistance curve (diminishing returns)
      const resistanceFactor = 0.5
      const actualDistance = Math.min(distance * resistanceFactor, pullThreshold * 1.5)

      setPullDistance(actualDistance)
      setIsPulling(true)

      // Prevent default scroll behavior when pulling
      if (actualDistance > 10) {
        e.preventDefault()
      }
    }
  }, [disabled, isRefreshing, pullThreshold])

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) {
      setPullDistance(0)
      setIsPulling(false)
      touchStartY.current = 0
      return
    }

    // If pulled past threshold, trigger refresh
    if (pullDistance >= pullThreshold) {
      setIsRefreshing(true)
      setPullDistance(pullThreshold) // Keep at threshold during refresh

      try {
        await onRefresh()
      } catch (error) {
        console.error('Pull to refresh error:', error)
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
        setIsPulling(false)
        touchStartY.current = 0
      }
    } else {
      // Reset if not pulled far enough
      setPullDistance(0)
      setIsPulling(false)
      touchStartY.current = 0
    }
  }, [disabled, isRefreshing, pullDistance, pullThreshold, onRefresh])

  const progress = Math.min((pullDistance / pullThreshold) * 100, 100)
  const isReady = pullDistance >= pullThreshold

  return (
    <div
      ref={containerRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-0 right-0 top-0 z-50 flex items-center justify-center overflow-hidden transition-all',
          'bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm'
        )}
        style={{
          height: isPulling || isRefreshing ? `${Math.min(pullDistance, pullThreshold)}px` : '0px',
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              'rounded-full bg-primary/10 p-3 transition-all',
              isReady && 'bg-primary/20 scale-110',
              isRefreshing && 'animate-spin'
            )}
          >
            <RefreshCwIcon
              className={cn(
                'h-5 w-5 transition-all',
                isReady ? 'text-primary' : 'text-muted-foreground',
                isRefreshing && 'animate-spin'
              )}
              style={{
                transform: !isRefreshing ? `rotate(${progress * 3.6}deg)` : undefined,
              }}
            />
          </div>
          {!isRefreshing && (
            <p
              className={cn(
                'text-xs font-medium transition-all',
                isReady ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {isReady ? 'Suelta para actualizar' : 'Tira para actualizar'}
            </p>
          )}
          {isRefreshing && (
            <p className="text-xs font-medium text-primary">Actualizando...</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform"
        style={{
          transform: isPulling || isRefreshing ? `translateY(${Math.min(pullDistance, pullThreshold)}px)` : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
