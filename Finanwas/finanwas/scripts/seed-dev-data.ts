/**
 * Development seed data script
 * Creates test data for development environment
 *
 * Usage:
 *   npx tsx scripts/seed-dev-data.ts
 *
 * Requirements:
 *   - Supabase project configured
 *   - Environment variables set (.env.local)
 *   - Database migrations run
 */

import { createClient } from '../src/lib/db/supabase';
import { hashPassword } from '../src/lib/auth/password';

/**
 * Seed configuration
 */
const SEED_CONFIG = {
  invitationCodes: [
    'FINANWAS',
    'TESTCODE1',
    'TESTCODE2',
    'ADMIN2024',
    'WELCOME',
  ],
  users: [
    {
      email: 'admin@finanwas.com',
      password: 'Admin123!',
      name: 'Admin User',
      role: 'admin' as const,
      hasProfile: true,
      hasPortfolio: true,
      hasSavings: true,
      hasNotes: true,
      hasLessons: true,
    },
    {
      email: 'user@example.com',
      password: 'User123!',
      name: 'Regular User',
      role: 'user' as const,
      hasProfile: true,
      hasPortfolio: true,
      hasSavings: true,
      hasNotes: false,
      hasLessons: true,
    },
    {
      email: 'newuser@example.com',
      password: 'NewUser123!',
      name: 'New User',
      role: 'user' as const,
      hasProfile: false,
      hasPortfolio: false,
      hasSavings: false,
      hasNotes: false,
      hasLessons: false,
    },
  ],
};

/**
 * Main seed function
 */
async function seed() {
  const supabase = createClient();

  console.log('🌱 Starting seed process...\n');

  try {
    // 1. Create invitation codes
    console.log('📨 Creating invitation codes...');
    await seedInvitationCodes(supabase);
    console.log('✅ Invitation codes created\n');

    // 2. Create users and their data
    console.log('👥 Creating test users...');
    await seedUsers(supabase);
    console.log('✅ Users created\n');

    console.log('🎉 Seed process completed successfully!\n');
    console.log('📝 Test credentials:');
    console.log('   Admin: admin@finanwas.com / Admin123!');
    console.log('   User: user@example.com / User123!');
    console.log('   New User: newuser@example.com / NewUser123!\n');
  } catch (error) {
    console.error('❌ Error during seed process:', error);
    process.exit(1);
  }
}

/**
 * Seed invitation codes
 */
async function seedInvitationCodes(supabase: any) {
  for (const code of SEED_CONFIG.invitationCodes) {
    // Check if code already exists
    const { data: existing } = await supabase
      .from('invitation_codes')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (existing) {
      console.log(`  ⏭️  Code "${code}" already exists, skipping`);
      continue;
    }

    // Create code
    const { error } = await supabase
      .from('invitation_codes')
      .insert({ code });

    if (error) {
      console.error(`  ❌ Error creating code "${code}":`, error);
    } else {
      console.log(`  ✅ Created code: ${code}`);
    }
  }
}

/**
 * Seed users and their associated data
 */
async function seedUsers(supabase: any) {
  for (const userData of SEED_CONFIG.users) {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .maybeSingle();

    if (existingUser) {
      console.log(`  ⏭️  User "${userData.email}" already exists, skipping`);
      continue;
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        password_hash: passwordHash,
        name: userData.name,
        role: userData.role,
      })
      .select()
      .single();

    if (userError) {
      console.error(`  ❌ Error creating user "${userData.email}":`, userError);
      continue;
    }

    console.log(`  ✅ Created user: ${userData.email}`);

    // Create user profile if needed
    if (userData.hasProfile) {
      await seedUserProfile(supabase, user.id);
    }

    // Create portfolio assets if needed
    if (userData.hasPortfolio) {
      await seedPortfolioAssets(supabase, user.id);
    }

    // Create savings goals if needed
    if (userData.hasSavings) {
      await seedSavingsGoals(supabase, user.id);
    }

    // Create notes if needed
    if (userData.hasNotes) {
      await seedNotes(supabase, user.id);
    }

    // Create lesson progress if needed
    if (userData.hasLessons) {
      await seedLessonProgress(supabase, user.id);
    }
  }
}

/**
 * Seed user profile with completed questionnaire
 */
async function seedUserProfile(supabase: any, userId: string) {
  const { error } = await supabase.from('user_profiles').insert({
    user_id: userId,
    country: 'AR',
    knowledge_level: 'Intermedio',
    main_goal: 'Invertir',
    risk_tolerance: 'Moderado',
    has_debt: false,
    has_emergency_fund: true,
    has_investments: true,
    income_range: '400000-600000',
    expense_range: '200000-400000',
    investment_horizon: 'Mediano plazo',
    questionnaire_completed: true,
    questionnaire_completed_at: new Date().toISOString(),
  });

  if (error) {
    console.log(`    ⚠️  Error creating profile: ${error.message}`);
  } else {
    console.log(`    ✅ Created user profile`);
  }
}

