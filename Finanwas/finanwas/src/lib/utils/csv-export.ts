import { PortfolioAsset } from '@/types/database';

/**
 * CSV column definition
 */
interface CsvColumn {
  header: string;
  getValue: (asset: PortfolioAsset) => string | number;
}

/**
 * Portfolio CSV columns
 */
const PORTFOLIO_COLUMNS: CsvColumn[] = [
  {
    header: 'Nombre',
    getValue: (asset) => asset.name,
  },
  {
    header: 'Ticker',
    getValue: (asset) => asset.ticker || 'N/A',
  },
  {
    header: 'Tipo',
    getValue: (asset) => asset.type,
  },
  {
    header: 'Cantidad',
    getValue: (asset) => asset.quantity,
  },
  {
    header: 'Precio Compra',
    getValue: (asset) => asset.purchase_price,
  },
  {
    header: 'Moneda',
    getValue: (asset) => asset.currency,
  },
  {
    header: 'Fecha',
    getValue: (asset) => new Date(asset.purchase_date).toLocaleDateString('es-AR'),
  },
  {
    header: 'Precio Actual',
    getValue: (asset) => asset.current_price ?? 'N/A',
  },
  {
    header: 'Rendimiento %',
    getValue: (asset) => {
      if (!asset.current_price) return 'N/A';
      const returnPercent =
        ((asset.current_price - asset.purchase_price) / asset.purchase_price) * 100;
      return returnPercent.toFixed(2);
    },
  },
  {
    header: 'Valor Total',
    getValue: (asset) => {
      const currentPrice = asset.current_price ?? asset.purchase_price;
      return (currentPrice * asset.quantity).toFixed(2);
    },
  },
];

/**
 * Escape CSV field value
 * @param value - The value to escape
 * @returns Escaped value for CSV
 */
function escapeCsvField(value: string | number): string {
  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Generate CSV content from portfolio assets
 * @param assets - Array of portfolio assets
 * @returns CSV string with BOM for Excel compatibility
 *
 * @example
 * ```ts
 * const csv = generatePortfolioCSV(assets);
 * const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
 * const url = URL.createObjectURL(blob);
 * const link = document.createElement('a');
 * link.href = url;
 * link.download = 'portfolio.csv';
 * link.click();
 * ```
 */
export function generatePortfolioCSV(assets: PortfolioAsset[]): string {
  // Add BOM (Byte Order Mark) for Excel to properly recognize UTF-8 encoding
  const BOM = '\uFEFF';

  // Generate header row
  const headers = PORTFOLIO_COLUMNS.map((col) => escapeCsvField(col.header)).join(',');

  // Generate data rows
  const rows = assets.map((asset) => {
    return PORTFOLIO_COLUMNS.map((col) => escapeCsvField(col.getValue(asset))).join(',');
  });

  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');

  // Add BOM at the beginning
  return BOM + csvContent;
}

/**
 * Download CSV file in the browser
 * @param csv - CSV content (with BOM)
 * @param filename - Desired filename (default: 'portfolio.csv')
 */
export function downloadCSV(csv: string, filename: string = 'portfolio.csv'): void {
  // Create blob with proper MIME type
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up URL object
  URL.revokeObjectURL(url);
}

/**
 * Generate and download portfolio CSV in one step
 * @param assets - Array of portfolio assets
 * @param filename - Desired filename (default: 'portfolio-{date}.csv')
 */
export function exportPortfolioCSV(
  assets: PortfolioAsset[],
  filename?: string
): void {
  const csv = generatePortfolioCSV(assets);

  // Generate filename with current date if not provided
  const finalFilename =
    filename || `portfolio-${new Date().toISOString().split('T')[0]}.csv`;

  downloadCSV(csv, finalFilename);
}

/**
 * Generate CSV for custom data with custom columns
 * @param data - Array of data objects
 * @param columns - Column definitions
 * @returns CSV string with BOM
 */
export function generateCustomCSV<T>(
  data: T[],
  columns: Array<{ header: string; getValue: (item: T) => string | number }>
): string {
  const BOM = '\uFEFF';

  // Generate header row
  const headers = columns.map((col) => escapeCsvField(col.header)).join(',');

  // Generate data rows
  const rows = data.map((item) => {
    return columns.map((col) => escapeCsvField(col.getValue(item))).join(',');
  });

  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');

  return BOM + csvContent;
}

/**
 * Parse CSV string to array of objects (simple parser for basic CSVs)
 * @param csv - CSV content
 * @param hasHeader - Whether the first row is a header (default: true)
 * @returns Array of objects with string values
 *
 * Note: This is a simple parser and doesn't handle all CSV edge cases.
 * For complex CSV parsing, consider using a library like Papa Parse.
 */
export function parseCSV(
  csv: string,
  hasHeader: boolean = true
): Array<Record<string, string>> {
  // Remove BOM if present
  const content = csv.replace(/^\uFEFF/, '');

  // Split into lines
  const lines = content.split('\n').filter((line) => line.trim());

  if (lines.length === 0) {
    return [];
  }

  // Parse header
  const headers = hasHeader ? parseCSVLine(lines[0]) : null;
  const dataStart = hasHeader ? 1 : 0;

  // Parse data rows
  const data: Array<Record<string, string>> = [];

  for (let i = dataStart; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (headers) {
      // Create object with headers as keys
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    } else {
      // Create object with numeric keys
      const row: Record<string, string> = {};
      values.forEach((value, index) => {
        row[String(index)] = value;
      });
      data.push(row);
    }
  }

  return data;
}

/**
 * Parse a single CSV line (handles quoted fields)
 * @param line - CSV line
 * @returns Array of field values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}
