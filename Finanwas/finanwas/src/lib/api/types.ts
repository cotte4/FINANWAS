/**
 * API Client Type Definitions
 * All request and response types for the Finanwas API
 */

import type {
  User,
  UserProfile,
  LessonProgress,
  PortfolioAsset,
  SavingsGoal,
  SavingsContribution,
  Note,
} from '@/types/database';

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Auth Types
// ============================================================================

export interface ValidateCodeRequest {
  code: string;
}

export interface ValidateCodeResponse {
  valid: boolean;
  message?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  invitationCode: string;
}

export interface RegisterResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface CurrentUserResponse {
  user: Omit<User, 'password_hash'>;
}

// ============================================================================
// Profile Types
// ============================================================================

export interface ProfileResponse {
  profile: UserProfile;
}

export interface UpdateProfileData {
  country?: string;
  knowledge_level?: string;
  main_goal?: string;
  risk_tolerance?: string;
  has_debt?: boolean;
  has_emergency_fund?: boolean;
  has_investments?: boolean;
  income_range?: string;
  expense_range?: string;
  investment_horizon?: string;
  questionnaire_completed?: boolean;
}

export interface UpdateProfileResponse {
  profile: UserProfile;
}

// ============================================================================
// Progress Types
// ============================================================================

export interface LessonProgressResponse {
  progress: LessonProgress[];
}

export interface MarkLessonCompleteRequest {
  courseSlug: string;
  lessonSlug: string;
}

export interface MarkLessonCompleteResponse {
  progress: LessonProgress;
}

// ============================================================================
// Tips Types
// ============================================================================

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  created_at: string;
}

export interface TipOfTheDayResponse {
  tip: Tip;
  viewed: boolean;
  saved: boolean;
}

export interface SaveTipRequest {
  tipId: string;
}

export interface SaveTipResponse {
  saved: boolean;
}

// ============================================================================
// Market Data Types
// ============================================================================

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  timestamp: string;
  source: string;
}

export interface StockDataResponse {
  quote: StockQuote;
}

export interface DollarRateResponse {
  official: number;
  blue: number;
  mep: number;
  ccl: number;
  timestamp: string;
  source: string;
}

// ============================================================================
// Portfolio Types
// ============================================================================

export interface PortfolioAssetsResponse {
  assets: PortfolioAsset[];
  summary: {
    totalValue: number;
    totalInvested: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    currency: string;
  };
}

export interface CreateAssetData {
  type: string;
  ticker?: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  currency: string;
  notes?: string;
}

export interface CreateAssetResponse {
  asset: PortfolioAsset;
}

export interface UpdateAssetData {
  type?: string;
  ticker?: string;
  name?: string;
  quantity?: number;
  purchase_price?: number;
  purchase_date?: string;
  currency?: string;
  notes?: string;
}

export interface UpdateAssetResponse {
  asset: PortfolioAsset;
}

export interface DeleteAssetResponse {
  message: string;
}

export interface RefreshPricesResponse {
  updated: number;
  failed: number;
  assets: PortfolioAsset[];
}

export interface ExportPortfolioCsvResponse {
  csv: string;
  filename: string;
}

// ============================================================================
// Goals Types
// ============================================================================

export interface GoalsResponse {
  goals: SavingsGoal[];
}

export interface CreateGoalData {
  name: string;
  target_amount: number;
  currency: string;
  target_date?: string;
}

export interface CreateGoalResponse {
  goal: SavingsGoal;
}

export interface UpdateGoalData {
  name?: string;
  target_amount?: number;
  currency?: string;
  target_date?: string;
  current_amount?: number;
}

export interface UpdateGoalResponse {
  goal: SavingsGoal;
}

export interface DeleteGoalResponse {
  message: string;
}

export interface ContributionData {
  amount: number;
  date: string;
  notes?: string;
}

export interface AddContributionResponse {
  contribution: SavingsContribution;
  goal: SavingsGoal;
}

// ============================================================================
// Notes Types
// ============================================================================

export interface NotesParams {
  tag?: string;
  ticker?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface NotesResponse {
  notes: Note[];
  total?: number;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tags?: string[];
  linked_ticker?: string;
}

export interface CreateNoteResponse {
  note: Note;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  linked_ticker?: string;
}

export interface UpdateNoteResponse {
  note: Note;
}

export interface DeleteNoteResponse {
  message: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}