/**
 * Seed portfolio assets
 */
async function seedPortfolioAssets(supabase: any, userId: string) {
  const assets = [
    {
      user_id: userId,
      type: 'Acción',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      quantity: 10,
      purchase_price: 150.0,
      purchase_date: '2024-01-15',
      currency: 'USD',
      current_price: 175.0,
      price_source: 'manual',
    },
    {
      user_id: userId,
      type: 'ETF',
      ticker: 'SPY',
      name: 'SPDR S&P 500 ETF',
      quantity: 5,
      purchase_price: 400.0,
      purchase_date: '2024-02-01',
      currency: 'USD',
      current_price: 420.0,
      price_source: 'manual',
    },
    {
      user_id: userId,
      type: 'Crypto',
      ticker: 'BTC',
      name: 'Bitcoin',
      quantity: 0.1,
      purchase_price: 45000.0,
      purchase_date: '2024-03-10',
      currency: 'USD',
      current_price: 50000.0,
      price_source: 'manual',
    },
    {
      user_id: userId,
      type: 'Cedear',
      ticker: 'GGAL',
      name: 'Grupo Financiero Galicia',
      quantity: 100,
      purchase_price: 450.0,
      purchase_date: '2024-04-05',
      currency: 'ARS',
      current_price: 520.0,
      price_source: 'manual',
    },
  ];

  const { error } = await supabase.from('portfolio_assets').insert(assets);

  if (error) {
    console.log(`    ⚠️  Error creating portfolio: ${error.message}`);
  } else {
    console.log(`    ✅ Created ${assets.length} portfolio assets`);
  }
}

/**
 * Seed savings goals
 */
async function seedSavingsGoals(supabase: any, userId: string) {
  const goals = [
    {
      user_id: userId,
      name: 'Fondo de emergencia',
      target_amount: 500000,
      current_amount: 350000,
      currency: 'ARS',
      target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    },
    {
      user_id: userId,
      name: 'Viaje a Europa',
      target_amount: 2000000,
      current_amount: 800000,
      currency: 'ARS',
      target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    },
    {
      user_id: userId,
      name: 'Comprar auto',
      target_amount: 5000000,
      current_amount: 1200000,
      currency: 'ARS',
      target_date: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 years from now
    },
  ];

  const { error } = await supabase.from('savings_goals').insert(goals);

  if (error) {
    console.log(`    ⚠️  Error creating savings goals: ${error.message}`);
  } else {
    console.log(`    ✅ Created ${goals.length} savings goals`);
  }
}

/**
 * Seed notes
 */
async function seedNotes(supabase: any, userId: string) {
  const notes = [
    {
      user_id: userId,
      title: 'Análisis de Apple',
      content: 'Apple sigue siendo una empresa sólida con buenos fundamentales. El iPhone continúa siendo su producto estrella.',
      tags: ['inversiones', 'tech', 'largo-plazo'],
      linked_ticker: 'AAPL',
    },
    {
      user_id: userId,
      title: 'Estrategia para 2024',
      content: 'Objetivos: diversificar portfolio, aumentar exposición a ETFs, reducir concentración en tech.',
      tags: ['estrategia', 'planificacion'],
      linked_ticker: null,
    },
  ];

  const { error } = await supabase.from('notes').insert(notes);

  if (error) {
    console.log(`    ⚠️  Error creating notes: ${error.message}`);
  } else {
    console.log(`    ✅ Created ${notes.length} notes`);
  }
}

/**
 * Seed lesson progress
 */
async function seedLessonProgress(supabase: any, userId: string) {
  const progress = [
    {
      user_id: userId,
      course_slug: 'introduccion-finanzas',
      lesson_slug: 'que-son-las-finanzas',
      completed: true,
      completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    },
    {
      user_id: userId,
      course_slug: 'introduccion-finanzas',
      lesson_slug: 'presupuesto-personal',
      completed: true,
      completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      user_id: userId,
      course_slug: 'invertir-en-bolsa',
      lesson_slug: 'que-son-las-acciones',
      completed: true,
      completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
  ];

  const { error } = await supabase.from('lesson_progress').insert(progress);

  if (error) {
    console.log(`    ⚠️  Error creating lesson progress: ${error.message}`);
  } else {
    console.log(`    ✅ Created ${progress.length} lesson completions`);
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('✨ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });
