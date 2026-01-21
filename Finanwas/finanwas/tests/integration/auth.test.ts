import { describe, it, expect } from 'vitest';
import { mockUsers, mockInvitationCodes, mockFormData } from '../utils/mock-data';

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/validate-code', () => {
    it('should validate a valid invitation code', async () => {
      const response = await fetch('/api/auth/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: mockInvitationCodes.validCode.code }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.valid).toBe(true);
      expect(data.message).toBe('Código válido');
    });

    it('should reject an invalid invitation code', async () => {
      const response = await fetch('/api/auth/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'INVALID' }),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(data.error).toBe('Código de invitación inválido');
    });

    it('should reject an already used invitation code', async () => {
      const response = await fetch('/api/auth/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: mockInvitationCodes.usedCode.code }),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(data.error).toBe('Código de invitación inválido');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user with valid data', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: mockInvitationCodes.validCode.code,
          name: 'New User',
          email: 'newuser@example.com',
          password: 'SecurePass123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('newuser@example.com');
      expect(data.user.name).toBe('New User');
      expect(data.user.role).toBe('user');
    });

    it('should reject registration with missing fields', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: mockInvitationCodes.validCode.code,
          name: 'Test User',
          email: '',
          password: 'Pass123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Todos los campos son requeridos');
    });

    it('should reject registration with weak password', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: mockInvitationCodes.validCode.code,
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('should reject registration with invalid invitation code', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'INVALID',
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Código de invitación inválido');
    });

    it('should reject registration with existing email', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: mockInvitationCodes.validCode.code,
          name: 'Test User',
          email: mockUsers.user1.email,
          password: 'SecurePass123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Este email ya tiene una cuenta');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockFormData.validLogin),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(mockUsers.user1.email);
    });

    it('should reject login with incorrect password', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockFormData.validLogin.email,
          password: 'WrongPassword123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Email o contraseña incorrectos');
    });

    it('should reject login with incorrect email', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: mockFormData.validLogin.password,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Email o contraseña incorrectos');
    });

    it('should reject login with missing fields', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email y contraseña son requeridos');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout', async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data when authenticated', async () => {
      const response = await fetch('/api/auth/me', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(mockUsers.user1.id);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await fetch('/api/auth/me');

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No autorizado');
    });
  });
});
