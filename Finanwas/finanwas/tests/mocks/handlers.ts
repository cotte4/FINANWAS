import { http, HttpResponse } from 'msw';
import { mockUsers, mockInvitationCodes, mockFormData } from '../utils/mock-data';

/**
 * MSW handlers for mocking API endpoints
 */
export const handlers = [
  // POST /api/auth/validate-code
  http.post('/api/auth/validate-code', async ({ request }) => {
    const body = await request.json() as { code: string };

    if (body.code === mockInvitationCodes.validCode.code) {
      return HttpResponse.json({
        valid: true,
        message: 'Código válido',
      });
    }

    if (body.code === mockInvitationCodes.usedCode.code) {
      return HttpResponse.json(
        { error: 'Código de invitación inválido' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { error: 'Código de invitación inválido' },
      { status: 400 }
    );
  }),

  // POST /api/auth/register
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as {
      code: string;
      name: string;
      email: string;
      password: string;
    };

    // Validate required fields
    if (!body.code || !body.name || !body.email || !body.password) {
      return HttpResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validate password length
    if (body.password.length < 8) {
      return HttpResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Validate invitation code
    if (body.code !== mockInvitationCodes.validCode.code) {
      return HttpResponse.json(
        { error: 'Código de invitación inválido' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (body.email === mockUsers.user1.email) {
      return HttpResponse.json(
        { error: 'Este email ya tiene una cuenta' },
        { status: 400 }
      );
    }

    // Success
    return HttpResponse.json(
      {
        success: true,
        user: {
          id: 'new-user-id',
          email: body.email,
          name: body.name,
          role: 'user',
        },
      },
      { status: 201 }
    );
  }),

  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    // Validate required fields
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Valid credentials
    if (
      body.email === mockFormData.validLogin.email &&
      body.password === mockFormData.validLogin.password
    ) {
      return HttpResponse.json({
        success: true,
        user: mockUsers.user1,
      });
    }

    // Invalid credentials
    return HttpResponse.json(
      { error: 'Email o contraseña incorrectos' },
      { status: 401 }
    );
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // GET /api/auth/me
  http.get('/api/auth/me', ({ request }) => {
    const cookie = request.headers.get('cookie');

    // If no auth cookie, return 401
    if (!cookie || !cookie.includes('auth-token')) {
      return HttpResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Return authenticated user
    return HttpResponse.json({
      user: mockUsers.user1,
    });
  }),

  // GET /api/portfolio
  http.get('/api/portfolio', () => {
    return HttpResponse.json({
      assets: [],
    });
  }),

  // POST /api/portfolio
  http.post('/api/portfolio', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      asset: { id: 'new-asset-id', ...body },
    }, { status: 201 });
  }),

  // GET /api/savings
  http.get('/api/savings', () => {
    return HttpResponse.json({
      goals: [],
    });
  }),

  // GET /api/profile
  http.get('/api/profile', () => {
    return HttpResponse.json({
      profile: null,
    });
  }),

  // PUT /api/profile
  http.put('/api/profile', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      profile: body,
    });
  }),
];
