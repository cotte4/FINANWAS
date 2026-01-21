/**
 * Two-Factor Authentication (2FA) utilities
 * TOTP-based 2FA using authenticator apps (Google Authenticator, Authy, etc.)
 */

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { hashPassword, verifyPassword } from './password';

/**
 * Generate a new TOTP secret for 2FA
 * Returns a base32-encoded secret that can be stored in the database
 */
export function generateTwoFactorSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate a QR code data URL for the TOTP secret
 * This QR code can be scanned by authenticator apps
 *
 * @param email - User's email address
 * @param secret - TOTP secret (base32-encoded)
 * @returns Data URL for QR code image
 */
export async function generateQRCode(email: string, secret: string): Promise<string> {
  const appName = 'Finanwas';
  const otpauth = authenticator.keyuri(email, appName, secret);

  return await QRCode.toDataURL(otpauth);
}

/**
 * Verify a TOTP code against a secret
 *
 * @param token - 6-digit code from authenticator app
 * @param secret - TOTP secret (base32-encoded)
 * @returns true if code is valid
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('2FA verification error:', error);
    return false;
  }
}

/**
 * Generate backup codes for 2FA recovery
 * Returns an array of plain-text codes that should be shown to user once
 * These codes are hashed before being stored in the database
 *
 * @param count - Number of backup codes to generate (default: 8)
 * @returns Array of backup codes (format: XXXX-XXXX-XXXX)
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 12 random alphanumeric characters
    const code = Array.from({ length: 12 }, () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');

    // Format as XXXX-XXXX-XXXX
    const formatted = code.match(/.{1,4}/g)?.join('-') || code;
    codes.push(formatted);
  }

  return codes;
}

/**
 * Hash backup codes for secure storage
 *
 * @param codes - Array of plain-text backup codes
 * @returns Array of hashed backup codes
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(code => hashPassword(code)));
}

/**
 * Verify a backup code against stored hashed codes
 *
 * @param code - Plain-text backup code to verify
 * @param hashedCodes - Array of hashed backup codes from database
 * @returns Index of matched code, or -1 if no match
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<number> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await verifyPassword(code, hashedCodes[i]);
    if (isValid) {
      return i;
    }
  }
  return -1;
}

/**
 * Remove a used backup code from the array
 *
 * @param hashedCodes - Array of hashed backup codes
 * @param index - Index of the code to remove
 * @returns Updated array with the code removed
 */
export function removeBackupCode(hashedCodes: string[], index: number): string[] {
  return hashedCodes.filter((_, i) => i !== index);
}
