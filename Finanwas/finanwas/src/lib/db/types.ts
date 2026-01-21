/**
 * Supabase Database Type Definitions
 * Generated from migrations 001-011
 *
 * This file provides complete TypeScript types for all database tables,
 * including Row, Insert, and Update types for type-safe database operations.
 */

export interface Database {
  public: {
    Tables: {
      /**
       * User accounts with authentication credentials
       * Migration: 001_create_users_table.sql
       */
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          role: 'user' | 'admin';
          created_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name: string;
          role?: 'user' | 'admin';
          created_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string;
          role?: 'user' | 'admin';
          created_at?: string;
          last_login?: string | null;
        };
      };

      /**
       * Invitation codes for user registration gating
       * Migration: 002_create_invitation_codes_table.sql
       */
      invitation_codes: {
        Row: {
          id: string;
          code: string;
          created_at: string | null;
          used_at: string | null;
          used_by: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          created_at?: string | null;
          used_at?: string | null;
          used_by?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          created_at?: string | null;
          used_at?: string | null;
          used_by?: string | null;
        };
      };

      /**
       * User financial profile data from questionnaire
       * Migration: 003_create_user_profiles_table.sql
       */
      user_profiles: {
        Row: {
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
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          country?: string | null;
          knowledge_level?: string | null;
          main_goal?: string | null;
          risk_tolerance?: string | null;
          has_debt?: boolean | null;
          has_emergency_fund?: boolean | null;
          has_investments?: boolean | null;
          income_range?: string | null;
          expense_range?: string | null;
          investment_horizon?: string | null;
          questionnaire_completed?: boolean;
          questionnaire_completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          country?: string | null;
          knowledge_level?: string | null;
          main_goal?: string | null;
          risk_tolerance?: string | null;
          has_debt?: boolean | null;
          has_emergency_fund?: boolean | null;
          has_investments?: boolean | null;
          income_range?: string | null;
          expense_range?: string | null;
          investment_horizon?: string | null;
          questionnaire_completed?: boolean;
          questionnaire_completed_at?: string | null;
          updated_at?: string;
        };
      };

      /**
       * User lesson completion tracking for educational content
       * Migration: 004_create_lesson_progress_table.sql
       */
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          course_slug: string;
          lesson_slug: string;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_slug: string;
          lesson_slug: string;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_slug?: string;
          lesson_slug?: string;
          completed?: boolean;
          completed_at?: string | null;
        };
      };

      /**
       * Tracks which tips users have viewed and saved
       * Migration: 005_create_tip_views_table.sql
       */
      tip_views: {
        Row: {
          id: string;
          user_id: string;
          tip_id: string;
          viewed_at: string;
          saved: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          tip_id: string;
          viewed_at?: string;
          saved?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          tip_id?: string;
          viewed_at?: string;
          saved?: boolean;
        };
      };

      /**
       * User portfolio assets (stocks, ETFs, bonds, crypto, etc.)
       * Migration: 006_create_portfolio_assets_table.sql
       */
      portfolio_assets: {
        Row: {
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
          price_source: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          ticker?: string | null;
          name: string;
          quantity: number;
          purchase_price: number;
          purchase_date: string;
          currency: string;
          current_price?: number | null;
          current_price_updated_at?: string | null;
          price_source?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          ticker?: string | null;
          name?: string;
          quantity?: number;
          purchase_price?: number;
          purchase_date?: string;
          currency?: string;
          current_price?: number | null;
          current_price_updated_at?: string | null;
          price_source?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      /**
       * User savings goals with target amounts and dates
       * Migration: 007_create_savings_goals_table.sql
       */
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number | null;
          currency: string;
          target_date: string | null;
          created_at: string | null;
          updated_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number | null;
          currency: string;
          target_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number | null;
          currency?: string;
          target_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          completed_at?: string | null;
        };
      };

      /**
       * Individual contributions made towards savings goals
       * Migration: 008_create_savings_contributions_table.sql
       */
      savings_contributions: {
        Row: {
          id: string;
          goal_id: string;
          amount: number;
          date: string;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          goal_id: string;
          amount: number;
          date: string;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          goal_id?: string;
          amount?: number;
          date?: string;
          notes?: string | null;
          created_at?: string | null;
        };
      };

      /**
       * User notes for financial research and personal tracking
       * Migration: 009_create_notes_table.sql
       */
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          tags: string[];
          linked_ticker: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          tags?: string[];
          linked_ticker?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          tags?: string[];
          linked_ticker?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      /**
       * Centralized error tracking and monitoring system
       * Migration: 011_error_tracking.sql
       */
      error_logs: {
        Row: {
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
          resolved: boolean | null;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          level: 'error' | 'warning' | 'critical';
          source: 'client' | 'server' | 'api';
          message: string;
          stack_trace?: string | null;
          error_code?: string | null;
          user_id?: string | null;
          url?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          metadata?: Record<string, any>;
          resolved?: boolean | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          level?: 'error' | 'warning' | 'critical';
          source?: 'client' | 'server' | 'api';
          message?: string;
          stack_trace?: string | null;
          error_code?: string | null;
          user_id?: string | null;
          url?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          metadata?: Record<string, any>;
          resolved?: boolean | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string | null;
        };
      };

      /**
       * Comprehensive audit trail of all user and system actions
       * Migration: 017_audit_log.sql
       */
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          category: 'authentication' | 'portfolio' | 'settings' | 'export' | 'admin' | 'goal' | 'data';
          resource_type: string | null;
          resource_id: string | null;
          metadata: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          status: 'success' | 'failure' | 'pending';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          category: 'authentication' | 'portfolio' | 'settings' | 'export' | 'admin' | 'goal' | 'data';
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          status?: 'success' | 'failure' | 'pending';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          category?: 'authentication' | 'portfolio' | 'settings' | 'export' | 'admin' | 'goal' | 'data';
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          status?: 'success' | 'failure' | 'pending';
          created_at?: string;
        };
      };
    };
  };
}

/**
 * Helper type to extract table names
 */
export type TableName = keyof Database['public']['Tables'];

/**
 * Helper type to extract Row type for a specific table
 */
export type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];

/**
 * Helper type to extract Insert type for a specific table
 */
export type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

/**
 * Helper type to extract Update type for a specific table
 */
export type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];
