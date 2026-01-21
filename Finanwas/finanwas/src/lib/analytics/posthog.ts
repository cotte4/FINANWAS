import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

    if (!apiKey) {
      console.warn('PostHog API key not found. Analytics will not be initialized.')
      return
    }

    posthog.init(apiKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug()
        }
      },
      capture_pageviews: false, // We'll do this manually
      capture_pageleave: true,
      autocapture: false, // Manual event tracking for better control
      persistence: 'localStorage',
      session_recording: {
        maskAllInputs: true, // Privacy: mask all input fields
        maskTextSelector: '.sensitive-data', // Mask elements with this class
      },
    })
  }
}

export { posthog }

// Helper function to safely capture events
export function captureEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, properties)
  }
}

// Helper function to identify users
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(userId, properties)
  }
}

// Helper function to reset user identity on logout
export function resetUser() {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.reset()
  }
}
