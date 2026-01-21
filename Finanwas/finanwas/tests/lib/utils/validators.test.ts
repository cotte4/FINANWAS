import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidTicker,
  isValidUrl,
  isPositiveNumber,
  isFutureDate,
  isPastDate,
  sanitizeInput,
  isValidPhone,
} from '@/lib/utils/validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co')).toBe(true);
      expect(isValidEmail('name+tag@company.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      const result = isValidPassword('SecurePass123');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = isValidPassword('Short1A');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = isValidPassword('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('La contraseña debe incluir al menos una mayúscula');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = isValidPassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('La contraseña debe incluir al menos una minúscula');
    });

    it('should reject passwords without numbers', () => {
      const result = isValidPassword('NoNumbers');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('La contraseña debe incluir al menos un número');
    });

    it('should validate password with special characters', () => {
      const result = isValidPassword('SecurePass123!@#');
      expect(result.isValid).toBe(true);
    });
  });

  describe('isValidTicker', () => {
    it('should validate simple ticker symbols', () => {
      expect(isValidTicker('AAPL')).toBe(true);
      expect(isValidTicker('MSFT')).toBe(true);
      expect(isValidTicker('GOOGL')).toBe(true);
    });

    it('should validate tickers with dot notation', () => {
      expect(isValidTicker('BRK.A')).toBe(true);
      expect(isValidTicker('BRK.B')).toBe(true);
    });

    it('should handle lowercase input', () => {
      expect(isValidTicker('aapl')).toBe(true);
    });

    it('should reject invalid ticker symbols', () => {
      expect(isValidTicker('TOOLONG')).toBe(false);
      expect(isValidTicker('123')).toBe(false);
      expect(isValidTicker('ABC-DEF')).toBe(false);
      expect(isValidTicker('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://test.org')).toBe(true);
      expect(isValidUrl('https://subdomain.example.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(isPositiveNumber(10)).toBe(true);
      expect(isPositiveNumber(0.5)).toBe(true);
      expect(isPositiveNumber(1000)).toBe(true);
    });

    it('should validate positive number strings', () => {
      expect(isPositiveNumber('10')).toBe(true);
      expect(isPositiveNumber('0.5')).toBe(true);
    });

    it('should reject zero and negative numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-5)).toBe(false);
      expect(isPositiveNumber('-10')).toBe(false);
    });

    it('should reject non-numeric values', () => {
      expect(isPositiveNumber('abc')).toBe(false);
      expect(isPositiveNumber(NaN)).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should validate future dates', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('should validate future date strings', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('should reject past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isFutureDate(pastDate)).toBe(false);
    });

    it('should reject current time (approximately)', () => {
      const now = new Date();
      expect(isFutureDate(now)).toBe(false);
    });
  });

  describe('isPastDate', () => {
    it('should validate past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('should validate past date strings', () => {
      expect(isPastDate('2020-01-01')).toBe(true);
    });

    it('should reject future dates', () => {
      const futureDate = new Date(Date.now() + 86400000);
      expect(isPastDate(futureDate)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeInput('hello<script>alert("xss")</script>')).not.toContain('<');
      expect(sanitizeInput('hello<script>alert("xss")</script>')).not.toContain('>');
    });

    it('should keep normal text intact', () => {
      expect(sanitizeInput('hello world')).toBe('hello world');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('isValidPhone', () => {
    it('should validate Argentina phone numbers', () => {
      expect(isValidPhone('+54 11 1234-5678')).toBe(true);
      expect(isValidPhone('011 1234-5678')).toBe(true);
      expect(isValidPhone('11-1234-5678')).toBe(true);
    });

    it('should validate phone numbers without formatting', () => {
      expect(isValidPhone('1112345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcd')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });
});
