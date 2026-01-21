/**
 * String manipulation and formatting utilities
 */

/**
 * Converts a string to a URL-friendly slug
 * @param text - Text to slugify
 * @returns Slugified string (lowercase, hyphens, no special chars)
 * @example
 * slugify('Hello World!') // 'hello-world'
 * slugify('Inversión en Acciones') // 'inversion-en-acciones'
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose combined characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Capitalizes the first letter of a string
 * @param text - Text to capitalize
 * @returns String with first letter capitalized
 * @example
 * capitalize('hello world') // 'Hello world'
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Capitalizes the first letter of each word in a string
 * @param text - Text to title case
 * @returns String with each word capitalized
 * @example
 * titleCase('hello world') // 'Hello World'
 */
export function titleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Truncates a string to a maximum length and adds ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 100)
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated string
 * @example
 * truncate('This is a very long text', 10) // 'This is a...'
 * truncate('Short', 10) // 'Short'
 */
export function truncate(text: string, maxLength: number = 100, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Truncates text to the nearest word boundary
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 100)
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated string at word boundary
 * @example
 * truncateWords('This is a very long sentence', 10) // 'This is a...'
 */
export function truncateWords(
  text: string,
  maxLength: number = 100,
  suffix: string = '...'
): string {
  if (!text || text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace).trim() + suffix;
  }

  return truncated.trim() + suffix;
}

/**
 * Converts a string to camelCase
 * @param text - Text to convert
 * @returns camelCase string
 * @example
 * toCamelCase('hello world') // 'helloWorld'
 * toCamelCase('user_profile_name') // 'userProfileName'
 */
export function toCamelCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

/**
 * Converts a string to snake_case
 * @param text - Text to convert
 * @returns snake_case string
 * @example
 * toSnakeCase('helloWorld') // 'hello_world'
 * toSnakeCase('UserProfileName') // 'user_profile_name'
 */
export function toSnakeCase(text: string): string {
  return text
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/\s+/g, '_');
}

/**
 * Extracts initials from a name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials in uppercase
 * @example
 * getInitials('Juan Pérez') // 'JP'
 * getInitials('María José García López', 3) // 'MJG'
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  if (!name) return '';

  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  return initials;
}

/**
 * Removes extra whitespace from a string
 * @param text - Text to clean
 * @returns Text with single spaces and trimmed
 * @example
 * removeExtraSpaces('  hello    world  ') // 'hello world'
 */
export function removeExtraSpaces(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Checks if a string contains only numbers
 * @param text - Text to check
 * @returns True if string contains only digits
 * @example
 * isNumeric('12345') // true
 * isNumeric('123.45') // false
 * isNumeric('abc') // false
 */
export function isNumeric(text: string): boolean {
  return /^\d+$/.test(text);
}

/**
 * Escapes HTML special characters
 * @param text - Text to escape
 * @returns Escaped HTML string
 * @example
 * escapeHtml('<div>Hello</div>') // '&lt;div&gt;Hello&lt;/div&gt;'
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };

  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Generates a random string of specified length
 * @param length - Length of random string (default: 10)
 * @param charset - Character set to use (default: alphanumeric)
 * @returns Random string
 * @example
 * generateRandomString(8) // 'a7bC9xY2'
 */
export function generateRandomString(
  length: number = 10,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Pluralizes a word based on count
 * @param singular - Singular form
 * @param plural - Plural form
 * @param count - Count to determine plurality
 * @returns Singular or plural form based on count
 * @example
 * pluralize('día', 'días', 1) // 'día'
 * pluralize('día', 'días', 5) // 'días'
 */
export function pluralize(singular: string, plural: string, count: number): string {
  return count === 1 ? singular : plural;
}
