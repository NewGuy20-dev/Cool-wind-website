// Simple test for failed call detection
const { FailedCallDetector } = require('./lib/chat/failed-call-detector');

const testMessages = [
  "The technician never showed up for my appointment today. This is the second time this has happened. My name is John Doe and I need someone to come fix my AC unit as soon as possible.",
  "I tried calling your number but no one answered. I need service for my broken AC.",
  "Your technician was a no-show for my appointment yesterday. When can someone come fix this?"
];

console.log('Testing failed call detection...\n');

testMessages.forEach((message, index) => {
  console.log(`Test ${index + 1}:`);
  console.log(`Message: "${message}"`);
  
  // Mock context
  const context = {
    customerName: 'John Doe',
    phoneNumber: '123-456-7890',
    location: '123 Main St'
  };
  
  // Test detection
  const result = FailedCallDetector.detectFailedCall(message, context);
  
  result.then(res => {
    console.log('Detection result:');
    console.log(JSON.stringify(res, null, 2));
    console.log('---\n');
  }).catch(err => {
    console.error('Error during detection:', err);
  });
});
