/**
 * Validation utilities for forms and data
 */

/**
 * Validates an email address using RFC 5322 standard
 * @param email - Email address to validate
 * @returns True if email is valid, false otherwise
 * @example
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid.email') // false
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim().toLowerCase();

  // Check length constraints (RFC 5321)
  if (trimmed.length < 3 || trimmed.length > 254) {
    return false;
  }

  // Comprehensive RFC 5322 compliant email regex
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

  if (!emailRegex.test(trimmed)) {
    return false;
  }

  // Additional validation
  const [localPart, domain] = trimmed.split('@');

  // Check local part length (RFC 5321)
  if (localPart.length > 64) {
    return false;
  }

  // Check domain has at least one dot
  if (!domain || !domain.includes('.')) {
    return false;
  }

  // Check for consecutive dots
  if (trimmed.includes('..')) {
    return false;
  }

  // Check domain doesn't start or end with dot/hyphen
  if (domain.startsWith('.') || domain.endsWith('.') || domain.startsWith('-') || domain.endsWith('-')) {
    return false;
  }

  return true;
}

/**
 * Validates a password meets minimum security requirements
 * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 * @param password - Password to validate
 * @returns Object with isValid boolean and error message if invalid
 * @example
 * isValidPassword('Pass123!') // { isValid: true, message: '' }
 * isValidPassword('weak') // { isValid: false, message: 'La contraseña debe tener...' }
 */
export function isValidPassword(password: string): { isValid: boolean; message: string } {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'La contraseña es requerida',
    };
  }

  // Check minimum length
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 8 caracteres',
    };
  }

  // Check maximum length (prevent DoS attacks)
  if (password.length > 128) {
    return {
      isValid: false,
      message: 'La contraseña es demasiado larga (máximo 128 caracteres)',
    };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe incluir al menos una mayúscula',
    };
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe incluir al menos una minúscula',
    };
  }

  // Check for number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe incluir al menos un número',
    };
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password',
    'password123',
    'password1',
    '12345678',
    '123456789',
    'qwerty',
    'qwerty123',
    'abc123',
    'abc12345',
    'letmein',
    'welcome',
    'welcome1',
    'admin',
    'admin123',
    'passw0rd',
    'p@ssword',
    'p@ssw0rd',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      isValid: false,
      message: 'Esta contraseña es demasiado común. Elegí una más segura',
    };
  }

  // Check for repeating characters (e.g., "aaaa", "1111")
  if (/(.)\1{3,}/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña no debe contener más de 3 caracteres iguales consecutivos',
    };
  }

  // Check for sequential characters (e.g., "1234", "abcd")
  const hasSequentialNumbers = /(?:0123|1234|2345|3456|4567|5678|6789)/.test(password);
  const hasSequentialLetters = /(?:abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)/i.test(password);

  if (hasSequentialNumbers || hasSequentialLetters) {
    return {
      isValid: false,
      message: 'La contraseña no debe contener secuencias simples (1234, abcd, etc.)',
    };
  }

  return { isValid: true, message: '' };
}

/**
 * Get password strength level
 * @param password - Password to check
 * @returns Strength level: 'weak', 'medium', 'strong', 'very-strong'
 * @example
 * getPasswordStrength('Pass123!') // 'strong'
 * getPasswordStrength('weak') // 'weak'
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
  if (!password) {
    return 'weak';
  }

  let score = 0;

  // Length score
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety score
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  // Complexity bonus
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    score += 1;
  }

  // Deductions for common patterns
  if (/^[a-z]+$/.test(password) || /^[A-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
    score -= 2;
  }

  // Map score to strength level
  if (score <= 3) return 'weak';
  if (score <= 5) return 'medium';
  if (score <= 7) return 'strong';
  return 'very-strong';
}

/**
 * Validates a stock/ETF ticker symbol
 * Allows 1-5 uppercase letters and optional dot notation (e.g., BRK.A)
 * @param ticker - Ticker symbol to validate
 * @returns True if ticker is valid, false otherwise
 * @example
 * isValidTicker('AAPL') // true
 * isValidTicker('BRK.A') // true
 * isValidTicker('invalid123') // false
 */
export function isValidTicker(ticker: string): boolean {
  const tickerRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;
  return tickerRegex.test(ticker.toUpperCase());
}

/**
 * Validates a URL
 * @param url - URL string to validate
 * @returns True if URL is valid, false otherwise
 * @example
 * isValidUrl('https://example.com') // true
 * isValidUrl('not a url') // false
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a positive number
 * @param value - Value to validate
 * @returns True if value is a positive number, false otherwise
 * @example
 * isPositiveNumber(10) // true
 * isPositiveNumber(-5) // false
 * isPositiveNumber(0) // false
 */
export function isPositiveNumber(value: number | string): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
}

/**
 * Validates a date is in the future
 * @param date - Date to validate (Date object or ISO string)
 * @returns True if date is in the future, false otherwise
 * @example
 * isFutureDate(new Date('2030-01-01')) // true
 * isFutureDate(new Date('2020-01-01')) // false
 */
export function isFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
}

/**
 * Validates a date is in the past
 * @param date - Date to validate (Date object or ISO string)
 * @returns True if date is in the past, false otherwise
 * @example
 * isPastDate(new Date('2020-01-01')) // true
 * isPastDate(new Date('2030-01-01')) // false
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() < Date.now();
}

/**
 * Sanitizes user input by trimming whitespace and removing dangerous characters
 * @param input - String to sanitize
 * @returns Sanitized string
 * @example
 * sanitizeInput('  hello world  ') // 'hello world'
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validates a phone number (Argentina format)
 * Accepts formats: +54 11 1234-5678, 011 1234-5678, 11-1234-5678
 * @param phone - Phone number to validate
 * @returns True if phone is valid, false otherwise
 * @example
 * isValidPhone('+54 11 1234-5678') // true
 * isValidPhone('11-1234-5678') // true
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+54\s?)?(\(?\d{2,4}\)?[\s.-]?)?\d{4}[\s.-]?\d{4}$/;
  return phoneRegex.test(phone);
}
