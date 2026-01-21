/**
 * Sanitization utilities for user input
 * Prevents XSS attacks and ensures data integrity
 */

/**
 * HTML entities to escape
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Control characters to remove (U+0000 to U+001F, excluding newline, tab, carriage return)
 * These characters can cause issues in databases and display
 */
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Sanitize a string by trimming whitespace and removing control characters
 * @param input - The string to sanitize
 * @param maxLength - Optional maximum length (default: no limit)
 * @returns Sanitized string
 *
 * @example
 * ```ts
 * sanitizeString("  Hello\x00World  ") // "HelloWorld"
 * sanitizeString("  Test  ", 3) // "Tes"
 * ```
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Remove control characters (except newline, tab, carriage return)
  sanitized = sanitized.replace(CONTROL_CHARS_REGEX, '');

  // Apply max length if specified
  if (maxLength && maxLength > 0) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Escape HTML entities to prevent XSS attacks
 * @param input - The string to escape
 * @returns String with HTML entities escaped
 *
 * @example
 * ```ts
 * sanitizeHtml("<script>alert('XSS')</script>")
 * // "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;&#x2F;script&gt;"
 * ```
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize email address
 * @param email - Email to sanitize
 * @returns Sanitized and lowercased email
 */
export function sanitizeEmail(email: string): string {
  return sanitizeString(email, 255).toLowerCase();
}

/**
 * Sanitize a ticker symbol (stock ticker)
 * @param ticker - Ticker symbol
 * @returns Sanitized and uppercased ticker
 *
 * @example
 * ```ts
 * sanitizeTicker("  aapl  ") // "AAPL"
 * sanitizeTicker("ggal.ba") // "GGAL.BA"
 * ```
 */
export function sanitizeTicker(ticker: string): string {
  // Allow letters, numbers, dots, and hyphens only
  const sanitized = sanitizeString(ticker, 20);
  return sanitized.replace(/[^a-zA-Z0-9.\-]/g, '').toUpperCase();
}

/**
 * Sanitize a number input (prevents NaN and Infinity)
 * @param value - Value to sanitize
 * @param defaultValue - Default value if invalid (default: 0)
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Valid number
 *
 * @example
 * ```ts
 * sanitizeNumber("123.45") // 123.45
 * sanitizeNumber("abc", 0) // 0
 * sanitizeNumber(1000, 0, 0, 100) // 100
 * ```
 */
export function sanitizeNumber(
  value: string | number,
  defaultValue: number = 0,
  min?: number,
  max?: number
): number {
  let num = typeof value === 'string' ? parseFloat(value) : value;

  // Handle invalid numbers
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }

  // Apply min/max constraints
  if (min !== undefined && num < min) {
    num = min;
  }
  if (max !== undefined && num > max) {
    num = max;
  }

  return num;
}

/**
 * Sanitize a URL
 * @param url - URL to sanitize
 * @param allowedProtocols - Allowed protocols (default: ['http', 'https'])
 * @returns Sanitized URL or empty string if invalid
 *
 * @example
 * ```ts
 * sanitizeUrl("https://example.com") // "https://example.com"
 * sanitizeUrl("javascript:alert('XSS')") // ""
 * ```
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ['http', 'https']
): string {
  const sanitized = sanitizeString(url, 2048);

  if (!sanitized) {
    return '';
  }

  try {
    const urlObj = new URL(sanitized);
    const protocol = urlObj.protocol.replace(':', '');

    // Check if protocol is allowed
    if (allowedProtocols.includes(protocol)) {
      return urlObj.href;
    }

    return '';
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Sanitize an object by sanitizing all string properties
 * @param obj - Object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    sanitizeStrings?: boolean;
    sanitizeHtml?: boolean;
    maxStringLength?: number;
  } = {}
): T {
  const { sanitizeStrings = true, sanitizeHtml: escapeHtml = false, maxStringLength } = options;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      if (escapeHtml) {
        sanitized[key] = sanitizeHtml(value);
      } else if (sanitizeStrings) {
        sanitized[key] = sanitizeString(value, maxStringLength);
      } else {
        sanitized[key] = value;
      }
    } else if (Array.isArray(value)) {
      // Recursively sanitize arrays
      sanitized[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>, options)
          : typeof item === 'string'
            ? sanitizeStrings
              ? sanitizeString(item, maxStringLength)
              : item
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Strip HTML tags from a string
 * @param input - String with HTML
 * @returns String without HTML tags
 *
 * @example
 * ```ts
 * stripHtmlTags("<p>Hello <b>World</b></p>") // "Hello World"
 * ```
 */
export function stripHtmlTags(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let stripped = input.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  stripped = stripped
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');

  return sanitizeString(stripped);
}

/**
 * Validate and sanitize a file name
 * @param filename - File name to sanitize
 * @param maxLength - Maximum length (default: 255)
 * @returns Sanitized filename
 *
 * @example
 * ```ts
 * sanitizeFilename("my-file.txt") // "my-file.txt"
 * sanitizeFilename("../../etc/passwd") // "passwd"
 * sanitizeFilename("<script>.exe") // "script.exe"
 * ```
 */
export function sanitizeFilename(filename: string, maxLength: number = 255): string {
  if (typeof filename !== 'string') {
    return 'file';
  }

  // Remove path separators
  let sanitized = filename.replace(/[/\\]/g, '');

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');

  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');

  // Apply max length
  if (maxLength && maxLength > 0) {
    // Preserve file extension if possible
    const lastDot = sanitized.lastIndexOf('.');
    if (lastDot > 0 && lastDot < sanitized.length - 1) {
      const name = sanitized.slice(0, lastDot);
      const ext = sanitized.slice(lastDot);
      const maxNameLength = maxLength - ext.length;
      if (maxNameLength > 0) {
        sanitized = name.slice(0, maxNameLength) + ext;
      } else {
        sanitized = sanitized.slice(0, maxLength);
      }
    } else {
      sanitized = sanitized.slice(0, maxLength);
    }
  }

  // Ensure we have a valid filename
  return sanitized || 'file';
}
