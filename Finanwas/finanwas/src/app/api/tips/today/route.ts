import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserTipViews, recordTipView } from '@/lib/db/queries/tips';
import { getProfileByUserId } from '@/lib/db/queries/profiles';

// Static tips database with personalization tags
const TIPS = [
  {
    id: 'tip-001',
    title: 'Diversifica tu portafolio',
    content: 'No pongas todos tus huevos en la misma canasta. Diversificar entre diferentes tipos de activos reduce el riesgo de pérdidas significativas.',
    category: 'inversiones',
    difficulty: 'beginner' as const,
    tags: ['diversificación', 'riesgo', 'portafolio'],
  },
  {
    id: 'tip-002',
    title: 'Crea un fondo de emergencia',
    content: 'Ahorra entre 3 y 6 meses de gastos en una cuenta de fácil acceso. Esto te protegerá ante imprevistos sin necesidad de vender inversiones.',
    category: 'ahorro',
    difficulty: 'beginner' as const,
    tags: ['ahorro', 'emergencia', 'liquidez'],
  },
  {
    id: 'tip-003',
    title: 'Aprovecha el interés compuesto',
    content: 'El interés compuesto es tu mejor aliado. Reinvierte tus ganancias para que generen más ganancias con el tiempo.',
    category: 'inversiones',
    difficulty: 'intermediate' as const,
    tags: ['interés compuesto', 'rendimiento', 'largo plazo'],
  },
  {
    id: 'tip-004',
    title: 'Revisa tus gastos mensuales',
    content: 'Analiza tus gastos cada mes para identificar áreas donde puedes ahorrar. Pequeños cambios pueden generar grandes ahorros.',
    category: 'presupuesto',
    difficulty: 'beginner' as const,
    tags: ['presupuesto', 'ahorro', 'gastos'],
  },
  {
    id: 'tip-005',
    title: 'Invierte a largo plazo',
    content: 'Las inversiones a largo plazo suelen ser menos volátiles y ofrecen mejores rendimientos. Evita vender en momentos de pánico.',
    category: 'inversiones',
    difficulty: 'intermediate' as const,
    tags: ['largo plazo', 'estrategia', 'paciencia'],
  },
  {
    id: 'tip-006',
    title: 'Conoce tu perfil de riesgo',
    content: 'Antes de invertir, identifica cuánto riesgo estás dispuesto a asumir. Esto te ayudará a elegir inversiones adecuadas.',
    category: 'inversiones',
    difficulty: 'beginner' as const,
    tags: ['riesgo', 'perfil', 'estrategia'],
  },
  {
    id: 'tip-007',
    title: 'Automatiza tus ahorros',
    content: 'Configura transferencias automáticas a tu cuenta de ahorro. Ahorrar se vuelve más fácil cuando no tienes que pensarlo.',
    category: 'ahorro',
    difficulty: 'beginner' as const,
    tags: ['ahorro', 'automatización', 'disciplina'],
  },
  {
    id: 'tip-008',
    title: 'Edúcate constantemente',
    content: 'El mundo financiero cambia constantemente. Dedica tiempo a aprender sobre nuevas estrategias y oportunidades de inversión.',
    category: 'educación',
    difficulty: 'beginner' as const,
    tags: ['educación', 'aprendizaje', 'actualización'],
  },
];

/**
 * GET /api/tips/today
 * Returns the daily tip personalized for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get and verify auth token
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get user profile for personalization
    const profile = await getProfileByUserId(payload.userId);

    // Get user's tip views to avoid repetition
    const tipViews = await getUserTipViews(payload.userId);
    const viewedTipIds = new Set(tipViews.map(tv => tv.tip_id));

    // Filter tips based on user profile
    let relevantTips = TIPS;

    // Personalize by knowledge level
    if (profile?.knowledge_level) {
      const knowledgeMap: Record<string, string> = {
        'Principiante': 'beginner',
        'Intermedio': 'intermediate',
        'Avanzado': 'advanced',
      };
      const difficulty = knowledgeMap[profile.knowledge_level];
      if (difficulty) {
        relevantTips = relevantTips.filter(tip =>
          tip.difficulty === difficulty || tip.difficulty === 'beginner'
        );
      }
    }

    // Prioritize unviewed tips
    const unviewedTips = relevantTips.filter(tip => !viewedTipIds.has(tip.id));
    const tipsToChooseFrom = unviewedTips.length > 0 ? unviewedTips : relevantTips;

    // Select tip based on day of year for consistency
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const tipIndex = dayOfYear % tipsToChooseFrom.length;
    const selectedTip = tipsToChooseFrom[tipIndex];

    // Record that user viewed this tip
    const tipView = await recordTipView(payload.userId, selectedTip.id);

    return NextResponse.json({
      tip: {
        id: selectedTip.id,
        title: selectedTip.title,
        content: selectedTip.content,
        category: selectedTip.category,
        difficulty: selectedTip.difficulty,
        tags: selectedTip.tags,
        created_at: now.toISOString(),
      },
      viewed: true,
      saved: tipView.saved,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/tips/today:', error);
    return NextResponse.json(
      { error: 'Error al obtener el tip del día' },
      { status: 500 }
    );
  }
}
