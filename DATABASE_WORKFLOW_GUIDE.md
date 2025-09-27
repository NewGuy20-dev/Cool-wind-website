# Database Migration Workflow Guide

## Overview
This guide establishes a safe, Git-like workflow for database schema and data changes using Supabase branches for staging and production environments.

## Workflow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │───▶│     Staging     │───▶│   Production    │
│   (Local/Branch)│    │    (Branch)     │    │    (Main)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    Local Testing          Full Validation         Live Deployment
```

## Directory Structure

```
sql/
├── migrations/
│   ├── up/
│   │   ├── 001_add_users_table.sql
│   │   ├── 002_insert_seed_data.sql
│   │   └── ...
│   ├── down/
│   │   ├── 001_add_users_table.sql
│   │   ├── 002_insert_seed_data.sql
│   │   └── ...
│   └── applied/
│       ├── staging.json
│       └── production.json
├── backups/
└── scripts/
    ├── deploy-to-staging.js
    ├── deploy-to-production.js
    └── rollback.js
```

## Step-by-Step Workflow

### Phase 1: Development & Planning

1. **Create Migration Files**
   - Generate sequential migration files with descriptive names
   - Include both UP and DOWN migration scripts
   - Add comprehensive comments and documentation

2. **Local Validation**
   - Test migration syntax and logic locally
   - Verify rollback procedures work correctly

### Phase 2: Staging Deployment

3. **Create Staging Branch**
   - Use Supabase CLI to create a development branch
   - Apply migration to staging environment

4. **Staging Validation**
   - Run comprehensive tests on staging data
   - Validate schema changes and constraints
   - Test application functionality with new schema

### Phase 3: Version Control

5. **Git Commit Process**
   - Commit migration files to version control
   - Tag releases for major schema versions
   - Document changes in commit messages

### Phase 4: Production Deployment

6. **Production Backup**
   - Create full database backup before deployment
   - Record current schema state

7. **Production Migration**
   - Apply validated migration to production
   - Monitor for issues during deployment
   - Update migration tracking logs

### Phase 5: Post-Deployment

8. **Verification & Monitoring**
   - Verify production deployment success
   - Monitor application performance
   - Document deployment in logs

9. **Cleanup**
   - Archive old migration files if needed
   - Update documentation

## Migration File Templates

### UP Migration Template
```sql
-- Migration: [NUMBER]_[DESCRIPTION]
-- Author: [NAME]
-- Date: [YYYY-MM-DD]
-- Purpose: [DETAILED DESCRIPTION]

-- BEGIN TRANSACTION
BEGIN;

-- Migration Code Here
[YOUR MIGRATION CODE]

-- Verify Migration
-- [VERIFICATION QUERIES]

COMMIT;
```

### DOWN Migration Template
```sql
-- Rollback: [NUMBER]_[DESCRIPTION]
-- Author: [NAME]
-- Date: [YYYY-MM-DD]
-- Purpose: Rollback for [ORIGINAL MIGRATION]

-- BEGIN TRANSACTION
BEGIN;

-- Rollback Code Here
[YOUR ROLLBACK CODE]

-- Verify Rollback
-- [VERIFICATION QUERIES]

COMMIT;
```

## Safety Protocols

### Pre-Deployment Checklist
- [ ] Migration tested locally
- [ ] UP and DOWN scripts validated
- [ ] Staging deployment successful
- [ ] All tests pass in staging
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Team approval received

### Emergency Procedures
1. **Failed Migration**: Execute corresponding DOWN migration
2. **Data Corruption**: Restore from backup
3. **Performance Issues**: Monitor and rollback if necessary
4. **Application Errors**: Verify schema compatibility

## Automation Scripts

The workflow includes automated scripts for:
- Migration deployment to staging
- Validation testing
- Production deployment
- Rollback procedures
- Backup management

## Migration Tracking

Each environment maintains a log of applied migrations:
- Migration number and name
- Application timestamp
- Author information
- Rollback status
- Performance metrics

## Best Practices

1. **Never skip staging validation**
2. **Always create backups before production deployment**
3. **Use descriptive migration names and comments**
4. **Test rollback procedures before deployment**
5. **Monitor production closely after deployment**
6. **Keep migration files small and focused**
7. **Document breaking changes thoroughly**
8. **Use transactions for atomic operations**

## Environment Configuration

### Staging Environment
- Read/Write access enabled
- Full schema replication
- Isolated from production data
- Safe for experimentation

### Production Environment
- Controlled access
- Backup procedures enabled
- Monitoring and alerting active
- Zero-downtime deployment preferred

## Troubleshooting

### Common Issues
1. **Migration Conflicts**: Resolve through proper branching
2. **Schema Drift**: Use staging validation to catch early
3. **Performance Impact**: Test with production-like data volumes
4. **Rollback Failures**: Maintain comprehensive DOWN scripts

This workflow ensures database changes are thoroughly tested, properly documented, and safely deployed with minimal risk to production systems.
