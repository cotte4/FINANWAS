/**
 * Savings goal type options and constants
 */

/**
 * Predefined savings goal types with icons and descriptions
 */
export const GOAL_TYPES = [
  {
    value: 'Fondo de emergencia',
    label: 'Fondo de emergencia',
    description: 'Para cubrir gastos inesperados',
    icon: '🛡️',
    suggestedAmount: 300000, // Suggested amount in ARS
  },
  {
    value: 'Viaje',
    label: 'Viaje',
    description: 'Ahorrar para unas vacaciones',
    icon: '✈️',
    suggestedAmount: 500000,
  },
  {
    value: 'Auto',
    label: 'Comprar auto',
    description: 'Ahorrar para un vehículo',
    icon: '🚗',
    suggestedAmount: 5000000,
  },
  {
    value: 'Casa',
    label: 'Comprar casa',
    description: 'Ahorrar para propiedad',
    icon: '🏠',
    suggestedAmount: 10000000,
  },
  {
    value: 'Educación',
    label: 'Educación',
    description: 'Estudios o cursos',
    icon: '📚',
    suggestedAmount: 400000,
  },
  {
    value: 'Inversión',
    label: 'Capital de inversión',
    description: 'Crear un fondo para invertir',
    icon: '📈',
    suggestedAmount: 1000000,
  },
  {
    value: 'Jubilación',
    label: 'Jubilación',
    description: 'Fondo para el retiro',
    icon: '🏖️',
    suggestedAmount: 20000000,
  },
  {
    value: 'Boda',
    label: 'Boda',
    description: 'Ahorrar para casamiento',
    icon: '💍',
    suggestedAmount: 2000000,
  },
  {
    value: 'Bebé',
    label: 'Fondo para bebé',
    description: 'Gastos del primer año',
    icon: '👶',
    suggestedAmount: 800000,
  },
  {
    value: 'Otro',
    label: 'Otro objetivo',
    description: 'Meta de ahorro personalizada',
    icon: '🎯',
    suggestedAmount: 100000,
  },
] as const;

export type GoalType = (typeof GOAL_TYPES)[number]['value'];

/**
 * Helper function to get goal type details
 * @param value - Goal type value
 * @returns Goal type details or undefined if not found
 */
export function getGoalTypeDetails(value: string) {
  return GOAL_TYPES.find((type) => type.value === value);
}

/**
 * Helper function to get goal icon
 * @param value - Goal type value
 * @returns Goal icon emoji
 */
export function getGoalIcon(value: string): string {
  const goalType = GOAL_TYPES.find((type) => type.value === value);
  return goalType?.icon || '🎯';
}

/**
 * Goal time frames for target dates
 */
export const GOAL_TIME_FRAMES = [
  { value: '3-months', label: '3 meses', months: 3 },
  { value: '6-months', label: '6 meses', months: 6 },
  { value: '1-year', label: '1 año', months: 12 },
  { value: '2-years', label: '2 años', months: 24 },
  { value: '5-years', label: '5 años', months: 60 },
  { value: 'custom', label: 'Personalizado', months: null },
] as const;

export type GoalTimeFrame = (typeof GOAL_TIME_FRAMES)[number]['value'];
