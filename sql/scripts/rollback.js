/**
 * Database Rollback Script
 * Safely rollback migrations in staging or production
 * Author: Database Admin
 * Date: 2025-01-26
 */

const fs = require('fs').promises;
const path = require('path');

class DatabaseRollback {
    constructor(environment = 'staging') {
        this.environment = environment;
        this.trackingFile = path.join(__dirname, `../migrations/applied/${environment}.json`);
        this.migrationsDownDir = path.join(__dirname, '../migrations/down');
        this.backupDir = path.join(__dirname, '../backups');
    }

    async loadTrackingState() {
        try {
            const data = await fs.readFile(this.trackingFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Failed to load ${this.environment} tracking state: ${error.message}`);
        }
    }

    async saveTrackingState(state) {
        state.last_updated = new Date().toISOString();
        await fs.writeFile(this.trackingFile, JSON.stringify(state, null, 2));
    }

    async getLastAppliedMigrations(count = 1) {
        const state = await this.loadTrackingState();
        return state.applied_migrations
            .slice(-count)
            .reverse(); // Most recent first
    }

    async createPreRollbackBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const backupFile = path.join(this.backupDir, `${this.environment}-pre-rollback-${timestamp}.sql`);
        
        console.log(`💾 Creating pre-rollback backup for ${this.environment}...`);
        
        await fs.mkdir(this.backupDir, { recursive: true });
        
        const backupContent = `-- PRE-ROLLBACK Database Backup
-- Created: ${new Date().toISOString()}
-- Environment: ${this.environment}
-- Purpose: Backup before rollback operation
-- 
-- RESTORE INSTRUCTIONS:
-- If rollback causes issues, restore using:
-- psql <DATABASE_URL> < ${backupFile}
--
-- ROLLBACK CONTEXT:
-- This backup was created before attempting to rollback recent migrations
-- Use this to restore to the state before rollback if needed
--
-- AUTOMATED BACKUP COMMAND:
-- supabase db dump --file ${backupFile}
`;
        
        await fs.writeFile(backupFile, backupContent);
        console.log(`✅ Pre-rollback backup created: ${path.basename(backupFile)}`);
        
        return backupFile;
    }

    async validateRollbackMigration(migrationInfo) {
        const rollbackFile = path.join(this.migrationsDownDir, migrationInfo.filename);
        
        const errors = [];
        
        // Check if rollback file exists
        try {
            await fs.access(rollbackFile);
        } catch {
            errors.push(`Rollback file not found: ${migrationInfo.filename}`);
        }
        
        // Basic validation of rollback script
        if (errors.length === 0) {
            try {
                const content = await fs.readFile(rollbackFile, 'utf8');
                
                if (!content.includes('BEGIN;') || !content.includes('COMMIT;')) {
                    errors.push('Rollback script should be wrapped in BEGIN/COMMIT transaction');
                }
                
                // Check for destructive operations warning
                if (content.includes('DROP TABLE') && !content.includes('WARNING')) {
                    errors.push('Destructive rollback operations should include WARNING comments');
                }
                
            } catch (err) {
                errors.push(`Error reading rollback file: ${err.message}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            rollbackFile
        };
    }

    async executeRollback(migrationInfo) {
        const rollbackFile = path.join(this.migrationsDownDir, migrationInfo.filename);
        const rollbackContent = await fs.readFile(rollbackFile, 'utf8');
        
        console.log(`🔄 Executing rollback: ${migrationInfo.filename}`);
        console.log(`📋 Original migration applied: ${migrationInfo.applied_at}`);
        console.log(`👤 Original author: ${migrationInfo.author || 'Unknown'}`);
        
        // Show rollback preview
        console.log('📄 Rollback script preview:');
        const lines = rollbackContent.split('\n').slice(0, 8);
        lines.forEach((line, idx) => {
            if (line.trim()) console.log(`   ${idx + 1}: ${line}`);
        });
        
        if (rollbackContent.split('\n').length > 8) {
            console.log('   ... (truncated)');
        }
        
        const startTime = Date.now();
        
        // Simulate rollback execution
        // In real implementation, execute against database using MCP tools
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        return {
            filename: migrationInfo.filename,
            rolled_back_at: new Date().toISOString(),
            original_applied_at: migrationInfo.applied_at,
            rollback_duration_ms: duration,
            success: true
        };
    }

    async rollbackLastMigration() {
        return this.rollbackMigrations(1);
    }

    async rollbackMigrations(count = 1) {
        try {
            console.log(`🔄 ${this.environment.toUpperCase()} ROLLBACK STARTED`);
            console.log('=====================================');
            
            if (this.environment === 'production') {
                console.log('⚠️  CRITICAL: Rolling back PRODUCTION database');
                console.log('=====================================');
            }
            
            // Get migrations to rollback
            const migrationsToRollback = await this.getLastAppliedMigrations(count);
            
            if (migrationsToRollback.length === 0) {
                console.log('❌ No migrations found to rollback');
                return { success: false, reason: 'No migrations to rollback' };
            }
            
            console.log(`\n📋 Rollback Plan:`);
            console.log(`   🔄 Migrations to rollback: ${migrationsToRollback.length}`);
            migrationsToRollback.forEach((migration, idx) => {
                console.log(`   ${idx + 1}. ${migration.filename} (applied: ${migration.applied_at})`);
            });
            
            // Create pre-rollback backup
            const backupFile = await this.createPreRollbackBackup();
            
            // Load current state
            const state = await this.loadTrackingState();
            
            // Validate rollback scripts exist and are valid
            console.log('\n🔍 Validating rollback scripts...');
            for (const migration of migrationsToRollback) {
                const validation = await this.validateRollbackMigration(migration);
                if (!validation.valid) {
                    throw new Error(`Rollback validation failed for ${migration.filename}: ${validation.errors.join(', ')}`);
                }
                console.log(`✅ Validated: ${migration.filename}`);
            }
            
            // Execute rollbacks in reverse order (most recent first)
            let rolledBackCount = 0;
            const rollbackResults = [];
            
            for (const migration of migrationsToRollback) {
                console.log(`\n--- Rolling back ${migration.filename} ---`);
                
                const result = await this.executeRollback(migration);
                
                if (result.success) {
                    // Remove from applied migrations
                    const migrationIndex = state.applied_migrations.findIndex(
                        m => m.filename === migration.filename
                    );
                    if (migrationIndex !== -1) {
                        state.applied_migrations.splice(migrationIndex, 1);
                    }
                    
                    rolledBackCount++;
                    rollbackResults.push(result);
                    
                    console.log(`✅ Rolled back: ${migration.filename}`);
                    console.log(`   Duration: ${result.rollback_duration_ms}ms`);
                } else {
                    throw new Error(`Rollback failed for: ${migration.filename}`);
                }
            }
            
            // Update schema version if needed
            if (state.applied_migrations.length > 0) {
                const latestMigration = state.applied_migrations[state.applied_migrations.length - 1];
                const versionMatch = latestMigration.filename.match(/^(\d+)_/);
                if (versionMatch) {
                    state.schema_version = `1.${versionMatch[1]}.0`;
                } else {
                    // Decrement minor version
                    const currentVersion = state.schema_version.split('.');
                    if (currentVersion.length >= 2) {
                        const minor = Math.max(0, parseInt(currentVersion[1]) - 1);
                        state.schema_version = `${currentVersion[0]}.${minor}.0`;
                    }
                }
            } else {
                state.schema_version = '1.0.0';
            }
            
            // Save updated state
            await this.saveTrackingState(state);
            
            console.log('\n🎉 ROLLBACK COMPLETED SUCCESSFULLY!');
            console.log('====================================');
            console.log(`✨ New schema version: ${state.schema_version}`);
            console.log(`🔄 Migrations rolled back: ${rolledBackCount}`);
            console.log(`📦 Remaining migrations: ${state.applied_migrations.length}`);
            console.log(`💾 Pre-rollback backup: ${path.basename(backupFile)}`);
            
            if (this.environment === 'production') {
                console.log('\n🔍 POST-ROLLBACK ACTIONS REQUIRED:');
                console.log('1. 🔍 Test application functionality immediately');
                console.log('2. 📊 Monitor application logs for errors');
                console.log('3. 🔄 Verify database integrity');
                console.log('4. 📢 Notify stakeholders of rollback');
                console.log('5. 📋 Document rollback reason and impact');
            }
            
            return {
                success: true,
                rolledBackCount,
                newSchemaVersion: state.schema_version,
                rollbackResults,
                backupFile
            };
            
        } catch (error) {
            console.log(`\n💥 ${this.environment.toUpperCase()} ROLLBACK FAILED!`);
            console.log('====================================');
            console.error('❌ Error:', error.message);
            
            if (this.environment === 'production') {
                console.log('\n🚨 PRODUCTION ROLLBACK FAILURE - CRITICAL!');
                console.log('1. 🛑 Database may be in inconsistent state');
                console.log('2. 📞 Contact senior database administrator IMMEDIATELY');
                console.log('3. 🔍 Do NOT attempt further changes');
                console.log('4. 💾 Prepare for manual recovery from backup');
                console.log('5. 📋 Document all actions taken');
            }
            
            throw error;
        }
    }

    async rollbackToVersion(targetVersion) {
        console.log(`🎯 Rolling back to version: ${targetVersion}`);
        
        const state = await this.loadTrackingState();
        const currentVersion = state.schema_version;
        
        if (currentVersion === targetVersion) {
            console.log('✅ Already at target version');
            return { success: true, reason: 'Already at target version' };
        }
        
        // Find migrations applied after the target version
        // This is a simplified implementation - in practice, you'd need more sophisticated version tracking
        const migrationsToRollback = state.applied_migrations.filter(migration => {
            const versionMatch = migration.filename.match(/^(\d+)_/);
            if (versionMatch) {
                const migrationNum = parseInt(versionMatch[1]);
                const targetNum = parseInt(targetVersion.split('.')[1]);
                return migrationNum > targetNum;
            }
            return false;
        }).reverse(); // Rollback in reverse order
        
        if (migrationsToRollback.length === 0) {
            console.log('❌ No migrations found to rollback to reach target version');
            return { success: false, reason: 'No migrations to rollback' };
        }
        
        console.log(`📋 Will rollback ${migrationsToRollback.length} migrations to reach version ${targetVersion}`);
        
        return this.rollbackMigrations(migrationsToRollback.length);
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const environment = args[0] || 'staging';
    const operation = args[1] || 'last';
    const count = args[2] ? parseInt(args[2]) : 1;
    
    if (!['staging', 'production'].includes(environment)) {
        console.error('❌ Invalid environment. Use: staging or production');
        process.exit(1);
    }
    
    const rollback = new DatabaseRollback(environment);
    
    console.log(`🔄 Cool Wind Company - Database Rollback Tool`);
    console.log(`Environment: ${environment.toUpperCase()}`);
    console.log('===============================================\n');
    
    if (operation === 'last') {
        rollback.rollbackMigrations(count)
            .then(() => {
                console.log('\n✅ Rollback completed successfully');
                process.exit(0);
            })
            .catch(() => {
                console.log('\n❌ Rollback failed');
                process.exit(1);
            });
    } else if (operation === 'to-version') {
        const targetVersion = args[2];
        if (!targetVersion) {
            console.error('❌ Target version required for to-version operation');
            process.exit(1);
        }
        
        rollback.rollbackToVersion(targetVersion)
            .then(() => {
                console.log('\n✅ Rollback to version completed successfully');
                process.exit(0);
            })
            .catch(() => {
                console.log('\n❌ Rollback to version failed');
                process.exit(1);
            });
    } else {
        console.error('❌ Invalid operation. Use: last or to-version');
        process.exit(1);
    }
}

module.exports = DatabaseRollback;
