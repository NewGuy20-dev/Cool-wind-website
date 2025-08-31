// Use ts-node to run TypeScript files directly
require('ts-node/register');
const { FailedCallDetector } = require('./lib/chat/failed-call-detector');

async function testFailedCallDetection() {
  const testMessages = [
    "The technician never showed up for my scheduled appointment today. This is the second time this has happened. My name is John Doe and I need someone to come fix my AC unit as soon as possible.",
    "I tried calling your number but no one answered. I need service for my broken AC.",
    "Your technician was a no-show for my appointment yesterday. When can someone come fix this?"
  ];

  const detector = new FailedCallDetector();
  
  for (const message of testMessages) {
    console.log('\n--- Testing message ---');
    console.log(message);
    
    const result = await FailedCallDetector.detectFailedCall(message, {});
    console.log('\nDetection result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.detected) {
      console.log('✅ Failed call detected!');
      console.log(`Trigger phrase: ${result.triggerPhrase}`);
      console.log(`Problem description: ${result.problemDescription || 'None'}`);
      console.log(`Location: ${result.location || 'Not specified'}`);
      console.log(`Urgency: ${result.urgencyLevel}`);
      console.log(`Missing fields: ${result.missingFields.join(', ') || 'None'}`);
    } else {
      console.log('❌ No failed call detected');
    }
  }
}

testFailedCallDetection().catch(console.error);
