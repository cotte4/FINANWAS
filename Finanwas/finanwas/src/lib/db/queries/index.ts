/**
 * Database Query Helpers for Finanwas
 *
 * This module exports all database query functions organized by domain.
 * All functions are type-safe and include proper error handling.
 *
 * @module db/queries
 */

// Auth queries
export {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserLastLogin,
  validateInvitationCode,
  markCodeAsUsed,
} from './auth'

// Profile queries
export {
  getProfileByUserId,
  createProfile,
  updateProfile,
  markQuestionnaireComplete,
} from './profiles'

// Progress queries
export {
  getUserProgress,
  getLessonProgress,
  markLessonComplete,
  getCourseProgress,
  type CourseProgressSummary,
} from './progress'

// Tips queries
export {
  recordTipView,
  getUserTipViews,
  getSavedTips,
  toggleTipSaved,
} from './tips'

// Portfolio queries
export {
  getUserAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  updateAssetPrice,
  bulkUpdatePrices,
  getPortfolioSummary,
  type PortfolioSummary,
  type PriceUpdate,
} from './portfolio'

// Goals queries
export {
  getUserGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalContributions,
  addContribution,
  calculateGoalProgress,
  type GoalProgress,
} from './goals'

// Notes queries
export {
  getUserNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  getNotesByTag,
  getNotesByTicker,
  type NoteFilters,
} from './notes'

// Admin queries
export {
  getAllUsers,
  getUserStats,
  getAllInvitationCodes,
  generateInvitationCode,
  type UserStats,
} from './admin'
