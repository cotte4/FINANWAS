/**
 * Mock data for testing
 */

export const mockUsers = {
  user1: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
  },
  admin: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
  },
};

export const mockInvitationCodes = {
  validCode: {
    id: '123e4567-e89b-12d3-a456-426614174010',
    code: 'VALID123',
    used_at: null,
    used_by: null,
    created_at: new Date().toISOString(),
  },
  usedCode: {
    id: '123e4567-e89b-12d3-a456-426614174011',
    code: 'USED456',
    used_at: new Date().toISOString(),
    used_by: mockUsers.user1.id,
    created_at: new Date().toISOString(),
  },
};

export const mockUserProfile = {
  user_id: mockUsers.user1.id,
  age: 30,
  occupation: 'Software Developer',
  income_level: 'Alto',
  financial_goal: 'Jubilación',
  knowledge_level: 'Intermedio',
  preferred_currency: 'ARS',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockAssets = [
  {
    id: '123e4567-e89b-12d3-a456-426614174020',
    user_id: mockUsers.user1.id,
    type: 'Acción',
    name: 'Apple Inc.',
    ticker: 'AAPL',
    quantity: 10,
    purchase_price: 150,
    current_price: 175,
    purchase_date: '2024-01-01',
    notes: 'Tech investment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174021',
    user_id: mockUsers.user1.id,
    type: 'ETF',
    name: 'S&P 500 ETF',
    ticker: 'SPY',
    quantity: 5,
    purchase_price: 400,
    current_price: 420,
    purchase_date: '2024-01-15',
    notes: 'Diversification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockGoals = [
  {
    id: '123e4567-e89b-12d3-a456-426614174030',
    user_id: mockUsers.user1.id,
    name: 'Casa propia',
    target_amount: 100000,
    current_amount: 25000,
    target_date: '2030-12-31',
    description: 'Ahorrar para primera casa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174031',
    user_id: mockUsers.user1.id,
    name: 'Viaje a Europa',
    target_amount: 5000,
    current_amount: 3500,
    target_date: '2025-06-30',
    description: 'Vacaciones en Europa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockTransactions = [
  {
    id: '123e4567-e89b-12d3-a456-426614174040',
    user_id: mockUsers.user1.id,
    type: 'Compra',
    amount: 1500,
    date: '2024-01-01',
    description: 'Compra de AAPL',
    category: 'Inversión',
    created_at: new Date().toISOString(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174041',
    user_id: mockUsers.user1.id,
    type: 'Venta',
    amount: 2000,
    date: '2024-02-01',
    description: 'Venta de acciones',
    category: 'Inversión',
    created_at: new Date().toISOString(),
  },
];

export const mockFormData = {
  validRegistration: {
    code: 'VALID123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123',
  },
  invalidRegistration: {
    code: 'INVALID',
    name: '',
    email: 'invalid-email',
    password: 'weak',
  },
  validLogin: {
    email: 'test@example.com',
    password: 'SecurePass123',
  },
  invalidLogin: {
    email: 'wrong@example.com',
    password: 'WrongPass123',
  },
};

export const mockApiResponses = {
  success: {
    success: true,
    message: 'Operación exitosa',
  },
  error: {
    error: 'Ha ocurrido un error',
  },
  validationError: {
    error: 'Datos inválidos',
  },
  authError: {
    error: 'No autorizado',
  },
};
