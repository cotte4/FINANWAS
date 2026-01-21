import posthog from 'posthog-js'

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
