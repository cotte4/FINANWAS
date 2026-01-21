import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Thresholds for traffic light colors
 */
export interface TrafficLightThresholds {
  /** Value below this is red */
  red: number;
  /** Value above this is green */
  green: number;
}

/**
 * Traffic light color
 */
export type TrafficLightColor = 'green' | 'yellow' | 'red' | 'gray';

/**
 * Props for the TrafficLight component
 */
export interface TrafficLightProps {
  /** The numeric value to evaluate */
  value: number | null | undefined;
  /** Thresholds for determining color */
  thresholds: TrafficLightThresholds;
  /** If true, higher values are worse (default: false - higher is better) */
  inverse?: boolean;
  /** Size of the circle (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Optional CSS class */
  className?: string;
  /** Optional label to show next to the light */
  label?: string;
  /** Show tooltip with value on hover */
  showTooltip?: boolean;
}

/**
 * Determine the traffic light color based on value and thresholds
 */
function getTrafficLightColor(
  value: number | null | undefined,
  thresholds: TrafficLightThresholds,
  inverse: boolean = false
): TrafficLightColor {
  if (value === null || value === undefined) {
    return 'gray';
  }

  const { red, green } = thresholds;

  if (inverse) {
    // Inverse mode: lower is better
    if (value <= green) return 'green';
    if (value >= red) return 'red';
    return 'yellow';
  } else {
    // Normal mode: higher is better
    if (value >= green) return 'green';
    if (value <= red) return 'red';
    return 'yellow';
  }
}

/**
 * Get size classes for the traffic light
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'h-3 w-3';
    case 'lg':
      return 'h-6 w-6';
    case 'md':
    default:
      return 'h-4 w-4';
  }
}

/**
 * Get color classes for the traffic light
 */
function getColorClasses(color: TrafficLightColor): string {
  switch (color) {
    case 'green':
      return 'bg-success shadow-success/50';
    case 'yellow':
      return 'bg-warning shadow-warning/50';
    case 'red':
      return 'bg-error shadow-error/50';
    case 'gray':
    default:
      return 'bg-muted shadow-muted/50';
  }
}

/**
 * TrafficLight component
 *
 * Displays a colored circle (green/yellow/red) based on a numeric value and thresholds.
 * Useful for visualizing metrics like ROE, P/E ratio, debt-to-equity, etc.
 *
 * @example
 * ```tsx
 * // Higher ROE is better
 * <TrafficLight value={15} thresholds={{ red: 5, green: 12 }} />
 *
 * // Lower debt-to-equity is better
 * <TrafficLight value={0.8} thresholds={{ red: 2, green: 1 }} inverse />
 * ```
 */
export function TrafficLight({
  value,
  thresholds,
  inverse = false,
  size = 'md',
  className,
  label,
  showTooltip = false,
}: TrafficLightProps) {
  const color = getTrafficLightColor(value, thresholds, inverse);
  const sizeClasses = getSizeClasses(size);
  const colorClasses = getColorClasses(color);

  const circle = (
    <div
      className={cn(
        'rounded-full shadow-md transition-all duration-200',
        sizeClasses,
        colorClasses,
        className
      )}
      title={
        showTooltip && value !== null && value !== undefined
          ? `Valor: ${value.toFixed(2)}`
          : undefined
      }
      aria-label={`Indicador ${color}${value !== null && value !== undefined ? `: ${value}` : ''}`}
    />
  );

  if (label) {
    return (
      <div className="inline-flex items-center gap-2">
        {circle}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    );
  }

  return circle;
}

/**
 * Get a readable description of what the color means
 */
export function getTrafficLightDescription(
  color: TrafficLightColor,
  inverse: boolean = false
): string {
  if (color === 'gray') return 'Sin datos';

  if (inverse) {
    switch (color) {
      case 'green':
        return 'Excelente (bajo)';
      case 'yellow':
        return 'Aceptable';
      case 'red':
        return 'Alto riesgo';
      default:
        return '';
    }
  } else {
    switch (color) {
      case 'green':
        return 'Excelente';
      case 'yellow':
        return 'Aceptable';
      case 'red':
        return 'Bajo';
      default:
        return '';
    }
  }
}
