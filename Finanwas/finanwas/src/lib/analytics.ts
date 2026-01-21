/**
 * Analytics Library for Finanwas
 *
 * This module provides a wrapper around Google Analytics (GA4) and custom event tracking.
 * It includes helpers for common user actions and educational content tracking.
 *
 * To enable: Add your GA4 Measurement ID to the environment variables.
 * NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */

// Type definitions for GA4 events
export type GAEventParams = {
  [key: string]: string | number | boolean | undefined;
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: GAEventParams
    ) => void;
  }
}

// Google Analytics Measurement ID from environment
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Initialize Google Analytics
 * Call this in your root layout or _app file
 */
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer?.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
};

/**
 * Track page views
 * @param url - The page URL to track
 */
export const trackPageView = (url: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

/**
 * Track custom events
 * @param eventName - Name of the event
 * @param eventParams - Additional parameters for the event
 */
export const trackEvent = (eventName: string, eventParams?: GAEventParams) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

  window.gtag?.('event', eventName, eventParams);
};

// ============================================================================
// PREDEFINED EVENT TRACKERS
// These are helper functions for common user actions in Finanwas
// ============================================================================

/**
 * User Authentication Events
 */
export const analytics = {
  /**
   * Track user signup
   * @param method - Authentication method (email, google, etc.)
   */
  trackSignup: (method: string = 'email') => {
    trackEvent('sign_up', {
      method,
      category: 'authentication',
    });
  },

  /**
   * Track user login
   * @param method - Authentication method
   */
  trackLogin: (method: string = 'email') => {
    trackEvent('login', {
      method,
      category: 'authentication',
    });
  },

  /**
   * Track user logout
   */
  trackLogout: () => {
    trackEvent('logout', {
      category: 'authentication',
    });
  },

  // ============================================================================
  // Educational Content Events
  // ============================================================================

  /**
   * Track when a user starts a course
   * @param courseId - Unique identifier for the course
   * @param courseName - Name of the course
   * @param category - Course category (e.g., 'inversiones', 'ahorro')
   */
  trackCourseStart: (courseId: string, courseName: string, category?: string) => {
    trackEvent('course_start', {
      course_id: courseId,
      course_name: courseName,
      course_category: category,
      category: 'education',
    });
  },

  /**
   * Track when a user completes a lesson
   * @param courseId - Course identifier
   * @param lessonId - Lesson identifier
   * @param lessonName - Lesson name
   * @param progress - Percentage of course completed (0-100)
   */
  trackLessonComplete: (
    courseId: string,
    lessonId: string,
    lessonName: string,
    progress?: number
  ) => {
    trackEvent('lesson_complete', {
      course_id: courseId,
      lesson_id: lessonId,
      lesson_name: lessonName,
      progress,
      category: 'education',
    });
  },

  /**
   * Track when a user completes an entire course
   * @param courseId - Course identifier
   * @param courseName - Course name
   * @param timeSpent - Time spent on course in minutes
   */
  trackCourseComplete: (courseId: string, courseName: string, timeSpent?: number) => {
    trackEvent('course_complete', {
      course_id: courseId,
      course_name: courseName,
      time_spent_minutes: timeSpent,
      category: 'education',
    });
  },

  /**
   * Track quiz or assessment attempts
   * @param assessmentId - Quiz/assessment identifier
   * @param score - Score achieved (0-100)
   * @param passed - Whether the user passed
   */
  trackAssessment: (assessmentId: string, score: number, passed: boolean) => {
    trackEvent('assessment_complete', {
      assessment_id: assessmentId,
      score,
      passed,
      category: 'education',
    });
  },

  // ============================================================================
  // Portfolio & Investment Events
  // ============================================================================

  /**
   * Track when a user adds a new asset to their portfolio
   * @param assetType - Type of asset (stock, bond, crypto, etc.)
   * @param symbol - Asset symbol/ticker
   */
  trackPortfolioAddAsset: (assetType: string, symbol: string) => {
    trackEvent('portfolio_add_asset', {
      asset_type: assetType,
      symbol,
      category: 'portfolio',
    });
  },

  /**
   * Track when a user removes an asset from portfolio
   * @param assetType - Type of asset
   * @param symbol - Asset symbol/ticker
   */
  trackPortfolioRemoveAsset: (assetType: string, symbol: string) => {
    trackEvent('portfolio_remove_asset', {
      asset_type: assetType,
      symbol,
      category: 'portfolio',
    });
  },

  /**
   * Track when a user views portfolio analytics
   */
  trackPortfolioView: () => {
    trackEvent('portfolio_view', {
      category: 'portfolio',
    });
  },

  // ============================================================================
  // Goal & Savings Events
  // ============================================================================

  /**
   * Track when a user creates a new savings goal
   * @param goalType - Type of goal (emergency, vacation, retirement, etc.)
   * @param targetAmount - Target amount for the goal
   */
  trackGoalCreate: (goalType: string, targetAmount?: number) => {
    trackEvent('goal_create', {
      goal_type: goalType,
      target_amount: targetAmount,
      category: 'goals',
    });
  },

  /**
   * Track when a user completes a savings goal
   * @param goalType - Type of goal
   * @param timeToComplete - Days taken to complete
   */
  trackGoalComplete: (goalType: string, timeToComplete?: number) => {
    trackEvent('goal_complete', {
      goal_type: goalType,
      days_to_complete: timeToComplete,
      category: 'goals',
    });
  },

  /**
   * Track when a user updates progress on a goal
   * @param goalId - Goal identifier
   * @param progressPercentage - Current progress (0-100)
   */
  trackGoalProgress: (goalId: string, progressPercentage: number) => {
    trackEvent('goal_progress', {
      goal_id: goalId,
      progress: progressPercentage,
      category: 'goals',
    });
  },

  // ============================================================================
  // Research & Tools Events
  // ============================================================================

  /**
   * Track when a user uses research tools
   * @param toolName - Name of the tool (stock-screener, calculator, etc.)
   * @param action - Specific action taken
   */
  trackToolUsage: (toolName: string, action: string) => {
    trackEvent('tool_usage', {
      tool_name: toolName,
      action,
      category: 'tools',
    });
  },

  /**
   * Track when a user searches for financial information
   * @param query - Search query
   * @param resultsCount - Number of results returned
   */
  trackSearch: (query: string, resultsCount?: number) => {
    trackEvent('search', {
      search_term: query,
      results_count: resultsCount,
      category: 'search',
    });
  },

  // ============================================================================
  // Note & Content Events
  // ============================================================================

  /**
   * Track when a user creates a note
   * @param noteType - Type of note (lesson, personal, research)
   */
  trackNoteCreate: (noteType: string = 'personal') => {
    trackEvent('note_create', {
      note_type: noteType,
      category: 'content',
    });
  },

  /**
   * Track when a user shares content
   * @param contentType - Type of content shared (course, lesson, portfolio)
   * @param method - Sharing method (link, social, email)
   */
  trackShare: (contentType: string, method: string) => {
    trackEvent('share', {
      content_type: contentType,
      method,
      category: 'engagement',
    });
  },

  // ============================================================================
  // Engagement Events
  // ============================================================================

  /**
   * Track time spent on a page
   * @param pageName - Name of the page
   * @param timeSeconds - Time spent in seconds
   */
  trackTimeOnPage: (pageName: string, timeSeconds: number) => {
    trackEvent('time_on_page', {
      page_name: pageName,
      time_seconds: timeSeconds,
      category: 'engagement',
    });
  },

  /**
   * Track when a user clicks a CTA (Call to Action)
   * @param ctaName - Name of the CTA
   * @param location - Where the CTA is located
   */
  trackCTAClick: (ctaName: string, location: string) => {
    trackEvent('cta_click', {
      cta_name: ctaName,
      location,
      category: 'engagement',
    });
  },

  // ============================================================================
  // Error & Support Events
  // ============================================================================

  /**
   * Track when an error occurs
   * @param errorMessage - Error message
   * @param errorLocation - Where the error occurred
   */
  trackError: (errorMessage: string, errorLocation: string) => {
    trackEvent('error', {
      error_message: errorMessage,
      error_location: errorLocation,
      category: 'errors',
    });
  },

  /**
   * Track when a user opens support or help
   * @param helpTopic - Topic of help requested
   */
  trackHelpRequest: (helpTopic: string) => {
    trackEvent('help_request', {
      help_topic: helpTopic,
      category: 'support',
    });
  },
};

// Export everything as default as well for convenience
export default analytics;
