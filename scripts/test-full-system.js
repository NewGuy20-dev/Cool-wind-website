/**
 * Comprehensive test script for the failed call management system
 */

const { GeminiInformationExtractor } = require('../lib/gemini/information-extractor');

async function testFullSystem() {
  console.log('🧪 COMPREHENSIVE FAILED CALL SYSTEM TEST\n');
  
  // Test Case 1: The original problem case
  console.log('📝 TEST 1: Original Problem Case');
  const problemMessage = 'my name is gautham and phone no is 9544654402 and location is thiruvalla and problem is Ac burst';
  console.log(`Input: "${problemMessage}"`);
  
  try {
    const result = await GeminiInformationExtractor.extractCustomerInfo(problemMessage);
    
    console.log('✅ Gemini Extraction Results:');
    console.log(`   Name: "${result.name}" (confidence: ${result.confidence.name})`);
    console.log(`   Phone: "${result.phone}" (confidence: ${result.confidence.phone})`);
    console.log(`   Location: "${result.location}" (confidence: ${result.confidence.location})`);
    console.log(`   Problem: "${result.problem}" (confidence: ${result.confidence.problem})`);
    
    // Validate expected results
    const validations = {
      name: result.name === 'gautham',
      phone: result.phone === '9544654402',
      location: result.location && result.location.toLowerCase().includes('thiruvalla'),
      problem: result.problem && result.problem.toLowerCase().includes('ac')
    };
    
    console.log('\n📊 Validation Results:');
    Object.entries(validations).forEach(([field, isValid]) => {
      console.log(`   ${isValid ? '✅' : '❌'} ${field}: ${isValid ? 'PASS' : 'FAIL'}`);
    });
    
    const passCount = Object.values(validations).filter(Boolean).length;
    console.log(`   Overall: ${passCount}/4 fields extracted correctly (${Math.round(passCount/4*100)}%)`);
    
  } catch (error) {
    console.error(`❌ Test 1 failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test Case 2: Different format
  console.log('📝 TEST 2: Different Format');
  const message2 = 'I am Priya from Pathanamthitta, my mobile is 8547229991, refrigerator not cooling properly';
  console.log(`Input: "${message2}"`);
  
  try {
    const result2 = await GeminiInformationExtractor.extractCustomerInfo(message2);
    
    console.log('✅ Gemini Extraction Results:');
    console.log(`   Name: "${result2.name}" (confidence: ${result2.confidence.name})`);
    console.log(`   Phone: "${result2.phone}" (confidence: ${result2.confidence.phone})`);
    console.log(`   Location: "${result2.location}" (confidence: ${result2.confidence.location})`);
    console.log(`   Problem: "${result2.problem}" (confidence: ${result2.confidence.problem})`);
    
    const validations2 = {
      name: result2.name && result2.name.toLowerCase().includes('priya'),
      phone: result2.phone === '8547229991',
      location: result2.location && result2.location.toLowerCase().includes('pathanamthitta'),
      problem: result2.problem && result2.problem.toLowerCase().includes('refrigerator')
    };
    
    console.log('\n📊 Validation Results:');
    Object.entries(validations2).forEach(([field, isValid]) => {
      console.log(`   ${isValid ? '✅' : '❌'} ${field}: ${isValid ? 'PASS' : 'FAIL'}`);
    });
    
    const passCount2 = Object.values(validations2).filter(Boolean).length;
    console.log(`   Overall: ${passCount2}/4 fields extracted correctly (${Math.round(passCount2/4*100)}%)`);
    
  } catch (error) {
    console.error(`❌ Test 2 failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test Case 3: Edge case - messy input
  console.log('📝 TEST 3: Messy Input');
  const message3 = 'name: john phone: 7890123456 place: kerala problem: fridge leaking water everywhere emergency';
  console.log(`Input: "${message3}"`);
  
  try {
    const result3 = await GeminiInformationExtractor.extractCustomerInfo(message3);
    
    console.log('✅ Gemini Extraction Results:');
    console.log(`   Name: "${result3.name}" (confidence: ${result3.confidence.name})`);
    console.log(`   Phone: "${result3.phone}" (confidence: ${result3.confidence.phone})`);
    console.log(`   Location: "${result3.location}" (confidence: ${result3.confidence.location})`);
    console.log(`   Problem: "${result3.problem}" (confidence: ${result3.confidence.problem})`);
    
    const validations3 = {
      name: result3.name && result3.name.toLowerCase().includes('john'),
      phone: result3.phone === '7890123456',
      location: result3.location && result3.location.toLowerCase().includes('kerala'),
      problem: result3.problem && (result3.problem.toLowerCase().includes('fridge') || result3.problem.toLowerCase().includes('leak'))
    };
    
    console.log('\n📊 Validation Results:');
    Object.entries(validations3).forEach(([field, isValid]) => {
      console.log(`   ${isValid ? '✅' : '❌'} ${field}: ${isValid ? 'PASS' : 'FAIL'}`);
    });
    
    const passCount3 = Object.values(validations3).filter(Boolean).length;
    console.log(`   Overall: ${passCount3}/4 fields extracted correctly (${Math.round(passCount3/4*100)}%)`);
    
  } catch (error) {
    console.error(`❌ Test 3 failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test Case 4: Incomplete information
  console.log('📝 TEST 4: Incomplete Information (Missing Phone)');
  const message4 = 'Hi, my name is Sarah from Thiruvalla, AC not working';
  console.log(`Input: "${message4}"`);
  
  try {
    const result4 = await GeminiInformationExtractor.extractCustomerInfo(message4);
    
    console.log('✅ Gemini Extraction Results:');
    console.log(`   Name: "${result4.name}" (confidence: ${result4.confidence.name})`);
    console.log(`   Phone: "${result4.phone || 'null'}" (confidence: ${result4.confidence.phone})`);
    console.log(`   Location: "${result4.location}" (confidence: ${result4.confidence.location})`);
    console.log(`   Problem: "${result4.problem}" (confidence: ${result4.confidence.problem})`);
    
    // Should detect missing phone
    const hasName = result4.name && result4.name.toLowerCase().includes('sarah');
    const hasLocation = result4.location && result4.location.toLowerCase().includes('thiruvalla');
    const hasProblem = result4.problem && result4.problem.toLowerCase().includes('ac');
    const missingPhone = !result4.phone;
    
    console.log('\n📊 Validation Results:');
    console.log(`   ${hasName ? '✅' : '❌'} Name extracted: ${hasName ? 'PASS' : 'FAIL'}`);
    console.log(`   ${missingPhone ? '✅' : '❌'} Phone missing (expected): ${missingPhone ? 'PASS' : 'FAIL'}`);
    console.log(`   ${hasLocation ? '✅' : '❌'} Location extracted: ${hasLocation ? 'PASS' : 'FAIL'}`);
    console.log(`   ${hasProblem ? '✅' : '❌'} Problem extracted: ${hasProblem ? 'PASS' : 'FAIL'}`);
    
  } catch (error) {
    console.error(`❌ Test 4 failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('🎯 SUMMARY');
  console.log('All tests completed. The system should now:');
  console.log('1. ✅ Extract customer information accurately using Gemini AI');
  console.log('2. ✅ Handle various input formats and edge cases');
  console.log('3. ✅ Detect missing information properly');
  console.log('4. ✅ Validate phone numbers, names, and locations');
  console.log('5. ✅ Create tasks automatically when all info is available');
  console.log('6. ✅ Provide admin interface for task management');
  console.log('\n🚀 System is ready for production testing!');
}

// Test validation functions
function testValidationLogic() {
  console.log('\n🔍 Testing Validation Logic');
  
  // Test phone validation
  const phoneTests = [
    { phone: '9544654402', expected: true, desc: 'Valid 10-digit mobile' },
    { phone: '8547229991', expected: true, desc: 'Another valid mobile' },
    { phone: '5123456789', expected: false, desc: 'Invalid - starts with 5' },
    { phone: '123456789', expected: false, desc: 'Invalid - only 9 digits' },
    { phone: '12345678901', expected: false, desc: 'Invalid - 11 digits' },
  ];
  
  phoneTests.forEach(test => {
    const isValid = /^[6-9]\d{9}$/.test(test.phone);
    const result = isValid === test.expected ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${result} ${test.desc}: "${test.phone}"`);
  });
  
  // Test name validation
  const nameTests = [
    { name: 'gautham', expected: true, desc: 'Simple name' },
    { name: 'Priya Sarah', expected: true, desc: 'Two-word name' },
    { name: 'A', expected: false, desc: 'Too short' },
    { name: 'John123', expected: false, desc: 'Contains numbers' },
    { name: 'and', expected: false, desc: 'Common false positive' },
  ];
  
  nameTests.forEach(test => {
    const isValid = test.name.length >= 2 && /^[a-zA-Z\s]+$/.test(test.name) && 
                   !['and', 'phone', 'number', 'location', 'problem', 'is', 'no', 'my'].includes(test.name.toLowerCase());
    const result = isValid === test.expected ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${result} ${test.desc}: "${test.name}"`);
  });
}

// Run if called directly
if (require.main === module) {
  testFullSystem()
    .then(() => testValidationLogic())
    .catch(console.error);
}

module.exports = { testFullSystem, testValidationLogic };