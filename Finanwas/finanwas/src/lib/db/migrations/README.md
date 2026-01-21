# Database Migrations

This directory contains SQL migration files for the Finanwas database schema.

## Migration Files

Migrations are numbered sequentially and should be applied in order:

1. `001_create_users_table.sql` - User accounts and authentication
2. `002_create_invitation_codes_table.sql` - Registration gating system
3. `003_create_user_profiles_table.sql` - User financial profiles and questionnaire data
4. `004_create_lesson_progress_table.sql` - Educational content progress tracking
5. `005_create_tip_views_table.sql` - Financial tips viewing and saving
6. `006_create_portfolio_assets_table.sql` - Investment portfolio tracking
7. `007_create_savings_goals_table.sql` - Savings goals management
8. `008_create_savings_contributions_table.sql` - Goal contributions tracking
9. `009_create_notes_table.sql` - User notes with tags and ticker linking
10. `010_optimize_query_indexes.sql` - Performance optimization indexes

## Applying Migrations

### Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of each migration file
4. Execute them in order

### Supabase CLI

```bash
# If using Supabase CLI
supabase db push
```

### Manual Application

Connect to your database and execute each file:

```sql
-- Example with psql
\i src/lib/db/migrations/001_create_users_table.sql
\i src/lib/db/migrations/002_create_invitation_codes_table.sql
-- ... etc
```

## Index Optimization (Migration 010)

The latest migration adds performance-optimized indexes including:

- **Composite indexes** for common query patterns (e.g., user_id + created_at)
- **Partial indexes** for filtered queries (e.g., active goals, unused codes)
- **Ordering indexes** for frequently sorted queries

These indexes significantly improve query performance for:
- User portfolio retrieval and sorting
- Goal progress calculations
- Lesson completion tracking
- Notes organization and filtering
- User analytics and reporting

## Creating New Migrations

When creating a new migration:

1. Number it sequentially (e.g., `011_add_feature.sql`)
2. Include a header comment with description, author, and date
3. Use `IF NOT EXISTS` clauses to make migrations idempotent
4. Add comments for documentation
5. Test thoroughly before applying to production

Example template:

```sql
-- Migration XXX: Short description
-- Description: Detailed description of what this migration does
-- Author: Your Name
-- Date: YYYY-MM-DD

CREATE TABLE IF NOT EXISTS example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... columns
);

-- Comments
COMMENT ON TABLE example IS 'Description of table purpose';
```

## Rollback Strategy

Currently, migrations are forward-only. If you need to rollback:

1. Create a new migration that reverses the changes
2. Test in a development environment first
3. Document the rollback migration clearly

## Performance Monitoring

After applying migration 010, monitor these query patterns:

- Portfolio asset queries by user (should use `idx_portfolio_assets_user_created`)
- Savings goals filtering (should use `idx_savings_goals_user_active` for active goals)
- Lesson progress tracking (should use `idx_lesson_progress_user_course_completed`)

Use `EXPLAIN ANALYZE` to verify index usage:

```sql
EXPLAIN ANALYZE
SELECT * FROM portfolio_assets
WHERE user_id = 'some-uuid'
ORDER BY created_at DESC;
```
