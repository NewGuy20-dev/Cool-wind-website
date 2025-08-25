/**
 * Test script for the new Gemini-based information extraction
 */

const { GeminiInformationExtractor } = require('../lib/gemini/information-extractor');

async function testExtractions() {
  console.log('🧪 Testing Gemini Information Extraction\n');
  
  const testCases = [
    {
      name: 'Original Problem Case',
      message: 'my name is gautham and phone no is 9544654402 and location is thiruvalla and problem is Ac burst',
      expected: {
        name: 'gautham',
        phone: '9544654402',
        location: 'thiruvalla',
        problem: 'Ac burst'
      }
    },
    {
      name: 'Simple Name and Phone',
      message: 'hi my name is rajesh and my number is 8547229991',
      expected: {
        name: 'rajesh',
        phone: '8547229991'
      }
    },
    {
      name: 'Different Format',
      message: 'I am Priya, phone number 9876543210, located in Pathanamthitta, AC not working',
      expected: {
        name: 'Priya',
        phone: '9876543210',
        location: 'Pathanamthitta',
        problem: 'AC not working'
      }
    },
    {
      name: 'Messy Input',
      message: 'name: john phone: 7890123456 place: kerala problem: fridge leaking',
      expected: {
        name: 'john',
        phone: '7890123456',
        location: 'kerala',
        problem: 'fridge leaking'
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`Input: "${testCase.message}"`);
    
    try {
      const result = await GeminiInformationExtractor.extractCustomerInfo(testCase.message);
      
      console.log('✅ Extracted:');
      console.log(`   Name: ${result.name || 'null'} (confidence: ${result.confidence.name})`);
      console.log(`   Phone: ${result.phone || 'null'} (confidence: ${result.confidence.phone})`);
      console.log(`   Location: ${result.location || 'null'} (confidence: ${result.confidence.location})`);
      console.log(`   Problem: ${result.problem || 'null'} (confidence: ${result.confidence.problem})`);
      
      // Check accuracy
      let accuracy = 0;
      let total = 0;
      
      Object.keys(testCase.expected).forEach(key => {
        total++;
        if (result[key] && result[key].toLowerCase().includes(testCase.expected[key].toLowerCase())) {
          accuracy++;
          console.log(`   ✅ ${key}: Match`);
        } else {
          console.log(`   ❌ ${key}: Expected "${testCase.expected[key]}", got "${result[key] || 'null'}"`);
        }
      });
      
      console.log(`   📊 Accuracy: ${accuracy}/${total} (${Math.round(accuracy/total*100)}%)`);
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  testExtractions().catch(console.error);
}

module.exports = { testExtractions };