import { describe, it, expect } from 'vitest';
import {
  calculateROI,
  calculatePortfolioTotal,
  calculatePortfolioGain,
  calculateAssetGain,
  calculateGoalProgress,
  calculateWeightedAverage,
  calculateAssetDistribution,
  calculateCompoundInterest,
  roundToDecimals,
} from '@/lib/utils/calculations';

describe('Calculations', () => {
  describe('calculateROI', () => {
    it('should calculate positive ROI', () => {
      const roi = calculateROI(11500, 10000);
      expect(roi).toBe(0.15);
    });

    it('should calculate negative ROI', () => {
      const roi = calculateROI(9000, 10000);
      expect(roi).toBe(-0.1);
    });

    it('should return 0 for same values', () => {
      const roi = calculateROI(10000, 10000);
      expect(roi).toBe(0);
    });

    it('should return 0 when initial value is 0', () => {
      const roi = calculateROI(1000, 0);
      expect(roi).toBe(0);
    });

    it('should handle decimal values', () => {
      const roi = calculateROI(115.5, 100);
      expect(roi).toBeCloseTo(0.155, 3);
    });
  });

  describe('calculatePortfolioTotal', () => {
    it('should calculate total with current prices', () => {
      const assets = [
        { quantity: 10, current_price: 150, purchase_price: 140 },
        { quantity: 5, current_price: 200, purchase_price: 180 },
      ];
      const total = calculatePortfolioTotal(assets);
      expect(total).toBe(2500); // (10 * 150) + (5 * 200)
    });

    it('should use purchase price when current price is null', () => {
      const assets = [
        { quantity: 10, current_price: null, purchase_price: 140 },
        { quantity: 5, current_price: 200, purchase_price: 180 },
      ];
      const total = calculatePortfolioTotal(assets);
      expect(total).toBe(2400); // (10 * 140) + (5 * 200)
    });

    it('should return 0 for empty portfolio', () => {
      const total = calculatePortfolioTotal([]);
      expect(total).toBe(0);
    });

    it('should handle mixed asset types', () => {
      const assets = [
        { quantity: 1, current_price: 1000, purchase_price: 900 },
        { quantity: 100, current_price: 10, purchase_price: 9 },
      ];
      const total = calculatePortfolioTotal(assets);
      expect(total).toBe(2000);
    });
  });

  describe('calculatePortfolioGain', () => {
    it('should calculate gain and percentage correctly', () => {
      const assets = [
        { quantity: 10, purchase_price: 100, current_price: 115 },
        { quantity: 5, purchase_price: 200, current_price: 220 },
      ];
      const result = calculatePortfolioGain(assets);

      expect(result.totalGain).toBe(250); // (10 * 15) + (5 * 20)
      expect(result.totalGainPercentage).toBeCloseTo(0.125, 3); // 250 / 2000
    });

    it('should calculate loss correctly', () => {
      const assets = [
        { quantity: 10, purchase_price: 100, current_price: 90 },
      ];
      const result = calculatePortfolioGain(assets);

      expect(result.totalGain).toBe(-100);
      expect(result.totalGainPercentage).toBe(-0.1);
    });

    it('should handle null current prices', () => {
      const assets = [
        { quantity: 10, purchase_price: 100, current_price: null },
      ];
      const result = calculatePortfolioGain(assets);

      expect(result.totalGain).toBe(0);
      expect(result.totalGainPercentage).toBe(0);
    });

    it('should return 0s for empty portfolio', () => {
      const result = calculatePortfolioGain([]);
      expect(result.totalGain).toBe(0);
      expect(result.totalGainPercentage).toBe(0);
    });
  });

  describe('calculateAssetGain', () => {
    it('should calculate gain for single asset', () => {
      const result = calculateAssetGain(10, 100, 115);

      expect(result.gain).toBe(150); // 10 * (115 - 100)
      expect(result.gainPercentage).toBe(0.15);
    });

    it('should calculate loss for single asset', () => {
      const result = calculateAssetGain(10, 100, 90);

      expect(result.gain).toBe(-100);
      expect(result.gainPercentage).toBe(-0.1);
    });

    it('should use purchase price when current price is not provided', () => {
      const result = calculateAssetGain(10, 100);

      expect(result.gain).toBe(0);
      expect(result.gainPercentage).toBe(0);
    });

    it('should handle null current price', () => {
      const result = calculateAssetGain(10, 100, null);

      expect(result.gain).toBe(0);
      expect(result.gainPercentage).toBe(0);
    });
  });

  describe('calculateGoalProgress', () => {
    it('should calculate progress correctly', () => {
      const progress = calculateGoalProgress(7500, 10000);
      expect(progress).toBe(0.75);
    });

    it('should clamp progress at 100%', () => {
      const progress = calculateGoalProgress(12000, 10000);
      expect(progress).toBe(1.0);
    });

    it('should return 0 for zero target', () => {
      const progress = calculateGoalProgress(1000, 0);
      expect(progress).toBe(0);
    });

    it('should return 0 for negative target', () => {
      const progress = calculateGoalProgress(1000, -100);
      expect(progress).toBe(0);
    });

    it('should clamp negative current values at 0', () => {
      const progress = calculateGoalProgress(-1000, 10000);
      expect(progress).toBe(0);
    });
  });

  describe('calculateWeightedAverage', () => {
    it('should calculate weighted average correctly', () => {
      const values = [
        { value: 100, weight: 0.5 },
        { value: 200, weight: 0.5 },
      ];
      const avg = calculateWeightedAverage(values);
      expect(avg).toBe(150);
    });

    it('should handle different weights', () => {
      const values = [
        { value: 100, weight: 0.25 },
        { value: 200, weight: 0.75 },
      ];
      const avg = calculateWeightedAverage(values);
      expect(avg).toBe(175);
    });

    it('should return 0 for zero total weight', () => {
      const values = [
        { value: 100, weight: 0 },
        { value: 200, weight: 0 },
      ];
      const avg = calculateWeightedAverage(values);
      expect(avg).toBe(0);
    });

    it('should return 0 for empty array', () => {
      const avg = calculateWeightedAverage([]);
      expect(avg).toBe(0);
    });
  });

  describe('calculateAssetDistribution', () => {
    it('should calculate distribution by type', () => {
      const assets = [
        { type: 'Acción', quantity: 10, current_price: 100, purchase_price: 90 },
        { type: 'Acción', quantity: 5, current_price: 200, purchase_price: 180 },
        { type: 'ETF', quantity: 10, current_price: 150, purchase_price: 140 },
      ];
      const distribution = calculateAssetDistribution(assets);

      expect(distribution['Acción']).toBeCloseTo(0.5, 2); // 2000 / 4000
      expect(distribution['ETF']).toBeCloseTo(0.375, 2); // 1500 / 4000
    });

    it('should return empty object for empty portfolio', () => {
      const distribution = calculateAssetDistribution([]);
      expect(distribution).toEqual({});
    });

    it('should handle null current prices', () => {
      const assets = [
        { type: 'Acción', quantity: 10, current_price: null, purchase_price: 100 },
      ];
      const distribution = calculateAssetDistribution(assets);
      expect(distribution['Acción']).toBe(1);
    });
  });

  describe('calculateCompoundInterest', () => {
    it('should calculate compound interest with default monthly compounding', () => {
      const result = calculateCompoundInterest(10000, 0.05, 5);
      expect(result).toBeCloseTo(12833.59, 2);
    });

    it('should calculate with annual compounding', () => {
      const result = calculateCompoundInterest(10000, 0.05, 5, 1);
      expect(result).toBeCloseTo(12762.82, 2);
    });

    it('should calculate with daily compounding', () => {
      const result = calculateCompoundInterest(10000, 0.05, 5, 365);
      expect(result).toBeCloseTo(12840.03, 2);
    });

    it('should return principal for zero rate', () => {
      const result = calculateCompoundInterest(10000, 0, 5);
      expect(result).toBe(10000);
    });

    it('should return principal for zero years', () => {
      const result = calculateCompoundInterest(10000, 0.05, 0);
      expect(result).toBe(10000);
    });
  });

  describe('roundToDecimals', () => {
    it('should round to 2 decimals by default', () => {
      expect(roundToDecimals(3.14159)).toBe(3.14);
    });

    it('should round to specified decimals', () => {
      expect(roundToDecimals(3.14159, 3)).toBe(3.142);
      expect(roundToDecimals(3.14159, 1)).toBe(3.1);
      expect(roundToDecimals(3.14159, 0)).toBe(3);
    });

    it('should handle whole numbers', () => {
      expect(roundToDecimals(5, 2)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(roundToDecimals(-3.14159, 2)).toBe(-3.14);
    });
  });
});
