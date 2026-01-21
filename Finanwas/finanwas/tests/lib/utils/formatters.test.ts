import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatLongDate,
  formatRelativeTime,
  formatPercentage,
  formatNumber,
} from '@/lib/utils/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format ARS currency correctly', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1.234,56');
    });

    it('should format USD currency correctly', () => {
      const result = formatCurrency(1000, 'USD');
      expect(result).toContain('1.000,00');
    });

    it('should handle zero amounts', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0,00');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-500.50);
      expect(result).toContain('500,50');
    });

    it('should handle large amounts', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1.000.000,00');
    });
  });

  describe('formatCompactCurrency', () => {
    it('should format thousands with K suffix', () => {
      const result = formatCompactCurrency(1500);
      expect(result).toContain('K');
    });

    it('should format millions with M suffix', () => {
      const result = formatCompactCurrency(1500000);
      expect(result).toContain('M');
    });

    it('should handle small amounts', () => {
      const result = formatCompactCurrency(100);
      expect(result).toBeTruthy();
    });
  });

  describe('formatDate', () => {
    it('should format Date object to Spanish locale', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toMatch(/15\/1\/2024|15\/01\/2024/);
    });

    it('should format ISO string to Spanish locale', () => {
      const result = formatDate('2024-01-15');
      expect(result).toMatch(/15\/1\/2024|15\/01\/2024/);
    });

    it('should handle different dates', () => {
      const result = formatDate('2023-12-31');
      expect(result).toMatch(/31\/12\/2023/);
    });
  });

  describe('formatLongDate', () => {
    it('should format date in long format with month name', () => {
      const date = new Date('2024-01-15');
      const result = formatLongDate(date);
      expect(result).toContain('enero');
      expect(result).toContain('2024');
    });

    it('should handle string dates', () => {
      const result = formatLongDate('2024-06-20');
      expect(result).toContain('junio');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "hace unos segundos" for very recent dates', () => {
      const date = new Date(Date.now() - 30000); // 30 seconds ago
      const result = formatRelativeTime(date);
      expect(result).toBe('hace unos segundos');
    });

    it('should return minutes for dates within an hour', () => {
      const date = new Date(Date.now() - 300000); // 5 minutes ago
      const result = formatRelativeTime(date);
      expect(result).toContain('minuto');
    });

    it('should return hours for dates within a day', () => {
      const date = new Date(Date.now() - 7200000); // 2 hours ago
      const result = formatRelativeTime(date);
      expect(result).toContain('hora');
    });

    it('should return days for recent dates', () => {
      const date = new Date(Date.now() - 172800000); // 2 days ago
      const result = formatRelativeTime(date);
      expect(result).toContain('día');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      const result = formatPercentage(0.1523);
      expect(result).toBe('15,23 %');
    });

    it('should format percentage with custom decimals', () => {
      const result = formatPercentage(0.1523, 1);
      expect(result).toBe('15,2 %');
    });

    it('should handle zero percentage', () => {
      const result = formatPercentage(0);
      expect(result).toBe('0,00 %');
    });

    it('should handle negative percentages', () => {
      const result = formatPercentage(-0.05);
      expect(result).toContain('5');
    });

    it('should handle whole percentages', () => {
      const result = formatPercentage(1);
      expect(result).toBe('100,00 %');
    });
  });

  describe('formatNumber', () => {
    it('should format number with thousands separators', () => {
      const result = formatNumber(1234567.89);
      expect(result).toBe('1.234.567,89');
    });

    it('should format number with custom decimals', () => {
      const result = formatNumber(1234.5678, 0);
      expect(result).toBe('1.235');
    });

    it('should handle zero', () => {
      const result = formatNumber(0);
      expect(result).toBe('0,00');
    });

    it('should handle negative numbers', () => {
      const result = formatNumber(-1234.56);
      expect(result).toBe('-1.234,56');
    });
  });
});
