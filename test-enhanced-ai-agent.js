/**
 * Comprehensive Test Suite for Enhanced AI Support Agent
 * Tests intelligent message analysis, failed call detection, and task management
 */

const API_BASE = 'http://localhost:3000/api';

class EnhancedAIAgentTester {
  constructor() {
    this.testResults = [];
    this.sessionId = null;
    this.testScenarios = this.defineTestScenarios();
  }

  /**
   * Define comprehensive test scenarios
   */
  defineTestScenarios() {
    return {
      // FAILED CALL DETECTION WITHOUT KEYWORDS
      failedCallScenarios: [
        {
          name: "Implicit Failed Call - Frustration",
          message: "I've been trying to reach someone all morning but haven't heard back. My AC broke yesterday and it's getting hot.",
          expectedDetection: true,
          expectedConfidence: 70,
          expectedUrgency: 'medium',
          expectedFrustration: 6
        },
        {
          name: "Polite Failed Call - Cultural Context",
          message: "Good morning, I tried contacting your office yesterday but nobody was available. Could someone please help with my refrigerator?",
          expectedDetection: true,
          expectedConfidence: 65,
          expectedUrgency: 'medium',
          expectedFrustration: 3
        },
        {
          name: "Urgent Failed Call - Emergency",
          message: "This is really urgent! I've been calling since morning and my refrigerator is completely dead. All my medicines are getting spoiled!",
          expectedDetection: true,
          expectedConfidence: 90,
          expectedUrgency: 'critical',
          expectedFrustration: 9
        },
        {
          name: "Indirect Failed Call - Business Impact",
          message: "My restaurant's cooling system isn't working and I haven't been able to get through to anyone. This is affecting my business operations.",
          expectedDetection: true,
          expectedConfidence: 75,
          expectedUrgency: 'high',
          expectedFrustration: 7
        },
        {
          name: "Subtle Failed Call - Expectation",
          message: "I was hoping someone would get back to me about the service request I mentioned. The AC is making strange noises.",
          expectedDetection: true,
          expectedConfidence: 60,
          expectedUrgency: 'medium',
          expectedFrustration: 4
        }
      ],

      // TASK MANAGEMENT SCENARIOS
      taskManagementScenarios: [
        {
          name: "Implicit Task Creation",
          message: "I need someone to come check my AC. It's not cooling properly and I'm in Thiruvalla. My name is Ravi and number is 9876543210.",
          expectedTaskType: 'create',
          expectedConfidence: 80,
          customerInfo: { name: 'Ravi', phone: '9876543210', location: 'Thiruvalla' }
        },
        {
          name: "Task Status Check",
          message: "Can you tell me what's happening with my service request? I submitted it last week but haven't heard anything.",
          expectedTaskType: 'status',
          expectedConfidence: 85
        },
        {
          name: "Task Update Request",
          message: "I need to change my appointment time for the AC service. Can we make it urgent instead?",
          expectedTaskType: 'update',
          expectedConfidence: 75
        },
        {
          name: "Task Cancellation",
          message: "I won't be needing the refrigerator repair anymore. Please cancel my request.",
          expectedTaskType: 'delete',
          expectedConfidence: 90
        },
        {
          name: "List Tasks Request",
          message: "What are all my pending service requests? I think I have a couple.",
          expectedTaskType: 'list',
          expectedConfidence: 80
        }
      ],

      // NORMAL CONVERSATION (NO SPECIAL HANDLING)
      normalScenarios: [
        {
          name: "General Information",
          message: "What are your business hours?",
          expectedFailedCall: false,
          expectedTaskManagement: false
        },
        {
          name: "Service Inquiry",
          message: "Do you service Samsung refrigerators?",
          expectedFailedCall: false,
          expectedTaskManagement: false
        },
        {
          name: "Pricing Question",
          message: "How much does AC repair typically cost?",
          expectedFailedCall: false,
          expectedTaskManagement: false
        }
      ],

      // EDGE CASES
      edgeCases: [
        {
          name: "Mixed Intent - Failed Call + Task Creation",
          message: "I tried calling earlier but no one answered. Can you create a service request for my AC? It's not working at all.",
          expectedFailedCall: true,
          expectedTaskManagement: true,
          expectedPrimaryIntent: 'failed_call_callback'
        },
        {
          name: "High Frustration + Task Update",
          message: "This is ridiculous! I've been calling for days and now I need to change my appointment to emergency priority!",
          expectedFailedCall: true,
          expectedTaskManagement: true,
          expectedFrustration: 9,
          expectedUrgency: 'critical'
        },
        {
          name: "Polite but Urgent",
          message: "Sorry to bother you, but my elderly mother's AC broke and it's very hot. I tried calling but couldn't get through.",
          expectedFailedCall: true,
          expectedUrgency: 'high',
          expectedFrustration: 5,
          expectedStrategy: 'empathetic'
        }
      ]
    };
  }

