import { createClient } from '../supabase';
import { findUserById } from './auth';
import { getProfileByUserId } from './profiles';
import { getUserAssets } from './portfolio';
import { getUserGoals } from './goals';
import { getUserProgress } from './progress';
import { getUserTipViews } from './tips';
import { getUserNotes } from './notes';

/**
 * Complete user data export for GDPR compliance
 */
export interface UserDataExport {
  exportDate: string;
  exportVersion: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    lastLogin: string | null;
  };
  profile: {
    country: string | null;
    knowledgeLevel: string;
    mainGoal: string;
    riskTolerance: string;
    hasDe bt: boolean | null;
    hasEmergencyFund: boolean | null;
    hasInvestments: boolean | null;
    incomeRange: string | null;
    expenseRange: string | null;
    investmentHorizon: string;
    questionnaireCompleted: boolean;
    questionnaireCompletedAt: string | null;
    updatedAt: string;
  } | null;
  portfolio: {
    assets: Array<{
      id: string;
      type: string;
      ticker: string | null;
      name: string;
      quantity: number;
      purchasePrice: number;
      purchaseDate: string;
      currency: string;
      currentPrice: number | null;
      currentPriceUpdatedAt: string | null;
      priceSource: string;
      notes: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  savingsGoals: {
    goals: Array<{
      id: string;
      name: string;
      targetAmount: number;
      currentAmount: number;
      currency: string;
      targetDate: string | null;
      createdAt: string;
      updatedAt: string;
      completedAt: string | null;
      contributions: Array<{
        id: string;
        amount: number;
        date: string;
        notes: string | null;
        createdAt: string;
      }>;
    }>;
  };
  learningProgress: {
    lessons: Array<{
      courseSlug: string;
      lessonSlug: string;
      completed: boolean;
      completedAt: string | null;
    }>;
  };
  tips: {
    viewed: Array<{
      tipId: string;
      viewedAt: string;
      saved: boolean;
    }>;
  };
  notes: {
    userNotes: Array<{
      id: string;
      title: string;
      content: string;
      tags: string[];
      linkedTicker: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  invitationCodes: {
    codes: Array<{
      code: string;
      createdAt: string;
      usedAt: string;
    }>;
  };
}

/**
 * Export all user data for GDPR compliance
 * @param userId - User ID to export data for
 * @returns Complete user data export
 * @throws Error if user not found or export fails
 */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  try {
    const supabase = createClient();

    // 1. Get user data
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // 2. Get profile data
    const profile = await getProfileByUserId(userId);

    // 3. Get portfolio assets
    const assets = await getUserAssets(userId);

    // 4. Get savings goals with contributions
    const goals = await getUserGoals(userId);

    // Get contributions for each goal
    const goalsWithContributions = await Promise.all(
      goals.map(async (goal) => {
        const { data: contributions } = await supabase
          .from('savings_contributions')
          .select('*')
          .eq('goal_id', goal.id)
          .order('date', { ascending: false });

        return {
          ...goal,
          contributions: contributions || [],
        };
      })
    );

    // 5. Get learning progress
    const learningProgress = await getUserProgress(userId);

    // 6. Get tip views
    const tipViews = await getUserTipViews(userId);

    // 7. Get user notes
    const notes = await getUserNotes(userId);

    // 8. Get invitation codes created by this user (if any)
    const { data: invitationCodes } = await supabase
      .from('invitation_codes')
      .select('code, created_at, used_at')
      .eq('used_by', userId);

    // Build the complete export
    const exportData: UserDataExport = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0.0',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
      profile: profile
        ? {
            country: profile.country,
            knowledgeLevel: profile.knowledge_level,
            mainGoal: profile.main_goal,
            riskTolerance: profile.risk_tolerance,
            hasDebt: profile.has_debt,
            hasEmergencyFund: profile.has_emergency_fund,
            hasInvestments: profile.has_investments,
            incomeRange: profile.income_range,
            expenseRange: profile.expense_range,
            investmentHorizon: profile.investment_horizon,
            questionnaireCompleted: profile.questionnaire_completed,
            questionnaireCompletedAt: profile.questionnaire_completed_at,
            updatedAt: profile.updated_at,
          }
        : null,
      portfolio: {
        assets: assets.map((asset) => ({
          id: asset.id,
          type: asset.type,
          ticker: asset.ticker,
          name: asset.name,
          quantity: parseFloat(asset.quantity),
          purchasePrice: parseFloat(asset.purchase_price),
          purchaseDate: asset.purchase_date,
          currency: asset.currency,
          currentPrice: asset.current_price ? parseFloat(asset.current_price) : null,
          currentPriceUpdatedAt: asset.current_price_updated_at,
          priceSource: asset.price_source,
          notes: asset.notes,
          createdAt: asset.created_at,
          updatedAt: asset.updated_at,
        })),
      },
      savingsGoals: {
        goals: goalsWithContributions.map((goal) => ({
          id: goal.id,
          name: goal.name,
          targetAmount: parseFloat(goal.target_amount),
          currentAmount: parseFloat(goal.current_amount),
          currency: goal.currency,
          targetDate: goal.target_date,
          createdAt: goal.created_at,
          updatedAt: goal.updated_at,
          completedAt: goal.completed_at,
          contributions: goal.contributions.map((contrib: any) => ({
            id: contrib.id,
            amount: parseFloat(contrib.amount),
            date: contrib.date,
            notes: contrib.notes,
            createdAt: contrib.created_at,
          })),
        })),
      },
      learningProgress: {
        lessons: learningProgress.map((progress) => ({
          courseSlug: progress.course_slug,
          lessonSlug: progress.lesson_slug,
          completed: progress.completed,
          completedAt: progress.completed_at,
        })),
      },
      tips: {
        viewed: tipViews.map((tipView) => ({
          tipId: tipView.tip_id,
          viewedAt: tipView.viewed_at,
          saved: tipView.saved,
        })),
      },
      notes: {
        userNotes: notes.map((note) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          tags: note.tags,
          linkedTicker: note.linked_ticker,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
        })),
      },
      invitationCodes: {
        codes: (invitationCodes || []).map((code) => ({
          code: code.code,
          createdAt: code.created_at,
          usedAt: code.used_at,
        })),
      },
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw new Error(
      `Error al exportar datos del usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}

/**
 * Export user data as JSON file download
 * @param userId - User ID to export data for
 * @returns JSON string for download
 */
export async function exportUserDataAsJSON(userId: string): Promise<string> {
  const data = await exportUserData(userId);
  return JSON.stringify(data, null, 2);
}
