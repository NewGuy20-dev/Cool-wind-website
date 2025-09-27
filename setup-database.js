const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL in .env.local');
  process.exit(1);
}

async function displaySqlFile(filePath) {
  try {
    console.log(`\n📋 Content of ${path.basename(filePath)}:`);
    console.log('='.repeat(60));
    const sql = await fs.readFile(filePath, 'utf8');
    console.log(sql);
    console.log('='.repeat(60));
    return true;
  } catch (err) {
    console.log(`⚠️  Could not read ${path.basename(filePath)}: ${err.message}`);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Database Setup Helper');
  console.log(`🔗 Your Supabase URL: ${supabaseUrl}`);
  
  console.log('\n📝 MANUAL SETUP INSTRUCTIONS:');
  console.log('Please follow these steps to set up your database:');
  console.log('1. Go to https://supabase.com/dashboard/projects');
  console.log('2. Select your project');
  console.log('3. Go to "SQL Editor" in the left sidebar');
  console.log('4. Copy and paste each SQL file content below in order:');
  
  const sqlFiles = [
    path.join(__dirname, 'sql', '00_database_setup.sql'),
    path.join(__dirname, 'sql', '01_core_schema.sql'),
    path.join(__dirname, 'sql', '02_indexes_constraints.sql'),
    path.join(__dirname, 'sql', '03_rls_policies.sql')
  ];
  
  let filesFound = 0;
  
  for (const sqlFile of sqlFiles) {
    try {
      await fs.access(sqlFile);
      await displaySqlFile(sqlFile);
      filesFound++;
    } catch (err) {
      console.log(`⚠️  Skipping ${path.basename(sqlFile)} - file not found`);
    }
  }
  
  console.log(`\n✅ Found ${filesFound} SQL files to run`);
  console.log('\n🎯 After running all SQL files in your Supabase SQL Editor:');
  console.log('1. The "tasks" table and related tables will be created');
  console.log('2. The database errors in your Next.js app will be resolved');
  console.log('3. Restart your development server: npm run dev');
  
  console.log('\n🚀 Once setup is complete, your app should work without errors!');
}

// Run the setup
setupDatabase().catch((err) => {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
});