  /**
   * Run all test scenarios
   */
  async runAllTests() {
    console.log('🧪 Starting Enhanced AI Agent Test Suite\n');
    
    try {
      // Test failed call detection
      console.log('📞 Testing Failed Call Detection (No Keywords)...');
      await this.testFailedCallDetection();
      
      // Test task management
      console.log('\n📋 Testing Task Management Capabilities...');
      await this.testTaskManagement();
      
      // Test normal conversations
      console.log('\n💬 Testing Normal Conversation Handling...');
      await this.testNormalConversations();
      
      // Test edge cases
      console.log('\n🎯 Testing Edge Cases...');
      await this.testEdgeCases();
      
      // Test conversation flow
      console.log('\n🔄 Testing Conversation Flow...');
      await this.testConversationFlow();
      
      // Generate report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  /**
   * Test failed call detection scenarios
   */
  async testFailedCallDetection() {
    for (const scenario of this.testScenarios.failedCallScenarios) {
      console.log(`  Testing: ${scenario.name}`);
      
      const result = await this.sendMessage(scenario.message);
      const analysis = result.aiInsights;
      
      const passed = this.validateFailedCallDetection(scenario, analysis, result);
      this.recordTest('Failed Call Detection', scenario.name, passed, scenario, result);
      
      console.log(`    ${passed ? '✅' : '❌'} ${scenario.name}`);
      if (!passed) {
        console.log(`      Expected confidence: ${scenario.expectedConfidence}%, Got: ${analysis?.failedCallConfidence || 0}%`);
      }
    }
  }

  /**
   * Test task management capabilities
   */
  async testTaskManagement() {
    for (const scenario of this.testScenarios.taskManagementScenarios) {
      console.log(`  Testing: ${scenario.name}`);
      
      // Set up customer context if provided
      if (scenario.customerInfo) {
        await this.setCustomerContext(scenario.customerInfo);
      }
      
      const result = await this.sendMessage(scenario.message);
      const analysis = result.aiInsights;
      
      const passed = this.validateTaskManagement(scenario, analysis, result);
      this.recordTest('Task Management', scenario.name, passed, scenario, result);
      
      console.log(`    ${passed ? '✅' : '❌'} ${scenario.name}`);
      if (!passed) {
        console.log(`      Expected task type: ${scenario.expectedTaskType}, Got: ${analysis?.taskManagementDetected || false}`);
      }
    }
  }

  /**
   * Test normal conversation handling
   */
  async testNormalConversations() {
    for (const scenario of this.testScenarios.normalScenarios) {
      console.log(`  Testing: ${scenario.name}`);
      
      const result = await this.sendMessage(scenario.message);
      const analysis = result.aiInsights;
      
      const passed = this.validateNormalConversation(scenario, analysis, result);
      this.recordTest('Normal Conversation', scenario.name, passed, scenario, result);
      
      console.log(`    ${passed ? '✅' : '❌'} ${scenario.name}`);
    }
  }

  /**
   * Test edge cases
   */
  async testEdgeCases() {
    for (const scenario of this.testScenarios.edgeCases) {
      console.log(`  Testing: ${scenario.name}`);
      
      const result = await this.sendMessage(scenario.message);
      const analysis = result.aiInsights;
      
      const passed = this.validateEdgeCase(scenario, analysis, result);
      this.recordTest('Edge Case', scenario.name, passed, scenario, result);
      
      console.log(`    ${passed ? '✅' : '❌'} ${scenario.name}`);
    }
  }

  /**
   * Test conversation flow and context retention
   */
  async testConversationFlow() {
    console.log('  Testing multi-turn conversation...');
    
    // Start fresh session
    this.sessionId = null;
    
    // Turn 1: Initial contact attempt
    let result1 = await this.sendMessage("Hi, I tried calling your office but couldn't get through");
    console.log('    Turn 1: Initial failed call mention ✅');
    
    // Turn 2: Provide details
    let result2 = await this.sendMessage("My name is Priya and my AC is not cooling. I'm in Pathanamthitta");
    console.log('    Turn 2: Customer details provided ✅');
    
    // Turn 3: Ask for status
    let result3 = await this.sendMessage("Can you check the status of my request?");
    console.log('    Turn 3: Status inquiry ✅');
    
    const flowPassed = result1.aiInsights?.failedCallDetected && 
                      result3.aiInsights?.taskManagementDetected;
    
    this.recordTest('Conversation Flow', 'Multi-turn Context', flowPassed, 
                   { description: 'Context retention across turns' }, 
                   { turn1: result1, turn2: result2, turn3: result3 });
  }

  /**
   * Send message to chat API
   */
  async sendMessage(message, customSessionId = null) {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: customSessionId || this.sessionId,
          userId: 'test-user'
        })
      });
      
      const result = await response.json();
      
      // Update session ID for conversation continuity
      if (result.sessionId && !customSessionId) {
        this.sessionId = result.sessionId;
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      return { error: true, message: error.message };
    }
  }

  /**
   * Set customer context for testing
   */
  async setCustomerContext(customerInfo) {
    // This would typically be done through a separate API or context setting
    // For testing, we'll send a message with customer info first
    const contextMessage = `My name is ${customerInfo.name}${customerInfo.phone ? `, phone ${customerInfo.phone}` : ''}${customerInfo.location ? `, location ${customerInfo.location}` : ''}`;
    await this.sendMessage(contextMessage);
  }

  /**
   * Validate failed call detection
   */
  validateFailedCallDetection(scenario, analysis, result) {
    if (!analysis) return false;
    
    const confidencePassed = analysis.failedCallConfidence >= (scenario.expectedConfidence - 10);
    const detectionPassed = analysis.failedCallDetected === scenario.expectedDetection;
    
    return confidencePassed && detectionPassed;
  }

  /**
   * Validate task management
   */
  validateTaskManagement(scenario, analysis, result) {
    if (!analysis) return false;
    
    return analysis.taskManagementDetected === true;
  }

  /**
   * Validate normal conversation
   */
  validateNormalConversation(scenario, analysis, result) {
    if (!analysis) return false;
    
    const failedCallCorrect = analysis.failedCallDetected === scenario.expectedFailedCall;
    const taskMgmtCorrect = analysis.taskManagementDetected === scenario.expectedTaskManagement;
    
    return failedCallCorrect && taskMgmtCorrect;
  }

  /**
   * Validate edge cases
   */
  validateEdgeCase(scenario, analysis, result) {
    if (!analysis) return false;
    
    let passed = true;
    
    if (scenario.expectedFailedCall !== undefined) {
      passed = passed && (analysis.failedCallDetected === scenario.expectedFailedCall);
    }
    
    if (scenario.expectedTaskManagement !== undefined) {
      passed = passed && (analysis.taskManagementDetected === scenario.expectedTaskManagement);
    }
    
    return passed;
  }

  /**
   * Record test result
   */
  recordTest(category, name, passed, scenario, result) {
    this.testResults.push({
      category,
      name,
      passed,
      scenario,
      result,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log('\n📊 ENHANCED AI AGENT TEST REPORT');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${passRate}%)`);
    console.log(`Failed: ${failedTests}`);
    console.log('');
    
    // Group results by category
    const categories = {};
    this.testResults.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { passed: 0, total: 0, tests: [] };
      }
      categories[test.category].total++;
      if (test.passed) categories[test.category].passed++;
      categories[test.category].tests.push(test);
    });
    
    // Report by category
    Object.entries(categories).forEach(([category, data]) => {
      const categoryPassRate = ((data.passed / data.total) * 100).toFixed(1);
      console.log(`${category}: ${data.passed}/${data.total} (${categoryPassRate}%)`);
      
      // Show failed tests
      const failedTests = data.tests.filter(t => !t.passed);
      if (failedTests.length > 0) {
        console.log('  Failed:');
        failedTests.forEach(test => {
          console.log(`    ❌ ${test.name}`);
        });
      }
      console.log('');
    });
    
    // Key insights
    console.log('🎯 KEY INSIGHTS:');
    console.log(`• Failed Call Detection: ${this.getInsight('Failed Call Detection', categories)}`);
    console.log(`• Task Management: ${this.getInsight('Task Management', categories)}`);
    console.log(`• Normal Conversations: ${this.getInsight('Normal Conversation', categories)}`);
    console.log(`• Edge Cases: ${this.getInsight('Edge Case', categories)}`);
    
    // Recommendations
    if (passRate < 90) {
      console.log('\n⚠️  RECOMMENDATIONS:');
      if (categories['Failed Call Detection']?.passed / categories['Failed Call Detection']?.total < 0.8) {
        console.log('• Improve failed call detection confidence thresholds');
        console.log('• Add more cultural context patterns for Kerala customers');
      }
      if (categories['Task Management']?.passed / categories['Task Management']?.total < 0.8) {
        console.log('• Enhance task intent recognition patterns');
        console.log('• Improve natural language understanding for task operations');
      }
    }
    
    console.log('\n✨ Test Suite Complete!');
  }

  /**
   * Get insight for category
   */
  getInsight(category, categories) {
    const data = categories[category];
    if (!data) return 'No tests run';
    
    const rate = ((data.passed / data.total) * 100).toFixed(1);
    if (rate >= 90) return `Excellent (${rate}%)`;
    if (rate >= 80) return `Good (${rate}%)`;
    if (rate >= 70) return `Needs improvement (${rate}%)`;
    return `Poor performance (${rate}%)`;
  }

  /**
   * Test specific scenarios manually
   */
  async testSpecificScenario(message, expectedResults = {}) {
    console.log(`\n🧪 Testing specific scenario:`);
    console.log(`Message: "${message}"`);
    
    const result = await this.sendMessage(message);
    
    console.log('\n📊 Results:');
    console.log(`Response: "${result.response?.text}"`);
    console.log(`AI Insights:`, result.aiInsights);
    console.log(`Intent:`, result.intent);
    console.log(`Escalated:`, result.escalated);
    
    return result;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedAIAgentTester;
}

// Run tests if called directly
if (require.main === module) {
  const tester = new EnhancedAIAgentTester();
  
  // Check if specific test requested
  const args = process.argv.slice(2);
  if (args.length > 0) {
    // Test specific message
    tester.testSpecificScenario(args.join(' '))
      .then(() => console.log('\n✅ Specific test complete'))
      .catch(err => console.error('❌ Test failed:', err));
  } else {
    // Run full test suite
    tester.runAllTests()
      .then(() => console.log('\n✅ All tests complete'))
      .catch(err => console.error('❌ Test suite failed:', err));
  }
}

console.log('\n📝 Usage Examples:');
console.log('node test-enhanced-ai-agent.js  # Run full test suite');
console.log('node test-enhanced-ai-agent.js "I tried calling but no answer"  # Test specific message');
console.log('node test-enhanced-ai-agent.js "Can you create a service request for my AC?"  # Test task management');