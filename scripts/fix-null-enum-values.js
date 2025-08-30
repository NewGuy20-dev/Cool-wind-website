/**
 * Fix Null Enum Values Script
 * Updates existing tasks with null status/priority to valid enum values
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function fixNullEnumValues() {
  console.log('🔍 Checking for tasks with null status/priority...');
  
  try {
    // Get all tasks with null status or priority
    const { data: tasksWithNulls, error: selectError } = await supabase
      .from('tasks')
      .select('id, task_number, status, priority, created_at')
      .or('status.is.null,priority.is.null')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (selectError) {
      throw selectError;
    }

    if (!tasksWithNulls || tasksWithNulls.length === 0) {
      console.log('✅ No tasks with null status/priority found');
      return;
    }

    console.log(`📋 Found ${tasksWithNulls.length} tasks with null values:`);
    tasksWithNulls.forEach(task => {
      console.log(`  - ${task.task_number}: status=${task.status}, priority=${task.priority}`);
    });

    // Update all null status to 'pending' and null priority to 'medium'
    const updates = [];
    
    for (const task of tasksWithNulls) {
      const updateData = {};
      
      if (task.status === null) {
        updateData.status = 'pending';
      }
      
      if (task.priority === null) {
        updateData.priority = 'medium';
      }
      
      if (Object.keys(updateData).length > 0) {
        updates.push({
          id: task.id,
          task_number: task.task_number,
          updates: updateData
        });
      }
    }

    console.log(`\n🔧 Updating ${updates.length} tasks...`);
    
    // Process updates in batches
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}...`);
      
      for (const { id, task_number, updates: updateData } of batch) {
        try {
          const { error: updateError } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', id);

          if (updateError) {
            console.error(`❌ Failed to update ${task_number}:`, updateError.message);
            errorCount++;
          } else {
            console.log(`✅ Updated ${task_number}: ${JSON.stringify(updateData)}`);
            successCount++;
          }
        } catch (error) {
          console.error(`❌ Error updating ${task_number}:`, error.message);
          errorCount++;
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Successful updates: ${successCount}`);
    console.log(`   ❌ Failed updates: ${errorCount}`);
    console.log(`   📈 Total processed: ${updates.length}`);

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const { data: remainingNulls, error: verifyError } = await supabase
      .from('tasks')
      .select('id, task_number, status, priority')
      .or('status.is.null,priority.is.null')
      .is('deleted_at', null);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else if (remainingNulls && remainingNulls.length > 0) {
      console.log(`⚠️  Still ${remainingNulls.length} tasks with null values:`, remainingNulls);
    } else {
      console.log('🎉 All null values have been fixed!');
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the script
if (require.main === module) {
  console.log('🚀 Starting null enum values fix...\n');
  fixNullEnumValues()
    .then(() => {
      console.log('\n✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fixNullEnumValues };
