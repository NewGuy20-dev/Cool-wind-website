#!/usr/bin/env node

/**
 * Environment Setup Script for Failed Call Management System
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupEnvironment() {
  console.log('🚀 Failed Call Management System - Environment Setup\n');
  
  console.log('This script will help you configure the required environment variables.\n');
  
  // Check if .env.local already exists
  const envPath = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envPath);
  
  if (envExists) {
    const overwrite = await askQuestion('⚠️  .env.local already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('Setup cancelled. Your existing .env.local file is unchanged.');
      rl.close();
      return;
    }
  }
  
  console.log('\n📋 Please provide the following information:\n');
  
  // Get Google AI API Key
  console.log('1. Google AI API Key');
  console.log('   Get your API key from: https://makersuite.google.com/app/apikey');
  const apiKey = await askQuestion('   Enter your Google AI API Key (or press Enter to skip): ');
  
  // Get Admin Key
  console.log('\n2. Admin Dashboard Password');
  console.log('   This will be used to access the admin dashboard at /admin/tasks');
  const adminKey = await askQuestion('   Enter a secure admin password: ');
  
  if (!adminKey) {
    console.log('❌ Admin key is required. Setup cancelled.');
    rl.close();
    return;
  }
  
  // Optional configurations
  console.log('\n3. Optional Configurations (press Enter for defaults)');
  const geminiModel = await askQuestion('   Gemini Model (default: gemini-2.0-flash-exp): ') || 'gemini-2.0-flash-exp';
  
  // Create .env.local content
  const envContent = `# Environment Variables for Failed Call Management System
# Generated on ${new Date().toISOString()}

# Google AI API Key for Gemini integration
${apiKey ? `GOOGLE_AI_API_KEY=${apiKey}` : '# GOOGLE_AI_API_KEY=your_api_key_here'}

# Gemini model to use
GEMINI_MODEL=${geminiModel}

# Chat session configuration
CHAT_SESSION_TIMEOUT=1800000
MAX_MESSAGES_PER_SESSION=50
ENABLE_CHAT_ANALYTICS=true

# Admin authentication key for task management
ADMIN_KEY=${adminKey}

# Next.js configuration
NEXT_TELEMETRY_DISABLED=1
`;

  // Write the file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment file created successfully!');
    console.log(`📁 File location: ${envPath}`);
    
    // Test the setup
    console.log('\n🧪 Testing the setup...');
    
    // Set environment variables for testing
    process.env.GOOGLE_AI_API_KEY = apiKey;
    process.env.ADMIN_KEY = adminKey;
    process.env.GEMINI_MODEL = geminiModel;
    
    if (apiKey) {
      console.log('✅ Google AI API Key configured');
    } else {
      console.log('⚠️  Google AI API Key not set - system will use fallback extraction');
    }
    
    console.log('✅ Admin key configured');
    console.log('✅ Gemini model configured');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Test the extraction: node scripts/test-extraction-only.js');
    if (apiKey) {
      console.log('3. Test Gemini integration: node scripts/test-gemini-extraction.js');
    }
    console.log('4. Access admin dashboard: http://localhost:3000/admin/tasks');
    console.log(`5. Use admin password: ${adminKey}`);
    
    if (!apiKey) {
      console.log('\n💡 To add Google AI API Key later:');
      console.log('   1. Get API key from: https://makersuite.google.com/app/apikey');
      console.log('   2. Edit .env.local and uncomment/set GOOGLE_AI_API_KEY');
      console.log('   3. Restart the development server');
    }
    
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
  }
  
  rl.close();
}

// Handle Ctrl+C gracefully
rl.on('SIGINT', () => {
  console.log('\n\nSetup cancelled.');
  process.exit(0);
});

// Run setup
if (require.main === module) {
  setupEnvironment().catch(console.error);
}

module.exports = { setupEnvironment };