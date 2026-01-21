# Two-Factor Authentication (2FA)

## Overview

Finanwas implements TOTP-based (Time-based One-Time Password) two-factor authentication to provide an additional layer of security for user accounts. This implementation follows industry best practices and is compatible with all major authenticator apps.

## Features

- **TOTP-based authentication** using industry-standard authenticator apps
- **QR code generation** for easy setup with mobile devices
- **Backup codes** for account recovery (8 codes per user)
- **Password-protected disable** to prevent unauthorized 2FA removal
- **Secure storage** with encrypted TOTP secrets and hashed backup codes
- **User-friendly UI** integrated into the profile page
- **Complete login flow** with 2FA verification step

## Architecture

### Database Schema

The 2FA implementation uses the existing `users` table with three additional columns:

```sql
-- users table columns for 2FA
two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL
two_factor_secret VARCHAR(32) NULL              -- Base32 encoded TOTP secret
two_factor_backup_codes TEXT[] NULL             -- Array of bcrypt-hashed backup codes
```

**Migration:** `src/lib/db/migrations/013_two_factor_authentication.sql`

### Core Components

#### 1. TOTP Utilities (`src/lib/auth/two-factor.ts`)

Core 2FA functionality built on the `otplib` library:

- `generateTwoFactorSecret()` - Creates new TOTP secret
- `generateQRCode(email, secret)` - Generates QR code data URL
- `verifyTwoFactorToken(token, secret)` - Validates TOTP codes
- `generateBackupCodes(count)` - Creates recovery codes
- `hashBackupCodes(codes)` - Hashes codes for storage
- `verifyBackupCode(code, hashedCodes)` - Validates recovery codes
- `removeBackupCode(hashedCodes, index)` - Removes used backup code

#### 2. API Endpoints

**Setup endpoint** (`POST /api/auth/2fa/setup`)
- Generates new TOTP secret and QR code
- Requires authentication
- Does NOT enable 2FA yet (requires verification first)
- Returns: `{ secret, qrCode }`

**Enable endpoint** (`POST /api/auth/2fa/enable`)
- Verifies TOTP code to confirm setup
- Generates 8 backup codes
- Enables 2FA in database
- Returns: `{ success, backupCodes }` (codes shown only once!)

**Disable endpoint** (`POST /api/auth/2fa/disable`)
- Requires password verification for security
- Removes all 2FA data from database
- Returns: `{ success }`

**Verify endpoint** (`POST /api/auth/2fa/verify`)
- Used during login to verify 2FA codes
- Supports both TOTP codes and backup codes
- Removes used backup codes
- Completes authentication (sets JWT cookie)
- Returns: `{ success, user, remainingBackupCodes }`

**User details endpoint** (`GET /api/user/me`)
- Returns current user info including 2FA status
- Excludes sensitive fields (password, secret, backup codes)
- Used by profile page to display 2FA status

#### 3. UI Components

**TwoFactorSettings** (`src/components/auth/TwoFactorSettings.tsx`)
- Complete 2FA management UI for profile page
- Three-stage process:
  1. **Initial state** - Enable/Disable button
  2. **Setup flow** - QR code display and TOTP verification
  3. **Backup codes** - One-time display of recovery codes
- Responsive design with mobile support
- Integrated with profile page security section

**Verify 2FA Page** (`src/app/(auth)/login/verify-2fa/page.tsx`)
- Login flow verification page
- Tab interface for TOTP vs backup codes
- Validates userId from URL params
- Auto-redirect to dashboard on success
- Warning messages for low backup code counts

#### 4. Login Flow Integration

The login API (`src/app/api/auth/login/route.ts`) checks for 2FA:

```typescript
// If 2FA enabled, return requires2FA flag instead of logging in
if (user.two_factor_enabled && user.two_factor_secret) {
  return NextResponse.json({
    success: true,
    requires2FA: true,
    userId: user.id,
    email: user.email,
    name: user.name,
  });
}
```

The login page redirects to verification:

```typescript
if (data.requires2FA) {
  router.push(`/login/verify-2fa?userId=${data.userId}&name=${encodeURIComponent(data.name)}`);
}
```

## User Flow

### Enabling 2FA

1. User navigates to Profile page → Security & Privacy section
2. Clicks "Habilitar 2FA" button
3. System generates TOTP secret and QR code
4. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
5. User enters 6-digit verification code from app
6. System validates code and enables 2FA
7. **8 backup codes displayed** (ONLY SHOWN ONCE - user must save them!)
8. User clicks "Continuar" to complete setup

