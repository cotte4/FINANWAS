'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseLessonTrackingOptions {
  courseSlug: string
  lessonSlug: string
  onTimeUpdate?: (seconds: number) => void
  onProgressUpdate?: (percentage: number) => void
  timeUpdateInterval?: number // Intervalo en segundos para guardar el tiempo (default: 30)
}

interface LessonTrackingState {
  timeSpent: number
  readingProgress: number
  isTracking: boolean
}

/**
 * Hook personalizado para rastrear el tiempo invertido y el progreso de lectura en una lección
 *
 * @example
 * const { timeSpent, readingProgress, startTracking, stopTracking } = useLessonTracking({
 *   courseSlug: 'basics',
 *   lessonSlug: '01-interes-compuesto',
 *   onTimeUpdate: async (seconds) => {
 *     await fetch('/api/progress/time', {
 *       method: 'POST',
 *       body: JSON.stringify({ courseSlug, lessonSlug, seconds })
 *     })
 *   },
 *   onProgressUpdate: async (percentage) => {
 *     await fetch('/api/progress/reading', {
 *       method: 'POST',
 *       body: JSON.stringify({ courseSlug, lessonSlug, percentage })
 *     })
 *   }
 * })
 *
 * @param options - Configuración del tracking
 * @returns Estado y funciones de control del tracking
 */
export function useLessonTracking({
  courseSlug,
  lessonSlug,
  onTimeUpdate,
  onProgressUpdate,
  timeUpdateInterval = 30,
}: UseLessonTrackingOptions): LessonTrackingState & {
  startTracking: () => void
  stopTracking: () => void
} {
  const [timeSpent, setTimeSpent] = useState(0)
  const [readingProgress, setReadingProgress] = useState(0)
  const [isTracking, setIsTracking] = useState(false)

  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const accumulatedTimeRef = useRef(0)
  const lastSaveTimeRef = useRef(Date.now())

  // Función para iniciar el tracking
  const startTracking = useCallback(() => {
    setIsTracking(true)
  }, [])

  // Función para detener el tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false)
  }, [])

  // Actualizar el tiempo cada segundo
  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(() => {
      setTimeSpent((prev) => {
        const newTime = prev + 1
        accumulatedTimeRef.current++

        // Si han pasado los segundos del intervalo, guardamos en el servidor
        if (accumulatedTimeRef.current >= timeUpdateInterval) {
          if (onTimeUpdate) {
            onTimeUpdate(accumulatedTimeRef.current)
          }
          accumulatedTimeRef.current = 0
          lastSaveTimeRef.current = Date.now()
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isTracking, onTimeUpdate, timeUpdateInterval])

  // Guardar el progreso de lectura al hacer scroll
  useEffect(() => {
    if (!isTracking) return

    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      // Calcular el porcentaje de scroll
      const scrollableHeight = documentHeight - windowHeight
      const percentage = scrollableHeight > 0
        ? Math.round((scrollTop / scrollableHeight) * 100)
        : 0

      // Solo actualizar si hay un cambio significativo (más de 5%)
      setReadingProgress((prevProgress) => {
        if (percentage > prevProgress && percentage - prevProgress >= 5) {
          if (onProgressUpdate) {
            onProgressUpdate(percentage)
          }
          return percentage
        }
        return prevProgress
      })
    }

    // Debounce del scroll para no hacer muchas llamadas
    let scrollTimeout: NodeJS.Timeout
    const debouncedHandleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScroll, 300)
    }

    window.addEventListener('scroll', debouncedHandleScroll)

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [isTracking, onProgressUpdate])

  // Guardar el tiempo acumulado antes de salir de la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (accumulatedTimeRef.current > 0 && onTimeUpdate) {
        // Usar sendBeacon para garantizar que la petición se envíe
        const data = JSON.stringify({
          course_slug: courseSlug,
          lesson_slug: lessonSlug,
          additional_seconds: accumulatedTimeRef.current,
        })

        navigator.sendBeacon('/api/progress/time', data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // También guardamos al desmontar el componente
      if (accumulatedTimeRef.current > 0 && onTimeUpdate) {
        onTimeUpdate(accumulatedTimeRef.current)
      }
    }
  }, [courseSlug, lessonSlug, onTimeUpdate])

  // Iniciar el tracking automáticamente al montar
  useEffect(() => {
    startTracking()

    return () => {
      stopTracking()
    }
  }, [startTracking, stopTracking])

  return {
    timeSpent,
    readingProgress,
    isTracking,
    startTracking,
    stopTracking,
  }
}

/**
 * Formatea segundos a un formato legible (HH:MM:SS o MM:SS)
 *
 * @example
 * formatTime(65) // "01:05"
 * formatTime(3665) // "01:01:05"
 *
 * @param seconds - Segundos a formatear
 * @returns String formateado
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
