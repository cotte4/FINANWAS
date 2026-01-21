# Database Query Helpers

Esta carpeta contiene funciones de consulta tipadas y reutilizables para todas las tablas de la base de datos de Finanwas.

## Propósito

En lugar de escribir consultas directas de Supabase en toda la aplicación, estas funciones helper proporcionan:

- **Type safety**: Todas las funciones usan tipos definidos en `@/types/database.ts`
- **Consistencia**: Misma forma de hacer operaciones similares en toda la app
- **Manejo de errores**: Mensajes de error en español y manejo adecuado de casos edge
- **Seguridad**: Verificación automática de permisos de usuario
- **Documentación**: JSDoc completo con ejemplos de uso

## Estructura

```
queries/
├── auth.ts         # Autenticación y códigos de invitación
├── profiles.ts     # Perfiles de usuario
├── progress.ts     # Progreso de lecciones
├── tips.ts         # Tips vistos y guardados
├── portfolio.ts    # Activos del portafolio
├── goals.ts        # Metas de ahorro
├── notes.ts        # Notas del usuario
├── admin.ts        # Funciones administrativas
└── index.ts        # Exporta todas las queries
```

## Uso

### Importar queries

```typescript
// Importar queries específicas
import { findUserByEmail, createUser } from '@/lib/db/queries'

// O importar por categoría
import * as authQueries from '@/lib/db/queries/auth'
import * as portfolioQueries from '@/lib/db/queries/portfolio'
```

### Ejemplos por categoría

#### Auth (`auth.ts`)

```typescript
// Buscar usuario por email
const user = await findUserByEmail('usuario@ejemplo.com')

// Crear nuevo usuario
const newUser = await createUser({
  email: 'nuevo@ejemplo.com',
  password_hash: 'hash_seguro',
  name: 'Juan Pérez',
  role: 'user'
})

// Validar código de invitación
const code = await validateInvitationCode('ABC123')
if (code && !code.used_at) {
  await markCodeAsUsed('ABC123', userId)
}
```

#### Profiles (`profiles.ts`)

```typescript
// Obtener perfil
const profile = await getProfileByUserId(userId)

// Crear perfil
const newProfile = await createProfile(userId, {
  country: 'Argentina',
  knowledge_level: 'beginner',
  main_goal: 'save'
})

// Marcar cuestionario como completado
await markQuestionnaireComplete(userId)
```

#### Progress (`progress.ts`)

```typescript
// Marcar lección como completada
await markLessonComplete(userId, 'fundamentos', 'que-es-la-inversion')

// Obtener progreso de un curso
const courseProgress = await getCourseProgress(userId, 'fundamentos')
console.log(`Progreso: ${courseProgress.percentageComplete}%`)
```

#### Portfolio (`portfolio.ts`)

```typescript
// Obtener todos los activos
const assets = await getUserAssets(userId)

// Crear nuevo activo
const asset = await createAsset(userId, {
  type: 'stock',
  ticker: 'AAPL',
  name: 'Apple Inc.',
  quantity: 10,
  purchase_price: 150,
  purchase_date: '2024-01-15',
  currency: 'USD'
})

// Actualizar precio
await updateAssetPrice(assetId, 175.50, 'api')

// Obtener resumen del portafolio
const summary = await getPortfolioSummary(userId)
console.log(`Valor total: $${summary.totalCurrentValue}`)
console.log(`Ganancia: ${summary.percentageGainLoss}%`)
```

#### Goals (`goals.ts`)

```typescript
// Crear meta de ahorro
const goal = await createGoal(userId, {
  name: 'Fondo de emergencia',
  target_amount: 10000,
  currency: 'USD',
  target_date: '2024-12-31'
})

// Agregar contribución
await addContribution(goalId, {
  amount: 500,
  date: '2024-01-15',
  notes: 'Ahorro mensual'
})

// Calcular progreso
const progress = await calculateGoalProgress(goalId)
console.log(`Progreso: ${progress.percentageComplete}%`)
console.log(`Falta: $${progress.remainingAmount}`)
```

#### Notes (`notes.ts`)

```typescript
// Crear nota
const note = await createNote(userId, {
  title: 'Análisis de Apple',
  content: 'Observaciones sobre el último reporte...',
  tags: ['análisis', 'tech'],
  linked_ticker: 'AAPL'
})

// Buscar notas
const results = await searchNotes(userId, 'dividendos')

// Filtrar por tag
const investmentNotes = await getNotesByTag(userId, 'inversiones')

// Filtrar por ticker
const appleNotes = await getNotesByTicker(userId, 'AAPL')
```

#### Admin (`admin.ts`)

```typescript
// Obtener estadísticas
const stats = await getUserStats()
console.log(`Usuarios activos: ${stats.activeUsers}`)
console.log(`Nuevos este mes: ${stats.newUsersThisMonth}`)

// Generar código de invitación
const code = await generateInvitationCode()
console.log(`Nuevo código: ${code.code}`)
```

## Manejo de errores

Todas las funciones lanzan errores descriptivos en español:

```typescript
try {
  const user = await findUserByEmail('test@ejemplo.com')
  if (!user) {
    // Usuario no encontrado (null)
  }
} catch (error) {
  // Error de base de datos
  console.error(error.message) // Mensaje en español
}
```

## Seguridad

Las funciones incluyen verificaciones de pertenencia:

```typescript
// ✅ Solo obtiene activos del usuario autenticado
const assets = await getUserAssets(userId)

// ✅ Verifica que el activo pertenezca al usuario antes de editar
await updateAsset(assetId, userId, { quantity: 15 })

// ❌ Fallará si el activo no pertenece al usuario
await updateAsset(assetId, otherUserId, { quantity: 15 })
// Error: "Activo no encontrado o no tienes permiso para editarlo"
```

## Tipos

Todas las funciones usan tipos importados de `@/types/database.ts`:

- `User`, `InvitationCode`
- `UserProfile`
- `LessonProgress`
- `TipView`
- `PortfolioAsset`
- `SavingsGoal`, `SavingsContribution`
- `Note`

También se exportan tipos auxiliares:

- `CourseProgressSummary`
- `PortfolioSummary`, `PriceUpdate`
- `GoalProgress`
- `NoteFilters`
- `UserStats`

## Mejores prácticas

1. **Siempre usar estas queries** en lugar de consultas directas de Supabase
2. **Manejar errores apropiadamente** con try/catch
3. **Verificar null** cuando las funciones pueden retornar null
4. **Usar los tipos exportados** para mantener type safety
5. **Aprovechar las funciones calculadas** como `getPortfolioSummary` y `calculateGoalProgress`

## Agregar nuevas queries

Cuando agregues nuevas tablas o operaciones:

1. Crea funciones en el archivo correspondiente (o crea uno nuevo)
2. Agrega JSDoc con ejemplos
3. Usa tipos de `@/types/database.ts`
4. Incluye manejo de errores en español
5. Verifica permisos de usuario cuando corresponda
6. Exporta desde `index.ts`
