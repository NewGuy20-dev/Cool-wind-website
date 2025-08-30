const { GeminiInformationExtractor } = require('./lib/gemini/information-extractor.ts');

// Test phone validation directly
function testPhoneValidation() {
    console.log('=== Testing Phone Validation ===\n');
    
    // Test cases
    const testPhones = [
        "9123456789",
        "1234567890", 
        "8123456789",
        "7123456789",
        "6123456789",
        "5123456789", // Should fail
        "+919123456789",
        "91 9123456789"
    ];
    
    testPhones.forEach(phone => {
        console.log(`Testing: "${phone}"`);
        
        // Test the internal validatePhone method
        try {
            // Since validatePhone is private, let's simulate the logic
            const cleaned = phone.replace(/[\s\-\(\)]/g, '');
            const withoutCountryCode = cleaned.replace(/^\+?91/, '');
            const isValid = /^[6-9]\d{9}$/.test(withoutCountryCode);
            
            console.log(`  - Cleaned: "${cleaned}"`);
            console.log(`  - Without country code: "${withoutCountryCode}"`);
            console.log(`  - Regex test result: ${isValid}`);
            console.log(`  - Final result: ${isValid ? withoutCountryCode : 'undefined'}`);
        } catch (error) {
            console.log(`  - Error: ${error.message}`);
        }
        console.log('');
    });
}

// Test Gemini extraction with our specific message
async function testGeminiExtraction() {
    console.log('=== Testing Gemini Extraction ===\n');
    
    const testMessage = "The technician never showed up for my appointment. This is the second time this has happened. My name is John Doe and my phone no is 9123456789 and location is in thiruvalla and I need someone to come fix my AC unit as soon as possible.";
    
    try {
        const result = await GeminiInformationExtractor.extractCustomerInfo(testMessage);
        console.log('Gemini extraction result:', JSON.stringify(result, null, 2));
        
        // Check specifically the phone field
        console.log('\nPhone field analysis:');
        console.log(`- Raw phone from Gemini: "${result.phone}"`);
        console.log(`- Type: ${typeof result.phone}`);
        console.log(`- Is undefined: ${result.phone === undefined}`);
        console.log(`- Is null: ${result.phone === null}`);
        console.log(`- Confidence: ${result.confidence.phone}`);
        
    } catch (error) {
        console.error('Gemini extraction failed:', error);
    }
}

// Run tests
testPhoneValidation();
testGeminiExtraction().catch(console.error);
