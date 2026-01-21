/**
 * Asset type constants for portfolio management
 * Used in dropdowns and filtering throughout the application
 */

export const ASSET_TYPES = [
  { value: 'Acción', label: 'Acción' },
  { value: 'ETF', label: 'ETF' },
  { value: 'Bono', label: 'Bono' },
  { value: 'Crypto', label: 'Criptomoneda' },
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Fondo Común', label: 'Fondo Común de Inversión' },
  { value: 'Cedear', label: 'CEDEAR' },
  { value: 'ON', label: 'Obligación Negociable' },
  { value: 'Plazo Fijo', label: 'Plazo Fijo' },
  { value: 'Otro', label: 'Otro' },
] as const;

/**
 * Type-safe asset type values
 */
export type AssetType = (typeof ASSET_TYPES)[number]['value'];

/**
 * Helper function to get asset type label from value
 * @param value - Asset type value
 * @returns Asset type label or the value if not found
 */
export function getAssetTypeLabel(value: string): string {
  const assetType = ASSET_TYPES.find((type) => type.value === value);
  return assetType?.label || value;
}

/**
 * Asset types that typically have a ticker symbol
 */
export const TICKERED_ASSET_TYPES: AssetType[] = ['Acción', 'ETF', 'Cedear'];

/**
 * Asset types that are fixed income
 */
export const FIXED_INCOME_TYPES: AssetType[] = ['Bono', 'ON', 'Plazo Fijo'];

/**
 * Asset types that are alternative investments
 */
export const ALTERNATIVE_ASSET_TYPES: AssetType[] = ['Crypto'];
