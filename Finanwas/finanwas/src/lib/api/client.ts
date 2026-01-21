/**
 * Finanwas API Client
 * Typed API client for all backend endpoints with error handling and interceptors
 */

import { toast } from 'sonner';
import { ApiError } from './types';
import type {
  // Auth types
  ValidateCodeRequest,
  ValidateCodeResponse,
  RegisterData,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  CurrentUserResponse,
  // Profile types
  ProfileResponse,
  UpdateProfileData,
  UpdateProfileResponse,
  // Progress types
  LessonProgressResponse,
  MarkLessonCompleteRequest,
  MarkLessonCompleteResponse,
  // Tips types
  TipOfTheDayResponse,
  // Market types
  StockDataResponse,
  DollarRateResponse,
  // Portfolio types
  PortfolioAssetsResponse,
  CreateAssetData,
  CreateAssetResponse,
  UpdateAssetData,
  UpdateAssetResponse,
  DeleteAssetResponse,
  RefreshPricesResponse,
  ExportPortfolioCsvResponse,
  // Goals types
  GoalsResponse,
  CreateGoalData,
  CreateGoalResponse,
  UpdateGoalData,
  UpdateGoalResponse,
  DeleteGoalResponse,
  ContributionData,
  AddContributionResponse,
  // Notes types
  NotesParams,
  NotesResponse,
  CreateNoteData,
  CreateNoteResponse,
  UpdateNoteData,
  UpdateNoteResponse,
  DeleteNoteResponse,
  // Error types
  ErrorResponse,
} from './types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Spanish error messages
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  VALIDATION_ERROR: 'Error de validación. Por favor, verifica los datos ingresados.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta nuevamente más tarde.',
  TIMEOUT: 'La solicitud tardó demasiado tiempo. Por favor, intenta nuevamente.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
  INVALID_CODE: 'Código de invitación inválido.',
  EMAIL_EXISTS: 'El correo electrónico ya está registrado.',
  INVALID_CREDENTIALS: 'Credenciales inválidas.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
};

// ============================================================================
// HTTP Client
// ============================================================================

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipErrorToast?: boolean;
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get error message in Spanish
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
      return error.message;
    }

    if (typeof error === 'string') {
      return ERROR_MESSAGES[error] || error;
    }

    if (error && typeof error === 'object' && 'error' in error) {
      const errorObj = error as ErrorResponse;
      return ERROR_MESSAGES[errorObj.error] || errorObj.error;
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  /**
   * Handle HTTP errors
   */
  private async handleError(response: Response): Promise<never> {
    let errorData: ErrorResponse;

    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }

    // Map HTTP status codes to Spanish messages
    let message = this.getErrorMessage(errorData);

    if (!message) {
      switch (response.status) {
        case 401:
          message = ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case 403:
          message = ERROR_MESSAGES.FORBIDDEN;
          break;
        case 404:
          message = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 422:
          message = ERROR_MESSAGES.VALIDATION_ERROR;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          message = ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          message = ERROR_MESSAGES.UNKNOWN_ERROR;
      }
    }

    throw new ApiError(message, response.status, errorData.code);
  }

  /**
   * Make HTTP request with interceptors
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth, skipErrorToast, ...fetchOptions } = options;

    // Build headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Request interceptor - add auth token if not skipped
    if (!skipAuth) {
      // Auth token will be automatically sent via httpOnly cookie
      // No need to manually add it to headers
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include', // Important for cookies
      });

      // Check for errors
      if (!response.ok) {
        await this.handleError(response);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      // Parse JSON response
      const data = await response.json();

      return data as T;
    } catch (error) {
      // Show toast notification unless skipped
      if (!skipErrorToast) {
        const message = this.getErrorMessage(error);
        toast.error(message);
      }

      // Re-throw the error for component-level handling
      throw error;
    }
  }

  /**
   * HTTP Methods
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Create singleton instance
const http = new HttpClient(API_BASE_URL);

// ============================================================================
// Auth API
// ============================================================================

/**
 * Validate invitation code
 */
