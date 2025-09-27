# Database Workflow - Quick Start Guide

## 🚀 Ready to Use Commands

### Deploy to Staging
```bash
node sql/scripts/deploy-staging.js
```

### Deploy to Production  
```bash
node sql/scripts/deploy-production.js
```

### Rollback Last Migration
```bash
# Staging
node sql/scripts/rollback.js staging last 1

# Production  
node sql/scripts/rollback.js production last 1
```

## 📁 Your Current Setup

### Production Database (Current State)
- ✅ 6 tables: `contact_submissions`, `performance_metrics`, `task_attachments`, `task_audit_log`, `task_comments`, `tasks`
- ✅ Schema version: 1.8.0
- ✅ 8 historical migrations tracked

### Staging Environment
- ✅ Ready with 3 pending migrations including new `users` table
- ✅ Schema version: 1.009.0 (after test deployment)

## 🎯 Next Actions

### 1. Create Supabase Staging Branch
When you're ready to work with real databases:
```bash
# This will create a staging branch for testing
# (Note: Requires cost confirmation)
```

### 2. Test the Users Table Migration
Your staging environment is ready to test the new users table that will:
- Add user authentication system
- Link to existing task assignments (`tasks.assigned_to`)
- Link to contact submission assignments (`contact_submissions.assigned_to`)
- Include role-based access control

### 3. Deploy to Production
Once staging tests pass:
```bash
node sql/scripts/deploy-production.js
```

## 🛡️ Safety Features Active

- ✅ Automatic backups before deployments
- ✅ Transaction safety (BEGIN/COMMIT blocks)
- ✅ Migration validation
- ✅ Rollback scripts ready
- ✅ Complete audit trail

## 📋 File Locations

### Migration Files
- **UP migrations**: `sql/migrations/up/`
- **DOWN migrations**: `sql/migrations/down/`
- **Tracking**: `sql/migrations/applied/`

### Scripts
- **Staging deploy**: `sql/scripts/deploy-staging.js`
- **Production deploy**: `sql/scripts/deploy-production.js`  
- **Rollback**: `sql/scripts/rollback.js`

### Documentation
- **Full workflow guide**: `DATABASE_WORKFLOW_GUIDE.md`
- **Implementation summary**: `WORKFLOW_IMPLEMENTATION_SUMMARY.md`

## ⚠️ Important Notes

1. **Always test in staging first** - Never skip staging validation
2. **Backup before production** - Automatic, but verify backup creation
3. **Monitor after deployment** - Check application functionality
4. **Have rollback ready** - Know your rollback plan before deploying

## 🔄 Example Workflow

```bash
# 1. Create new migration files (up and down)
# 2. Deploy to staging
node sql/scripts/deploy-staging.js

# 3. Test staging thoroughly
# 4. Deploy to production when ready
node sql/scripts/deploy-production.js

# 5. Monitor production
# 6. Rollback if issues occur
node sql/scripts/rollback.js production last 1
```

Your database workflow is fully implemented and ready to use! 🎉
