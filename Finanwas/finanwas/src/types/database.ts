/**
 * Database type definitions for Supabase
 * This file will be populated with table schemas as they are created
 */

// User table interface
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'user' | 'admin';
  created_at: string;
  last_login: string | null;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  two_factor_backup_codes: string[] | null;
}

// InvitationCode table interface
export interface InvitationCode {
  id: string;
  code: string;
  created_at: string;
  used_at: string | null;
  used_by: string | null;
}

// UserProfile table interface
export interface UserProfile {
  id: string;
  user_id: string;
  country: string | null;
  knowledge_level: string | null;
  main_goal: string | null;
  risk_tolerance: string | null;
  has_debt: boolean | null;
  has_emergency_fund: boolean | null;
  has_investments: boolean | null;
  income_range: string | null;
  expense_range: string | null;
  investment_horizon: string | null;
  questionnaire_completed: boolean;
  questionnaire_completed_at: string | null;
  preferred_currency: string;
  updated_at: string;
}

// LessonProgress table interface
export interface LessonProgress {
  id: string;
  user_id: string;
  course_slug: string;
  lesson_slug: string;
  completed: boolean;
  completed_at: string | null;
  started_at: string | null;
  time_spent_seconds: number;
  last_accessed_at: string | null;
  view_count: number;
  progress_percentage: number;
}

// TipView table interface
export interface TipView {
  id: string;
  user_id: string;
  tip_id: string;
  viewed_at: string;
  saved: boolean;
}

// PortfolioAsset table interface
export interface PortfolioAsset {
  id: string;
  user_id: string;
  type: string;
  ticker: string | null;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  currency: string;
  current_price: number | null;
  current_price_updated_at: string | null;
  price_source: string;
  notes: string | null;
  dividend_yield: number | null;
  dividend_frequency: string | null;
  next_dividend_date: string | null;
  last_dividend_amount: number | null;
  created_at: string;
  updated_at: string;
}

// DividendPayment table interface
export interface DividendPayment {
  id: string;
  asset_id: string;
  user_id: string;
  payment_date: string;
  amount_per_share: number;
  total_amount: number;
  currency: string;
  payment_type: 'cash' | 'stock' | 'drip';
  shares_received: number | null;
  reinvested: boolean;
  withholding_tax: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// PortfolioPerformanceSnapshot table interface
export interface PortfolioPerformanceSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_value: number;
  total_cost: number;
  total_gain_loss: number;
  gain_loss_percentage: number;
  currency: string;
  asset_breakdown: Record<string, { count: number; value: number; cost: number }> | null;
  created_at: string;
}

// SavingsGoal table interface
export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// SavingsContribution table interface
export interface SavingsContribution {
  id: string;
  goal_id: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
}

// Note table interface
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  linked_ticker: string | null;
  created_at: string;
  updated_at: string;
}

// ErrorLog table interface
export interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'critical';
  source: 'client' | 'server' | 'api';
  message: string;
  stack_trace: string | null;
  error_code: string | null;
  user_id: string | null;
  url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  metadata: Record<string, any>;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'last_login' | 'two_factor_enabled' | 'two_factor_secret' | 'two_factor_backup_codes'> & {
          id?: string;
          created_at?: string;
          last_login?: string | null;
          two_factor_enabled?: boolean;
          two_factor_secret?: string | null;
          two_factor_backup_codes?: string[] | null;
        };
        Update: Partial<Omit<User, 'id'>>;
      };
      invitation_codes: {
        Row: InvitationCode;
        Insert: Omit<InvitationCode, 'id' | 'created_at' | 'used_at' | 'used_by'> & {
          id?: string;
          created_at?: string;
          used_at?: string | null;
          used_by?: string | null;
        };
        Update: Partial<Omit<InvitationCode, 'id'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'questionnaire_completed' | 'preferred_currency' | 'updated_at'> & {
          id?: string;
          questionnaire_completed?: boolean;
          preferred_currency?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserProfile, 'id'>>;
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Omit<LessonProgress, 'id' | 'completed' | 'completed_at' | 'started_at' | 'time_spent_seconds' | 'last_accessed_at' | 'view_count' | 'progress_percentage'> & {
          id?: string;
          completed?: boolean;
          completed_at?: string | null;
          started_at?: string | null;
          time_spent_seconds?: number;
          last_accessed_at?: string | null;
          view_count?: number;
          progress_percentage?: number;
        };
        Update: Partial<Omit<LessonProgress, 'id'>>;
      };
      tip_views: {
        Row: TipView;
        Insert: Omit<TipView, 'id' | 'viewed_at' | 'saved'> & {
          id?: string;
          viewed_at?: string;
          saved?: boolean;
        };
        Update: Partial<Omit<TipView, 'id'>>;
      };
      portfolio_assets: {
        Row: PortfolioAsset;
        Insert: Omit<PortfolioAsset, 'id' | 'current_price' | 'current_price_updated_at' | 'price_source' | 'dividend_yield' | 'dividend_frequency' | 'next_dividend_date' | 'last_dividend_amount' | 'created_at' | 'updated_at'> & {
          id?: string;
          current_price?: number | null;
          current_price_updated_at?: string | null;
          price_source?: string;
          dividend_yield?: number | null;
          dividend_frequency?: string | null;
          next_dividend_date?: string | null;
          last_dividend_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<PortfolioAsset, 'id'>>;
      };
      savings_goals: {
        Row: SavingsGoal;
        Insert: Omit<SavingsGoal, 'id' | 'current_amount' | 'created_at' | 'updated_at' | 'completed_at'> & {
          id?: string;
          current_amount?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Omit<SavingsGoal, 'id'>>;
      };
      savings_contributions: {
        Row: SavingsContribution;
        Insert: Omit<SavingsContribution, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<SavingsContribution, 'id'>>;
      };
      notes: {
        Row: Note;
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Note, 'id'>>;
      };
      error_logs: {
        Row: ErrorLog;
        Insert: Omit<ErrorLog, 'id' | 'resolved' | 'resolved_at' | 'resolved_by' | 'created_at'> & {
          id?: string;
          resolved?: boolean;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<ErrorLog, 'id'>>;
      };
      dividend_payments: {
        Row: DividendPayment;
        Insert: Omit<DividendPayment, 'id' | 'payment_type' | 'reinvested' | 'withholding_tax' | 'created_at' | 'updated_at'> & {
          id?: string;
          payment_type?: 'cash' | 'stock' | 'drip';
          reinvested?: boolean;
          withholding_tax?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DividendPayment, 'id'>>;
      };
      portfolio_performance_snapshots: {
        Row: PortfolioPerformanceSnapshot;
        Insert: Omit<PortfolioPerformanceSnapshot, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<PortfolioPerformanceSnapshot, 'id'>>;
      };
      // Additional tables will be added as they are created in subsequent user stories
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
