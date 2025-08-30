require('dotenv').config();
const { FailedCallDetector } = require('./lib/chat/failed-call-detector');

async function runTest() {
  const userMessage = "The technician never showed up for my appointment today at 2 PM. My name is John Doe, my phone number is 1234567890, and I am located at 123 Main Street. I need someone to come fix my AC unit as soon as possible - it is completely broken and not cooling at all.";

  const context = {
    customerInfo: {},
    inquiryDetails: {},
    chatHistory: [],
  };

  console.log("Running AI detector test with message:", userMessage);

  try {
    const result = await FailedCallDetector.detectFailedCall(userMessage, context);

    console.log("\n--- Test Result ---");
    console.log("Detected:", result.detected);
    console.log("Urgency:", result.urgencyLevel);
    console.log("Name:", result.customerData.name);
    console.log("Phone:", result.customerData.phone);
    console.log("Location:", result.customerData.location);
    console.log("Problem:", result.problemDescription);
    console.log("Missing Fields:", result.missingFields);
    console.log("-------------------\n");

    // Basic assertions
    if (!result.detected) throw new Error("Test failed: Failed call not detected.");
    if (result.urgencyLevel !== 'high' && result.urgencyLevel !== 'critical') throw new Error("Test failed: Urgency not detected correctly.");
    if (result.customerData.name !== 'John Doe') throw new Error("Test failed: Name not extracted correctly.");
    if (result.customerData.phone !== '1234567890') throw new Error("Test failed: Phone not extracted correctly.");
    if (!result.customerData.location) throw new Error("Test failed: Location not extracted.");
    if (!result.problemDescription) throw new Error("Test failed: Problem not extracted.");
    if (result.missingFields.length > 0) throw new Error(`Test failed: Missing fields were reported: ${result.missingFields.join(', ')}`);

    console.log("✅ Test passed!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

runTest();