export async function validateInvitationCode(
  code: string
): Promise<ValidateCodeResponse> {
  const data: ValidateCodeRequest = { code };
  return http.post<ValidateCodeResponse>('/api/auth/validate-code', data, {
    skipAuth: true,
  });
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<RegisterResponse> {
  return http.post<RegisterResponse>('/api/auth/register', data, {
    skipAuth: true,
  });
}

/**
 * Login user
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data: LoginRequest = { email, password };
  return http.post<LoginResponse>('/api/auth/login', data, {
    skipAuth: true,
  });
}

/**
 * Logout user
 */
export async function logout(): Promise<LogoutResponse> {
  return http.post<LogoutResponse>('/api/auth/logout');
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return http.get<CurrentUserResponse>('/api/auth/me');
}

// ============================================================================
// Profile API
// ============================================================================

/**
 * Get user profile
 */
export async function getProfile(): Promise<ProfileResponse> {
  return http.get<ProfileResponse>('/api/profile');
}

/**
 * Update user profile
 */
export async function updateProfile(
  data: Partial<UpdateProfileData>
): Promise<UpdateProfileResponse> {
  return http.patch<UpdateProfileResponse>('/api/profile', data);
}

// ============================================================================
// Progress API
// ============================================================================

/**
 * Get lesson progress for current user
 */
export async function getLessonProgress(): Promise<LessonProgressResponse> {
  return http.get<LessonProgressResponse>('/api/progress/lessons');
}

/**
 * Mark a lesson as complete
 */
export async function markLessonComplete(
  courseSlug: string,
  lessonSlug: string
): Promise<MarkLessonCompleteResponse> {
  const data: MarkLessonCompleteRequest = { courseSlug, lessonSlug };
  return http.post<MarkLessonCompleteResponse>(
    '/api/progress/lessons/complete',
    data
  );
}

// ============================================================================
// Tips API
// ============================================================================

/**
 * Get tip of the day
 */
export async function getTipOfTheDay(): Promise<TipOfTheDayResponse> {
  return http.get<TipOfTheDayResponse>('/api/tips/today');
}

// ============================================================================
// Market Data API
// ============================================================================

/**
 * Get stock data by ticker
 */
export async function getStockData(
  ticker: string
): Promise<StockDataResponse> {
  return http.get<StockDataResponse>(`/api/market/stocks/${ticker}`);
}

/**
 * Get current dollar exchange rates
 */
export async function getDollarRate(): Promise<DollarRateResponse> {
  return http.get<DollarRateResponse>('/api/market/dollar');
}

// ============================================================================
// Portfolio API
// ============================================================================

/**
 * Get all portfolio assets
 */
export async function getPortfolioAssets(): Promise<PortfolioAssetsResponse> {
  return http.get<PortfolioAssetsResponse>('/api/portfolio/assets');
}

/**
 * Create a new portfolio asset
 */
export async function createAsset(
  data: CreateAssetData
): Promise<CreateAssetResponse> {
  return http.post<CreateAssetResponse>('/api/portfolio/assets', data);
}

/**
 * Update a portfolio asset
 */
export async function updateAsset(
  id: string,
  data: UpdateAssetData
): Promise<UpdateAssetResponse> {
  return http.patch<UpdateAssetResponse>(`/api/portfolio/assets/${id}`, data);
}

/**
 * Delete a portfolio asset
 */
export async function deleteAsset(id: string): Promise<DeleteAssetResponse> {
  return http.delete<DeleteAssetResponse>(`/api/portfolio/assets/${id}`);
}

/**
 * Refresh all asset prices
 */
export async function refreshPrices(): Promise<RefreshPricesResponse> {
  return http.post<RefreshPricesResponse>('/api/portfolio/refresh-prices');
}

/**
 * Export portfolio to CSV
 */
export async function exportPortfolioCsv(): Promise<ExportPortfolioCsvResponse> {
  return http.get<ExportPortfolioCsvResponse>('/api/portfolio/export/csv');
}

// ============================================================================
// Goals API
// ============================================================================

/**
 * Get all savings goals
 */
export async function getGoals(): Promise<GoalsResponse> {
  return http.get<GoalsResponse>('/api/goals');
}

/**
 * Create a new savings goal
 */
export async function createGoal(
  data: CreateGoalData
): Promise<CreateGoalResponse> {
  return http.post<CreateGoalResponse>('/api/goals', data);
}

/**
 * Update a savings goal
 */
export async function updateGoal(
  id: string,
  data: UpdateGoalData
): Promise<UpdateGoalResponse> {
  return http.patch<UpdateGoalResponse>(`/api/goals/${id}`, data);
}

/**
 * Delete a savings goal
 */
export async function deleteGoal(id: string): Promise<DeleteGoalResponse> {
  return http.delete<DeleteGoalResponse>(`/api/goals/${id}`);
}

/**
 * Add contribution to a savings goal
 */
export async function addContribution(
  goalId: string,
  data: ContributionData
): Promise<AddContributionResponse> {
  return http.post<AddContributionResponse>(
    `/api/goals/${goalId}/contributions`,
    data
  );
}

// ============================================================================
// Notes API
// ============================================================================

/**
 * Get notes with optional filters
 */
export async function getNotes(
  params?: NotesParams
): Promise<NotesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.tag) queryParams.append('tag', params.tag);
  if (params?.ticker) queryParams.append('ticker', params.ticker);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/notes?${queryString}` : '/api/notes';

  return http.get<NotesResponse>(endpoint);
}

/**
 * Create a new note
 */
export async function createNote(
  data: CreateNoteData
): Promise<CreateNoteResponse> {
  return http.post<CreateNoteResponse>('/api/notes', data);
}

/**
 * Update a note
 */
export async function updateNote(
  id: string,
  data: UpdateNoteData
): Promise<UpdateNoteResponse> {
  return http.patch<UpdateNoteResponse>(`/api/notes/${id}`, data);
}

/**
 * Delete a note
 */
export async function deleteNote(id: string): Promise<DeleteNoteResponse> {
  return http.delete<DeleteNoteResponse>(`/api/notes/${id}`);
}

// ============================================================================
// Exports
// ============================================================================

export { ApiError };

// Export all functions as a namespace for convenience
export const api = {
  // Auth
  auth: {
    validateInvitationCode,
    register,
    login,
    logout,
    getCurrentUser,
  },
  // Profile
  profile: {
    getProfile,
    updateProfile,
  },
  // Progress
  progress: {
    getLessonProgress,
    markLessonComplete,
  },
  // Tips
  tips: {
    getTipOfTheDay,
  },
  // Market
  market: {
    getStockData,
    getDollarRate,
  },
  // Portfolio
  portfolio: {
    getPortfolioAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    refreshPrices,
    exportPortfolioCsv,
  },
  // Goals
  goals: {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
  },
  // Notes
  notes: {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
  },
};
