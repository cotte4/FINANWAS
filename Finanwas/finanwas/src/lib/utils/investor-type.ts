/**
 * Investor type calculation utility
 * Determines user's investor profile based on questionnaire responses
 */

import type { UserProfile } from '@/types/database';

export type InvestorType = 'conservador' | 'moderado' | 'agresivo';

/**
 * Calculates the investor type based on user profile questionnaire data
 *
 * Weighting:
 * - risk_tolerance: 40%
 * - investment_horizon: 30%
 * - knowledge_level: 20%
 * - has_emergency_fund: 10%
 *
 * @param profile - User profile with questionnaire data
 * @returns Investor type or null if questionnaire not completed
 */
export function calculateInvestorType(profile: UserProfile): InvestorType | null {
  // Return null if questionnaire not completed
  if (!profile.questionnaire_completed) {
    return null;
  }

  // Calculate score from 0-100 (higher = more aggressive)
  let score = 0;

  // Risk tolerance (40% weight)
  if (profile.risk_tolerance) {
    const riskScore = getRiskToleranceScore(profile.risk_tolerance);
    score += riskScore * 0.4;
  }

  // Investment horizon (30% weight)
  if (profile.investment_horizon) {
    const horizonScore = getInvestmentHorizonScore(profile.investment_horizon);
    score += horizonScore * 0.3;
  }

  // Knowledge level (20% weight)
  if (profile.knowledge_level) {
    const knowledgeScore = getKnowledgeLevelScore(profile.knowledge_level);
    score += knowledgeScore * 0.2;
  }

  // Emergency fund (10% weight)
  const emergencyScore = getEmergencyFundScore(profile.has_emergency_fund);
  score += emergencyScore * 0.1;

  // Map score to investor type
  // 0-33: conservador
  // 34-66: moderado
  // 67-100: agresivo
  if (score <= 33) {
    return 'conservador';
  } else if (score <= 66) {
    return 'moderado';
  } else {
    return 'agresivo';
  }
}

/**
 * Get risk tolerance score (0-100)
 * Higher score = more aggressive
 */
function getRiskToleranceScore(riskTolerance: string): number {
  const normalized = riskTolerance.toLowerCase();

  if (normalized.includes('conservador')) {
    return 0;
  } else if (normalized.includes('moderado')) {
    return 50;
  } else if (normalized.includes('agresivo')) {
    return 100;
  }

  // Default to moderate if unrecognized
  return 50;
}

/**
 * Get investment horizon score (0-100)
 * Longer horizon = more aggressive (can weather volatility)
 */
function getInvestmentHorizonScore(horizon: string): number {
  const normalized = horizon.toLowerCase();

  if (normalized.includes('corto')) {
    // Short-term: < 1 year
    return 0;
  } else if (normalized.includes('mediano')) {
    // Medium-term: 1-5 years
    return 50;
  } else if (normalized.includes('largo')) {
    // Long-term: > 5 years
    return 100;
  }

  // Default to medium if unrecognized
  return 50;
}

/**
 * Get knowledge level score (0-100)
 * Higher knowledge = can handle more complex/aggressive strategies
 */
function getKnowledgeLevelScore(knowledgeLevel: string): number {
  const normalized = knowledgeLevel.toLowerCase();

  if (normalized.includes('principiante')) {
    return 0;
  } else if (normalized.includes('intermedio')) {
    return 50;
  } else if (normalized.includes('avanzado')) {
    return 100;
  }

  // Default to beginner if unrecognized
  return 0;
}

/**
 * Get emergency fund score (0-100)
 * Having emergency fund = can take more risk with investments
 */
function getEmergencyFundScore(hasEmergencyFund: boolean | null): number {
  if (hasEmergencyFund === true) {
    return 100;
  } else if (hasEmergencyFund === false) {
    return 0;
  }

  // Default to conservative if unknown
  return 0;
}

/**
 * Get a human-readable description of an investor type
 */
export function getInvestorTypeDescription(type: InvestorType): string {
  switch (type) {
    case 'conservador':
      return 'Preferís preservar tu capital y evitar riesgos. Inversiones de bajo riesgo como plazos fijos o bonos son ideales para vos.';
    case 'moderado':
      return 'Buscás un balance entre seguridad y crecimiento. Podés tolerar cierta volatilidad a cambio de mejores retornos a largo plazo.';
    case 'agresivo':
      return 'Buscás maximizar retornos y estás dispuesto a asumir mayor riesgo. Inversiones en acciones y activos de alto crecimiento son apropiadas para vos.';
  }
}
