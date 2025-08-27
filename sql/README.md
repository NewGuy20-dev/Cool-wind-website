# Supabase Database Setup Guide

## 🎯 Overview
This folder contains all SQL scripts needed to migrate the task management system from in-memory storage to Supabase PostgreSQL. Execute these scripts in order for a complete database setup.

## 📋 Prerequisites
- Supabase project created at [supabase.com](https://supabase.com)
- Access to Supabase SQL Editor
- Environment variables configured (see ENVIRONMENT_SETUP.md)

## 🗂️ File Structure & Execution Order

Execute the following SQL files **in exact order** via Supabase SQL Editor:

### 1️⃣ **00_database_setup.sql**
- Initial database configuration
- Extensions setup
- Basic security settings
- **Dependencies:** None
- **Execution Time:** ~30 seconds

### 2️⃣ **01_core_schema.sql** 
- Main `tasks` table creation
- Core relationships and constraints
- UUID primary keys and indexes
- **Dependencies:** 00_database_setup.sql
- **Execution Time:** ~1 minute

### 3️⃣ **02_indexes_constraints.sql**
- Performance optimization indexes
- Full-text search configuration
- Composite indexes for queries
- **Dependencies:** 01_core_schema.sql
- **Execution Time:** ~45 seconds

### 4️⃣ **03_rls_policies.sql**
- Row Level Security setup
- Admin access policies
- API security configurations
- **Dependencies:** 01_core_schema.sql
- **Execution Time:** ~30 seconds

### 5️⃣ **04_triggers_functions.sql**
- Auto-update timestamps
- Audit trail triggers
- Custom database functions
- **Dependencies:** 01_core_schema.sql
- **Execution Time:** ~1 minute

### 6️⃣ **05_views_procedures.sql**
- Analytics views
- Dashboard data aggregation
- Stored procedures for complex queries
- **Dependencies:** 01_core_schema.sql, 02_indexes_constraints.sql
- **Execution Time:** ~45 seconds

### 7️⃣ **06_seed_data.sql**
- Development and testing data
- Sample tasks for validation
- Test user data
- **Dependencies:** All previous files
- **Execution Time:** ~15 seconds
- **Note:** Skip in production

### 8️⃣ **07_production_config.sql**
- Production-specific settings
- Connection pooling configuration
- Performance tuning
- **Dependencies:** All previous files
- **Execution Time:** ~30 seconds

### 9️⃣ **99_future_migrations.sql**
- Template for future schema changes
- Migration best practices
- Rollback procedures
- **Dependencies:** None (reference only)

## 🚀 Quick Setup Commands

Copy-paste these commands in Supabase SQL Editor:

```sql
-- Step 1: Run each file in order
-- Open each .sql file and copy-paste the entire content

-- Step 2: Verify setup
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%task%';

-- Step 3: Test basic functionality
INSERT INTO tasks (title, description, status, priority) 
VALUES ('Test Task', 'Migration test', 'pending', 'medium');

SELECT * FROM tasks WHERE title = 'Test Task';
```

## 🔍 Verification Checklist

After executing all scripts, verify:

- [ ] `tasks` table exists with all columns
- [ ] Indexes created successfully
- [ ] RLS policies active
- [ ] Triggers working (check `updated_at` auto-update)
- [ ] Views returning data
- [ ] Functions callable
- [ ] Sample data inserted (development only)

## 🛠️ Troubleshooting

### Common Issues:

**Extension not found:**
```sql
-- Run in SQL Editor as superuser
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

**Permission denied:**
- Ensure you're running as database owner
- Check RLS policies aren't blocking operations

**Index creation failed:**
- Verify base tables exist first
- Check for naming conflicts

**Function creation failed:**
- Ensure all dependencies are installed
- Verify PostgreSQL version compatibility

## 📞 Support

If you encounter issues:
1. Check Supabase logs in Dashboard > Logs
2. Verify each script executed successfully
3. Review the specific error message
4. Ensure scripts are run in correct order

## 🔄 Rollback Procedures

Each SQL file includes rollback commands at the bottom. To rollback:

```sql
-- Example rollback (run in reverse order)
DROP TABLE IF EXISTS tasks CASCADE;
DROP EXTENSION IF EXISTS "uuid-ossp";
```

⚠️ **Warning:** Rollback will delete all data. Backup first in production!

## 📈 Performance Notes

Expected database performance after setup:
- **Task creation:** <50ms
- **Dashboard queries:** <200ms  
- **Full-text search:** <100ms
- **Analytics views:** <500ms

## 🔐 Security Notes

- RLS (Row Level Security) is enabled by default
- Admin access requires proper authentication
- API keys should be environment-specific
- Regular security reviews recommended

---

**Next Steps:** After database setup, configure environment variables and update application code to use Supabase client.