### Logging in with 2FA

1. User enters email and password on login page
2. System validates credentials
3. If 2FA enabled, redirect to `/login/verify-2fa` page
4. User enters 6-digit code from authenticator app OR backup code
5. System validates code
6. On success, user logged in and redirected to dashboard

### Using Backup Codes

1. On verify-2FA page, switch to "Código de Respaldo" tab
2. Enter one of the saved backup codes (format: XXXX-XXXX-XXXX)
3. System verifies and removes used code from database
4. Warning shown if fewer than 3 codes remain
5. User logged in successfully

### Disabling 2FA

1. User navigates to Profile page → Security & Privacy section
2. Enters current password (for security)
3. Clicks "Desactivar 2FA" button
4. System validates password and removes all 2FA data
5. 2FA disabled, user can login with password only

## Security Considerations

### Secure Storage

- **TOTP secrets** stored as base32-encoded strings (required by TOTP spec)
- **Backup codes** hashed with bcrypt before storage (same as passwords)
- **User passwords** required to disable 2FA (prevents unauthorized removal)

### Rate Limiting

The existing rate limiting system applies to all 2FA endpoints:
- Login attempts: 5 per minute
- Registration: 3 per minute
- Generic API: 30 per minute

### Password Protection

Disabling 2FA requires password verification to prevent attackers from removing 2FA if they gain temporary account access.

### Backup Code Usage

- Each backup code can only be used once
- Used codes are immediately removed from database
- Users warned when running low on backup codes (< 3 remaining)
- No limit on when codes can be used (useful for account recovery)

### Session Management

- 2FA verification completes the login flow (sets JWT cookie)
- Same session management as regular login
- JWT tokens have standard expiration (configurable)

## Dependencies

Required npm packages (already installed):

```json
{
  "otplib": "^13.1.1",        // TOTP generation and verification
  "qrcode": "^1.5.4",         // QR code generation
  "@types/qrcode": "^1.5.6"   // TypeScript types
}
```

## Testing

### Manual Testing Checklist

- [ ] Enable 2FA from profile page
- [ ] Scan QR code with authenticator app
- [ ] Verify 6-digit code works
- [ ] Backup codes displayed and can be copied
- [ ] Login with password requires 2FA code
- [ ] TOTP code from authenticator app works at login
- [ ] Backup code works at login
- [ ] Used backup codes are removed
- [ ] Warning shown when backup codes run low
- [ ] Disable 2FA requires password
- [ ] After disable, can login without 2FA
- [ ] Cannot enable 2FA twice without disabling first

### Test User Accounts

Use the dev seed script to create test accounts:

```bash
npm run seed
```

Test accounts include users with and without 2FA enabled.

## Future Enhancements

Potential improvements for future iterations:

1. **Backup code regeneration** - Allow users to generate new backup codes
2. **SMS 2FA** - Alternative to TOTP for users without smartphones
3. **WebAuthn/FIDO2** - Hardware key support (YubiKey, etc.)
4. **Trusted devices** - Remember trusted devices for 30 days
5. **2FA enforcement** - Admin setting to require 2FA for all users
6. **Recovery email** - Alternative recovery method beyond backup codes
7. **Activity log** - Track 2FA enable/disable events for security audit

## Troubleshooting

### QR Code Not Scanning

- Ensure adequate screen brightness
- Try manual entry with the displayed secret key
- Check authenticator app has camera permissions

### Code Not Working

- Verify device time is synchronized (TOTP requires accurate time)
- Check for clock skew between device and server
- Try waiting for next 30-second window for new code

### Lost Backup Codes

- If user loses backup codes AND authenticator device, account recovery requires admin intervention
- Best practice: Encourage users to print and store backup codes securely
- Future: Implement recovery email or SMS as fallback

### Migration Issues

Run the migration to add 2FA columns:

```sql
-- Apply migration 013
psql -d finanwas < src/lib/db/migrations/013_two_factor_authentication.sql
```

## References

- [RFC 6238 - TOTP Specification](https://datatracker.ietf.org/doc/html/rfc6238)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [otplib Documentation](https://github.com/yeojz/otplib)
- [Google Authenticator](https://support.google.com/accounts/answer/1066447)

## Implementation Date

**Completed:** 2026-01-21

## Contributors

- Claude Sonnet 4.5 (Implementation)
- User (Requirements & Testing)
