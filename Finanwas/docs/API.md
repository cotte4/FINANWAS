# Finanwas API Documentation

**Version:** 0.1.0
**Last Updated:** January 20, 2026
**Base URL:** `/api`

---

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Auth Endpoints](#auth-endpoints)
  - [User Profile Endpoints](#user-profile-endpoints)
  - [Educational Content Endpoints](#educational-content-endpoints)
  - [Portfolio Endpoints](#portfolio-endpoints)
  - [Goals Endpoints](#goals-endpoints)
  - [Notes Endpoints](#notes-endpoints)
  - [Admin Endpoints](#admin-endpoints)

---

## Authentication

Finanwas uses JWT-based authentication with httpOnly cookies.

### Authentication Flow

1. User registers via `/api/auth/register` with valid invitation code
2. Server creates user account and returns JWT token in httpOnly cookie
3. All subsequent requests automatically include the cookie
4. Token expires after 7 days
5. User can logout via `/api/auth/logout` which clears the cookie

### Cookie Details

- **Name:** `auth-token`
- **Type:** httpOnly (not accessible via JavaScript)
- **Duration:** 7 days
- **Secure:** Yes (in production)
- **SameSite:** Lax

### Protected Routes

All API endpoints except `/api/auth/validate-code`, `/api/auth/register`, and `/api/auth/login` require authentication.

**Unauthenticated Request Response:**
```json
{
  "error": "No autorizado",
  "message": "Debes iniciar sesión para acceder a este recurso"
}
```
**Status Code:** 401

---

## Error Handling

All errors follow a consistent format:

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Optional detailed information"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/POST/PUT |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting

**Status:** Planned (not yet implemented in MVP)

Future implementation will include:
- 5 requests/minute for auth endpoints
- 100 requests/minute for general endpoints
- 10 requests/minute for market data endpoints (to avoid external API limits)

---

## API Endpoints

### Auth Endpoints

#### POST /api/auth/validate-code

Validates an invitation code before registration.

**Request:**
```json
{
  "code": "ABCD1234"
}
```

**Success Response (200):**
```json
{
  "valid": true
}
```

**Error Response (400):**
```json
{
  "error": "Código de invitación inválido o ya utilizado"
}
```

**Example:**
```bash
curl -X POST https://finanwas.vercel.app/api/auth/validate-code \
  -H "Content-Type: application/json" \
  -d '{"code": "ABCD1234"}'
```

---

#### POST /api/auth/register

Registers a new user with a valid invitation code.

**Request:**
```json
{
  "code": "ABCD1234",
  "email": "usuario@example.com",
  "password": "securepassword123",
  "name": "Juan Pérez"
}
```

**Validation Rules:**
- `code`: Required, must be valid and unused
- `email`: Required, must be valid email format, must be unique
- `password`: Required, minimum 8 characters
- `name`: Required, non-empty string

**Success Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-v4",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "user"
  }
}
```

Sets `auth-token` cookie with JWT.

**Error Responses:**

*Invalid invitation code (400):*
```json
{
  "error": "Código de invitación inválido o ya utilizado"
}
```

*Email already exists (409):*
```json
{
  "error": "Este email ya tiene una cuenta"
}
```

*Password too short (400):*
```json
{
  "error": "La contraseña debe tener al menos 8 caracteres"
}
```

**Example:**
```bash
curl -X POST https://finanwas.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ABCD1234",
    "email": "juan@example.com",
    "password": "password123",
    "name": "Juan Pérez"
  }'
```

---

#### POST /api/auth/login

Authenticates an existing user.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-v4",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "user"
  }
}
```

Sets `auth-token` cookie with JWT.

**Error Response (401):**
```json
{
  "error": "Email o contraseña incorrectos"
}
```

**Example:**
```bash
curl -X POST https://finanwas.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

---

#### POST /api/auth/logout

Logs out the current user by clearing the auth cookie.

**Request:** No body required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

Clears `auth-token` cookie.

**Example:**
```bash
curl -X POST https://finanwas.vercel.app/api/auth/logout \
  --cookie "auth-token=YOUR_TOKEN"
```

---

#### GET /api/auth/me

Returns the currently authenticated user's information.

**Authentication:** Required

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid-v4",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "user",
    "created_at": "2026-01-20T10:30:00Z",
    "last_login": "2026-01-20T15:45:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "error": "No autorizado"
}
```

**Example:**
```bash
curl https://finanwas.vercel.app/api/auth/me \
  --cookie "auth-token=YOUR_TOKEN"
```

---

### User Profile Endpoints

#### GET /api/profile

Gets the user's profile including questionnaire data.

**Authentication:** Required

**Success Response (200):**
```json
{
  "profile": {
    "id": "uuid-v4",
    "user_id": "uuid-v4",
    "country": "AR",
    "knowledge_level": "beginner",
    "main_goal": "invest",
    "risk_tolerance": "moderate",
    "has_debt": false,
    "has_emergency_fund": true,
    "has_investments": false,
    "income_range": "range2",
    "expense_range": "range2",
    "investment_horizon": "medium",
    "questionnaire_completed": true,
    "questionnaire_completed_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

**Profile Not Found (404):**
```json
{
  "error": "Perfil no encontrado"
}
```

---

#### POST /api/profile

Creates or updates the user's profile.

**Authentication:** Required

**Request:**
```json
{
  "country": "AR",
  "knowledge_level": "beginner",
  "main_goal": "invest",
  "risk_tolerance": "moderate",
  "has_debt": false,
  "has_emergency_fund": true,
  "has_investments": false,
  "income_range": "range2",
  "expense_range": "range2",
  "investment_horizon": "medium"
}
```

**Field Options:**

- `country`: String (e.g., "AR", "MX", "US")
- `knowledge_level`: "beginner" | "intermediate" | "advanced"
- `main_goal`: "save" | "invest" | "debt_free" | "retirement" | "learn"
- `risk_tolerance`: "conservative" | "moderate" | "aggressive"
- `has_debt`: boolean
- `has_emergency_fund`: boolean
- `has_investments`: boolean
- `income_range`: "range1" | "range2" | "range3" | "range4" | "prefer_not_say"
- `expense_range`: "range1" | "range2" | "range3" | "range4" | "prefer_not_say"
- `investment_horizon`: "short" | "medium" | "long"

**Success Response (200):**
```json
{
  "success": true,
  "profile": {
    "id": "uuid-v4",
    "user_id": "uuid-v4",
    "country": "AR",
    "knowledge_level": "beginner",
    // ... all fields
    "questionnaire_completed": true,
    "questionnaire_completed_at": "2026-01-20T10:30:00Z"
  }
}
```

---

### Educational Content Endpoints

#### GET /api/courses

Lists all available courses.

**Authentication:** Required

**Success Response (200):**
```json
{
  "courses": [
    {
      "slug": "basics",
      "title": "Conceptos Básicos",
      "description": "Fundamentos de finanzas personales e inversión",
      "lessons_count": 4,
      "user_progress": {
        "completed_lessons": 2,
        "progress_percentage": 50
      }
    },
    {
      "slug": "renta-fija",
      "title": "Renta Fija",
      "description": "Bonos, plazos fijos y otros instrumentos de renta fija",
      "lessons_count": 4,
      "user_progress": {
        "completed_lessons": 0,
        "progress_percentage": 0
      }
    }
  ]
}
```

---

#### GET /api/courses/:slug

Gets details for a specific course including all lessons.

**Authentication:** Required

**URL Parameters:**
- `slug`: Course identifier (e.g., "basics", "renta-fija")

**Success Response (200):**
```json
{
  "course": {
    "slug": "basics",
    "title": "Conceptos Básicos",
    "description": "Fundamentos de finanzas personales e inversión",
    "lessons": [
      {
        "slug": "01-interes-compuesto",
        "title": "Interés Compuesto",
        "description": "Aprende cómo el interés compuesto hace crecer tu dinero",
        "duration_minutes": 5,
        "difficulty": "beginner",
        "order": 1,
        "completed": true,
        "completed_at": "2026-01-15T10:00:00Z"
      },
      {
        "slug": "02-inflacion",
        "title": "Inflación",
        "description": "Qué es la inflación y cómo afecta tus ahorros",
        "duration_minutes": 5,
        "difficulty": "beginner",
        "order": 2,
        "completed": false,
        "completed_at": null
      }
    ]
  }
}
```

**Course Not Found (404):**
```json
{
  "error": "Curso no encontrado"
}
```

---

#### GET /api/courses/:courseSlug/:lessonSlug

Gets the content of a specific lesson.

**Authentication:** Required

**URL Parameters:**
- `courseSlug`: Course identifier
- `lessonSlug`: Lesson identifier

**Success Response (200):**
```json
{
  "lesson": {
    "slug": "01-interes-compuesto",
    "title": "Interés Compuesto",
    "description": "Aprende cómo el interés compuesto hace crecer tu dinero",
    "content": "# Interés Compuesto\n\nEl interés compuesto es...",
    "metadata": {
      "duration_minutes": 5,
      "difficulty": "beginner",
      "order": 1,
      "prerequisites": [],
      "tags": ["basics", "investing"]
    },
    "progress": {
      "completed": true,
      "completed_at": "2026-01-15T10:00:00Z"
    }
  }
}
```

**Lesson Not Found (404):**
```json
{
  "error": "Lección no encontrada"
}
```

---

#### POST /api/progress/lesson

Marks a lesson as completed.

**Authentication:** Required

**Request:**
```json
{
  "course_slug": "basics",
  "lesson_slug": "01-interes-compuesto",
  "completed": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "progress": {
    "id": "uuid-v4",
    "user_id": "uuid-v4",
    "course_slug": "basics",
    "lesson_slug": "01-interes-compuesto",
    "completed": true,
    "completed_at": "2026-01-20T15:30:00Z"
  }
}
```

---

#### GET /api/tips/today

Gets the personalized tip for today.

**Authentication:** Required

**Success Response (200):**
```json
{
  "tip": {
    "id": "tip-001",
    "content": "El interés compuesto es la octava maravilla del mundo. Quien lo entiende, lo gana; quien no, lo paga.",
    "attribution": "Albert Einstein (atribuido)",
    "category": "basics",
    "related_lesson": "/aprender/basics/01-interes-compuesto",
    "viewed": false,
    "saved": false
  }
}
```

---

#### POST /api/tips/:tipId/save

Saves a tip for later reference.

**Authentication:** Required

**URL Parameters:**
- `tipId`: Tip identifier

**Request:**
```json
{
  "saved": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "tip_view": {
    "id": "uuid-v4",
    "user_id": "uuid-v4",
    "tip_id": "tip-001",
    "saved": true,
    "viewed_at": "2026-01-20T15:30:00Z"
  }
}
```

---

#### GET /api/glossary

Gets all glossary terms.

**Authentication:** Required

**Query Parameters:**
- `search`: Optional string to search terms and definitions

**Success Response (200):**
```json
{
  "terms": [
    {
      "term": "Acción",
      "definition": "Título que representa una parte del capital de una empresa...",
      "related_terms": ["Dividendo", "CEDEAR", "ETF"],
      "related_lesson": "/aprender/renta-variable/01-acciones"
    },
    {
      "term": "Bono",
      "definition": "Instrumento de deuda emitido por gobiernos o empresas...",
      "related_terms": ["Cupón", "Yield", "Duration"],
      "related_lesson": "/aprender/renta-fija/02-bonos"
    }
  ]
}
```

**With Search:**
```
GET /api/glossary?search=accion
```

---

### Portfolio Endpoints

#### GET /api/portfolio

Gets all portfolio assets for the current user.

**Authentication:** Required

**Success Response (200):**
```json
{
  "assets": [
    {
      "id": "uuid-v4",
      "user_id": "uuid-v4",
      "type": "stock",
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "quantity": 10,
      "purchase_price": 150.00,
      "purchase_date": "2024-01-15",
      "currency": "USD",
      "current_price": 185.50,
      "current_price_updated_at": "2026-01-20T15:00:00Z",
      "price_source": "api",
      "notes": "Long-term hold",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2026-01-20T15:00:00Z",
      "total_value": 1855.00,
      "total_invested": 1500.00,
      "return_amount": 355.00,
      "return_percentage": 23.67
    }
  ],
  "summary": {
    "total_invested": 1500.00,
    "total_value": 1855.00,
    "total_return": 355.00,
    "total_return_percentage": 23.67,
    "assets_by_type": {
      "stock": 1,
      "etf": 0,
      "bond": 0,
      "crypto": 0,
      "cash": 0,
      "other": 0
    },
    "value_by_currency": {
      "USD": 1855.00,
      "ARS": 0.00
    }
  }
}
```

---

#### POST /api/portfolio

Adds a new asset to the portfolio.

**Authentication:** Required

**Request:**
```json
{
  "type": "stock",
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "quantity": 10,
  "purchase_price": 150.00,
  "purchase_date": "2024-01-15",
  "currency": "USD",
  "notes": "Long-term hold"
}
```

**Validation Rules:**
- `type`: Required, must be one of: "stock", "etf", "bond", "crypto", "cash", "other"
- `name`: Required
- `quantity`: Required, must be > 0
- `purchase_price`: Required, must be > 0
- `purchase_date`: Required, valid date
- `currency`: Required, "ARS" or "USD"
- `ticker`: Optional
- `notes`: Optional

**Success Response (201):**
```json
{
  "success": true,
  "asset": {
    "id": "uuid-v4",
    "user_id": "uuid-v4",
    "type": "stock",
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "quantity": 10,
    "purchase_price": 150.00,
    "purchase_date": "2024-01-15",
    "currency": "USD",
    "current_price": 185.50,
    "current_price_updated_at": "2026-01-20T15:30:00Z",
    "price_source": "api",
    "notes": "Long-term hold",
    "created_at": "2026-01-20T15:30:00Z",
    "updated_at": "2026-01-20T15:30:00Z"
  }
}
```

**Validation Error (400):**
```json
{
  "error": "La cantidad debe ser mayor a 0"
}
```

---

#### PUT /api/portfolio/:id

Updates an existing portfolio asset.

**Authentication:** Required

**URL Parameters:**
- `id`: Asset UUID

**Request:**
```json
{
  "quantity": 15,
  "notes": "Updated position"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "asset": {
    "id": "uuid-v4",
    // ... updated asset data
  }
}
```

**Asset Not Found (404):**
```json
{
  "error": "Activo no encontrado"
}
```

**Forbidden (403):**
```json
{
  "error": "No tienes permiso para editar este activo"
}
```

---

#### DELETE /api/portfolio/:id

Deletes a portfolio asset.

**Authentication:** Required

**URL Parameters:**
- `id`: Asset UUID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Activo eliminado exitosamente"
}
```

**Asset Not Found (404):**
```json
{
  "error": "Activo no encontrado"
}
```

---

#### GET /api/portfolio/export

Exports portfolio to CSV.

**Authentication:** Required

**Success Response (200):**

Returns CSV file with headers:
```
Nombre,Ticker,Tipo,Cantidad,Precio Compra,Moneda,Fecha Compra,Precio Actual,Rendimiento %,Valor Total
```

**Content-Type:** `text/csv; charset=utf-8`
**Content-Disposition:** `attachment; filename=finanwas-portfolio-YYYY-MM-DD.csv`

---

### Goals Endpoints

#### GET /api/goals

Gets all savings goals for the current user.

**Authentication:** Required

**Success Response (200):**
```json
{
  "goals": [
    {
      "id": "uuid-v4",
      "user_id": "uuid-v4",
      "name": "Viaje a Europa",
      "target_amount": 5000.00,
      "current_amount": 2500.00,
      "currency": "USD",
      "target_date": "2026-12-31",
      "progress_percentage": 50.00,
      "on_track": true,
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-20T15:00:00Z",
      "completed_at": null
    }
  ]
}
```

---

#### POST /api/goals

Creates a new savings goal.

**Authentication:** Required

**Request:**
```json
{
  "name": "Viaje a Europa",
  "target_amount": 5000.00,
  "currency": "USD",
  "target_date": "2026-12-31"
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `target_amount`: Required, must be > 0
- `currency`: Required, "ARS" or "USD"
- `target_date`: Optional, valid future date

**Success Response (201):**
```json
{
  "success": true,
  "goal": {
    "id": "uuid-v4",
    "user_id": "uuid-v4",
    "name": "Viaje a Europa",
    "target_amount": 5000.00,
    "current_amount": 0.00,
    "currency": "USD",
    "target_date": "2026-12-31",
    "created_at": "2026-01-20T15:30:00Z",
    "updated_at": "2026-01-20T15:30:00Z",
    "completed_at": null
  }
}
```

---

#### POST /api/goals/:id/contribute

Adds a contribution to a savings goal.

**Authentication:** Required

**URL Parameters:**
- `id`: Goal UUID

**Request:**
```json
{
  "amount": 500.00,
  "date": "2026-01-20",
  "notes": "Salario de enero"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "contribution": {
    "id": "uuid-v4",
    "goal_id": "uuid-v4",
    "amount": 500.00,
    "date": "2026-01-20",
    "notes": "Salario de enero",
    "created_at": "2026-01-20T15:30:00Z"
  },
  "goal": {
    "id": "uuid-v4",
    "current_amount": 3000.00,
    "progress_percentage": 60.00
  }
}
```

---

#### GET /api/goals/:id/contributions

Gets all contributions for a specific goal.

**Authentication:** Required

**URL Parameters:**
- `id`: Goal UUID

**Success Response (200):**
```json
{
  "contributions": [
    {
      "id": "uuid-v4",
      "goal_id": "uuid-v4",
      "amount": 500.00,
      "date": "2026-01-20",
      "notes": "Salario de enero",
      "created_at": "2026-01-20T15:30:00Z"
    }
  ],
  "total": 2500.00
}
```

---

#### PUT /api/goals/:id

Updates a savings goal.

**Authentication:** Required

**URL Parameters:**
- `id`: Goal UUID

**Request:**
```json
{
  "name": "Viaje a Europa y Asia",
  "target_amount": 7000.00
}
```

**Success Response (200):**
```json
{
  "success": true,
  "goal": {
    "id": "uuid-v4",
    // ... updated goal data
  }
}
```

---

#### DELETE /api/goals/:id

Deletes a savings goal and all its contributions.

**Authentication:** Required

**URL Parameters:**
- `id`: Goal UUID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Meta eliminada exitosamente"
}
```

---

### Notes Endpoints

#### GET /api/notes

Gets all notes for the current user.

**Authentication:** Required

**Query Parameters:**
- `search`: Optional string to search in title and content
- `tag`: Optional tag to filter by
- `ticker`: Optional ticker to filter notes linked to that ticker

**Success Response (200):**
```json
{
  "notes": [
    {
      "id": "uuid-v4",
      "user_id": "uuid-v4",
      "title": "Análisis de Apple",
      "content": "Apple tiene buenos fundamentals...",
      "tags": ["tech", "stocks"],
      "linked_ticker": "AAPL",
      "created_at": "2026-01-20T10:00:00Z",
      "updated_at": "2026-01-20T15:00:00Z"
    }
  ]
}
```

**With Filters:**
```
GET /api/notes?tag=tech&search=apple
GET /api/notes?ticker=AAPL
```

---

#### POST /api/notes

Creates a new note.

**Authentication:** Required

**Request:**
```json
{
  "title": "Análisis de Apple",
  "content": "Apple tiene buenos fundamentals...",
  "tags": ["tech", "stocks"],
  "linked_ticker": "AAPL"
}
```

**Validation Rules:**
- `title`: Required, non-empty string
- `content`: Required, non-empty string
- `tags`: Optional array of strings
- `linked_ticker`: Optional string

**Success Response (201):**
```json
{
  "success": true,
  "note": {
    "id": "uuid-v4",
    "user_id": "uuid-v4",
    "title": "Análisis de Apple",
    "content": "Apple tiene buenos fundamentals...",
    "tags": ["tech", "stocks"],
    "linked_ticker": "AAPL",
    "created_at": "2026-01-20T15:30:00Z",
    "updated_at": "2026-01-20T15:30:00Z"
  }
}
```

---

#### PUT /api/notes/:id

Updates an existing note.

**Authentication:** Required

**URL Parameters:**
- `id`: Note UUID

**Request:**
```json
{
  "title": "Análisis actualizado de Apple",
  "content": "Nueva información...",
  "tags": ["tech", "stocks", "long-term"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "note": {
    "id": "uuid-v4",
    // ... updated note data
  }
}
```

---

#### DELETE /api/notes/:id

Deletes a note.

**Authentication:** Required

**URL Parameters:**
- `id`: Note UUID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Nota eliminada exitosamente"
}
```

---

### Admin Endpoints

All admin endpoints require authentication with role "admin".

#### GET /api/admin/users

Lists all registered users.

**Authentication:** Required (Admin only)

**Success Response (200):**
```json
{
  "users": [
    {
      "id": "uuid-v4",
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "role": "user",
      "created_at": "2026-01-15T10:00:00Z",
      "last_login": "2026-01-20T15:00:00Z",
      "questionnaire_completed": true
    }
  ],
  "total": 1
}
```

**Forbidden (403):**
```json
{
  "error": "Se requieren permisos de administrador"
}
```

---

#### GET /api/admin/codes

Lists all invitation codes.

**Authentication:** Required (Admin only)

**Success Response (200):**
```json
{
  "codes": [
    {
      "id": "uuid-v4",
      "code": "ABCD1234",
      "created_at": "2026-01-01T10:00:00Z",
      "used_at": "2026-01-15T10:00:00Z",
      "used_by": "uuid-v4",
      "user": {
        "name": "Juan Pérez",
        "email": "juan@example.com"
      }
    },
    {
      "id": "uuid-v5",
      "code": "EFGH5678",
      "created_at": "2026-01-01T10:00:00Z",
      "used_at": null,
      "used_by": null,
      "user": null
    }
  ],
  "total": 2,
  "available": 1,
  "used": 1
}
```

---

#### POST /api/admin/codes

Generates new invitation codes.

**Authentication:** Required (Admin only)

**Request:**
```json
{
  "count": 5
}
```

**Validation Rules:**
- `count`: Optional number between 1-100, defaults to 1

**Success Response (201):**
```json
{
  "success": true,
  "codes": [
    {
      "id": "uuid-v4",
      "code": "WXYZ9012",
      "created_at": "2026-01-20T15:30:00Z"
    }
  ],
  "count": 1
}
```

---

### Market Data Endpoints

#### GET /api/market/stock/:ticker

Gets current market data for a stock.

**Authentication:** Required

**URL Parameters:**
- `ticker`: Stock ticker symbol (e.g., "AAPL", "MSFT")

**Success Response (200):**
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "price": 185.50,
  "currency": "USD",
  "change": 2.50,
  "change_percentage": 1.37,
  "market_cap": 2850000000000,
  "pe_ratio": 28.5,
  "pb_ratio": 45.2,
  "roe": 147.0,
  "debt_equity": 1.8,
  "dividend_yield": 0.5,
  "sector": "Technology",
  "updated_at": "2026-01-20T15:00:00Z",
  "source": "yahoo_finance"
}
```

**Stock Not Found (404):**
```json
{
  "error": "No se encontraron datos para el ticker especificado"
}
```

---

#### GET /api/market/exchange-rate

Gets USD/ARS exchange rate.

**Authentication:** Required

**Success Response (200):**
```json
{
  "currency_pair": "USD/ARS",
  "official_rate": 850.00,
  "blue_rate": 1250.00,
  "mep_rate": 1180.00,
  "ccl_rate": 1200.00,
  "updated_at": "2026-01-20T15:00:00Z",
  "source": "dolarapi"
}
```

---

## Appendix

### Enumerations

**User Roles:**
- `user`: Regular user
- `admin`: Administrator

**Knowledge Levels:**
- `beginner`: Beginner
- `intermediate`: Intermediate
- `advanced`: Advanced

**Main Goals:**
- `save`: Save money
- `invest`: Invest
- `debt_free`: Get out of debt
- `retirement`: Plan for retirement
- `learn`: Learn about finance

**Risk Tolerance:**
- `conservative`: Conservative
- `moderate`: Moderate
- `aggressive`: Aggressive

**Income/Expense Ranges:**
- `range1`: < $500/month
- `range2`: $500 - $1500/month
- `range3`: $1500 - $3000/month
- `range4`: > $3000/month
- `prefer_not_say`: Prefer not to say

**Investment Horizons:**
- `short`: < 1 year
- `medium`: 1-5 years
- `long`: > 5 years

**Asset Types:**
- `stock`: Stock/Equity
- `etf`: ETF
- `bond`: Bond
- `crypto`: Cryptocurrency
- `cash`: Cash
- `other`: Other

**Currencies:**
- `USD`: US Dollar
- `ARS`: Argentine Peso

**Price Sources:**
- `api`: Fetched from external API
- `manual`: Manually entered by user

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-20 | 0.1.0 | Initial API documentation based on implemented endpoints |
