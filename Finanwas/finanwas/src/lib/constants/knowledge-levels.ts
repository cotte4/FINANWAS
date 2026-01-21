/**
 * Financial questionnaire options and constants
 * Used in the onboarding questionnaire and user profile
 */

/**
 * Knowledge level options for financial literacy
 */
export const KNOWLEDGE_LEVELS = [
  {
    value: 'Principiante',
    label: 'Principiante',
    description: 'Estoy empezando a aprender sobre finanzas personales',
  },
  {
    value: 'Intermedio',
    label: 'Intermedio',
    description: 'Tengo conocimientos básicos y algo de experiencia',
  },
  {
    value: 'Avanzado',
    label: 'Avanzado',
    description: 'Tengo experiencia significativa en inversiones',
  },
] as const;

export type KnowledgeLevel = (typeof KNOWLEDGE_LEVELS)[number]['value'];

/**
 * Main financial goal options
 */
export const MAIN_GOALS = [
  {
    value: 'Ahorrar',
    label: 'Ahorrar dinero',
    description: 'Quiero construir un fondo de emergencia o ahorrar para objetivos específicos',
  },
  {
    value: 'Invertir',
    label: 'Invertir',
    description: 'Quiero hacer crecer mi dinero a través de inversiones',
  },
  {
    value: 'Salir de deudas',
    label: 'Salir de deudas',
    description: 'Necesito ayuda para gestionar y eliminar mis deudas',
  },
  {
    value: 'Jubilarme',
    label: 'Planificar jubilación',
    description: 'Quiero planificar para mi retiro',
  },
  {
    value: 'Aprender',
    label: 'Aprender',
    description: 'Quiero educación financiera general',
  },
] as const;

export type MainGoal = (typeof MAIN_GOALS)[number]['value'];

/**
 * Risk tolerance options
 */
export const RISK_TOLERANCE_LEVELS = [
  {
    value: 'Conservador',
    label: 'Conservador',
    description: 'Prefiero seguridad sobre rendimientos altos',
  },
  {
    value: 'Moderado',
    label: 'Moderado',
    description: 'Acepto algo de riesgo por mejores rendimientos',
  },
  {
    value: 'Agresivo',
    label: 'Agresivo',
    description: 'Busco máximos rendimientos, acepto volatilidad',
  },
] as const;

export type RiskTolerance = (typeof RISK_TOLERANCE_LEVELS)[number]['value'];

/**
 * Investment horizon options
 */
export const INVESTMENT_HORIZONS = [
  {
    value: 'Corto plazo',
    label: 'Corto plazo (< 2 años)',
    description: 'Necesitaré el dinero pronto',
  },
  {
    value: 'Mediano plazo',
    label: 'Mediano plazo (2-5 años)',
    description: 'Puedo esperar algunos años',
  },
  {
    value: 'Largo plazo',
    label: 'Largo plazo (5+ años)',
    description: 'No necesitaré el dinero por mucho tiempo',
  },
] as const;

export type InvestmentHorizon = (typeof INVESTMENT_HORIZONS)[number]['value'];

/**
 * Income range options (monthly, in ARS)
 */
export const INCOME_RANGES = [
  { value: '0-200000', label: 'Menos de $200.000' },
  { value: '200000-400000', label: '$200.000 - $400.000' },
  { value: '400000-600000', label: '$400.000 - $600.000' },
  { value: '600000-1000000', label: '$600.000 - $1.000.000' },
  { value: '1000000+', label: 'Más de $1.000.000' },
  { value: 'no-answer', label: 'Prefiero no responder' },
] as const;

export type IncomeRange = (typeof INCOME_RANGES)[number]['value'];

/**
 * Expense range options (monthly, in ARS)
 */
export const EXPENSE_RANGES = [
  { value: '0-200000', label: 'Menos de $200.000' },
  { value: '200000-400000', label: '$200.000 - $400.000' },
  { value: '400000-600000', label: '$400.000 - $600.000' },
  { value: '600000-1000000', label: '$600.000 - $1.000.000' },
  { value: '1000000+', label: 'Más de $1.000.000' },
  { value: 'no-answer', label: 'Prefiero no responder' },
] as const;

export type ExpenseRange = (typeof EXPENSE_RANGES)[number]['value'];

/**
 * Country options (prioritizing Latin America)
 */
export const COUNTRIES = [
  { value: 'AR', label: 'Argentina' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'CL', label: 'Chile' },
  { value: 'BR', label: 'Brasil' },
  { value: 'MX', label: 'México' },
  { value: 'CO', label: 'Colombia' },
  { value: 'PE', label: 'Perú' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'ES', label: 'España' },
  { value: 'OTHER', label: 'Otro' },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]['value'];
