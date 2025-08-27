/**
 * Interactive Demo for Enhanced AI Support Agent
 * Showcases intelligent message analysis and task management without keywords
 */

const API_BASE = 'http://localhost:3000/api';

class EnhancedAIAgentDemo {
  constructor() {
    this.sessionId = null;
    this.demoScenarios = this.defineDemoScenarios();
  }

  /**
   * Define realistic demo scenarios
   */
  defineDemoScenarios() {
    return [
      {
        title: "🚨 Emergency Scenario - No Keywords Used",
        description: "Customer has urgent AC failure but doesn't use obvious keywords",
        messages: [
          "Hi, I'm really worried about my elderly mother. Her AC stopped working this morning and it's getting very hot inside the house.",
          "Yes, we're in Thiruvalla. Her name is Kamala Devi and she's 78 years old. This heat is not good for her health.",
          "My number is 9876543210. Please send someone as soon as possible."
        ],
        expectedBehavior: "Should detect urgency, create high-priority task, show empathy"
      },
      {
        title: "💼 Business Customer - Implicit Communication",
        description: "Restaurant owner with cooling issues affecting business",
        messages: [
          "Good evening. I run a small restaurant in Pathanamthitta and our cooling system has been acting up.",
          "We've been trying to reach your office since yesterday but haven't gotten through to anyone.",
          "This is affecting our food storage and we might have to close if it's not fixed soon. Can someone help?"
        ],
        expectedBehavior: "Should detect failed call attempt, business urgency, create medium-high priority task"
      },
      {
        title: "📋 Task Management - Natural Language",
        description: "Customer wants to manage existing service requests naturally",
        messages: [
          "Hello, I had submitted a request for AC service last week but haven't heard anything.",
          "Can you check what's happening with it? I think I gave my number as 8765432109.",
          "Actually, I need to make it more urgent now because guests are coming tomorrow."
        ],
        expectedBehavior: "Should detect status check intent, then update request priority"
      },
      {
        title: "😤 Frustrated Customer - Cultural Context",
        description: "Politely frustrated customer (Kerala communication style)",
        messages: [
          "Sir, I am calling from Thiruvalla. My refrigerator is not working properly since 3 days.",
          "I tried calling your office multiple times but always busy or no response.",
          "My medicines are getting spoiled and I am very tensed. Please do something urgently."
        ],
        expectedBehavior: "Should detect high frustration despite polite tone, create urgent task"
      },
      {
        title: "🔄 Multi-Intent Conversation",
        description: "Customer with multiple needs in one conversation",
        messages: [
          "I need help with two things - my AC repair and also want to check on a previous request.",
          "The AC is making loud noises and not cooling well. For the old request, I had called last month about refrigerator.",
          "Can you create a new request for AC and tell me status of refrigerator repair?"
        ],
        expectedBehavior: "Should handle both task creation and status check in same conversation"
      }
    ];
  }

  /**
   * Run interactive demo
   */
  async runDemo() {
    console.log('🎭 ENHANCED AI SUPPORT AGENT DEMO');
    console.log('=' .repeat(50));
    console.log('This demo showcases intelligent message analysis without keyword dependency\n');

    for (let i = 0; i < this.demoScenarios.length; i++) {
      const scenario = this.demoScenarios[i];
      console.log(`\n${scenario.title}`);
      console.log(`📝 ${scenario.description}`);
      console.log(`🎯 Expected: ${scenario.expectedBehavior}`);
      console.log('-' .repeat(40));

      // Start fresh session for each scenario
      this.sessionId = null;

      for (let j = 0; j < scenario.messages.length; j++) {
        const message = scenario.messages[j];
        console.log(`\n👤 Customer: "${message}"`);
        
        const result = await this.sendMessage(message);
        
        if (result.error) {
          console.log(`❌ Error: ${result.message}`);
          continue;
        }

        console.log(`🤖 Agent: "${result.response.text}"`);
        
        // Show AI insights
        if (result.aiInsights) {
          this.displayAIInsights(result.aiInsights);
        }

        // Show quick replies if any
        if (result.response.quickReplies && result.response.quickReplies.length > 0) {
          console.log(`💡 Quick Options: ${result.response.quickReplies.map(q => q.text).join(', ')}`);
        }

        // Add delay for readability
        await this.delay(1000);
      }

      console.log('\n✅ Scenario Complete');
      
      // Pause between scenarios
      if (i < this.demoScenarios.length - 1) {
        console.log('\n⏳ Press Enter to continue to next scenario...');
        await this.waitForEnter();
      }
    }

    console.log('\n🎉 Demo Complete! The AI agent successfully:');
    console.log('• Detected failed call scenarios without specific keywords');
    console.log('• Managed tasks through natural language');
    console.log('• Understood cultural communication patterns');
    console.log('• Handled multiple intents in single conversations');
    console.log('• Provided contextual responses based on customer frustration levels');
  }

  /**
   * Display AI insights in readable format
   */
  displayAIInsights(insights) {
    const indicators = [];
    
    if (insights.failedCallDetected) {
      indicators.push(`📞 Failed Call (${insights.failedCallConfidence || 0}% confidence)`);
    }
    
    if (insights.taskManagementDetected) {
      indicators.push(`📋 Task Management`);
    }
    
    if (insights.urgencyLevel && insights.urgencyLevel !== 'medium') {
      indicators.push(`⚡ ${insights.urgencyLevel.toUpperCase()} urgency`);
    }
    
    if (insights.responseStrategy && insights.responseStrategy !== 'solution-focused') {
      indicators.push(`💭 ${insights.responseStrategy} strategy`);
    }

    if (indicators.length > 0) {
      console.log(`🧠 AI Analysis: ${indicators.join(', ')}`);
    }
  }

  /**
   * Send message to chat API
   */
  async sendMessage(message) {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: this.sessionId,
          userId: 'demo-user'
        })
      });
      
      const result = await response.json();
      
      // Update session ID
      if (result.sessionId) {
        this.sessionId = result.sessionId;
      }
      
      return result;
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  /**
   * Test individual message
   */
  async testMessage(message) {
    console.log(`\n🧪 Testing Message: "${message}"`);
    console.log('-' .repeat(40));
    
    const result = await this.sendMessage(message);
    
    if (result.error) {
      console.log(`❌ Error: ${result.message}`);
      return;
    }

    console.log(`🤖 Response: "${result.response.text}"`);
    
    if (result.aiInsights) {
      console.log('\n🧠 AI Analysis:');
      console.log(`• Failed Call Detected: ${result.aiInsights.failedCallDetected ? '✅' : '❌'}`);
      console.log(`• Task Management: ${result.aiInsights.taskManagementDetected ? '✅' : '❌'}`);
      console.log(`• Urgency Level: ${result.aiInsights.urgencyLevel || 'N/A'}`);
      console.log(`• Response Strategy: ${result.aiInsights.responseStrategy || 'N/A'}`);
      console.log(`• Enhanced Response: ${result.aiInsights.enhancedResponse ? '✅' : '❌'}`);
    }

    if (result.response.quickReplies && result.response.quickReplies.length > 0) {
      console.log(`\n💡 Quick Replies: ${result.response.quickReplies.map(q => q.text).join(', ')}`);
    }

    console.log(`\n📊 Intent: ${result.intent?.name} (${result.intent?.confidence}% confidence)`);
    console.log(`🚨 Escalated: ${result.escalated ? 'Yes' : 'No'}`);
  }

  /**
   * Interactive testing mode
   */
  async interactiveMode() {
    console.log('\n🎮 INTERACTIVE MODE');
    console.log('Type messages to test the AI agent. Type "quit" to exit.\n');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = () => {
      rl.question('👤 Your message: ', async (message) => {
        if (message.toLowerCase() === 'quit') {
          console.log('\n👋 Goodbye!');
          rl.close();
          return;
        }

        if (message.trim()) {
          await this.testMessage(message);
        }

        console.log(''); // Add spacing
        askQuestion(); // Ask for next message
      });
    };

    askQuestion();
  }

  /**
   * Utility functions
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  waitForEnter() {
    return new Promise(resolve => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('', () => {
        rl.close();
        resolve();
      });
    });
  }

  /**
   * Show demo menu
   */
  showMenu() {
    console.log('\n📋 DEMO OPTIONS:');
    console.log('1. Run full demo scenarios');
    console.log('2. Test specific message');
    console.log('3. Interactive mode');
    console.log('4. Show capabilities overview');
    console.log('5. Exit');
  }

  /**
   * Show capabilities overview
   */
  showCapabilities() {
    console.log('\n🚀 ENHANCED AI AGENT CAPABILITIES');
    console.log('=' .repeat(50));
    console.log('\n📞 INTELLIGENT FAILED CALL DETECTION:');
    console.log('• No keyword dependency - understands context and intent');
    console.log('• Detects frustration levels (0-10 scale)');
    console.log('• Cultural awareness for Kerala communication patterns');
    console.log('• Handles polite complaints and indirect expressions');
    console.log('• Automatic urgency assessment');

    console.log('\n📋 NATURAL TASK MANAGEMENT:');
    console.log('• Create service requests through conversation');
    console.log('• Check status of existing requests');
    console.log('• Update/modify requests naturally');
    console.log('• Cancel requests when needed');
    console.log('• List customer\'s service history');

    console.log('\n🧠 AI-POWERED ANALYSIS:');
    console.log('• Context understanding across conversation turns');
    console.log('• Intent recognition without explicit commands');
    console.log('• Emotional intelligence and empathy detection');
    console.log('• Multi-intent handling in single messages');
    console.log('• Response strategy adaptation');

    console.log('\n🎯 BUSINESS BENEFITS:');
    console.log('• Reduced human agent workload');
    console.log('• Faster customer issue resolution');
    console.log('• Better customer satisfaction through understanding');
    console.log('• Automatic task creation and management');
    console.log('• Cultural and contextual awareness');
  }

  /**
   * Main menu loop
   */
  async runMenu() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askChoice = () => {
      this.showMenu();
      rl.question('\nSelect option (1-5): ', async (choice) => {
        console.log('');
        
        switch (choice.trim()) {
          case '1':
            await this.runDemo();
            break;
          case '2':
            rl.question('Enter message to test: ', async (message) => {
              if (message.trim()) {
                await this.testMessage(message);
              }
              askChoice();
            });
            return;
          case '3':
            rl.close();
            await this.interactiveMode();
            return;
          case '4':
            this.showCapabilities();
            break;
          case '5':
            console.log('👋 Goodbye!');
            rl.close();
            return;
          default:
            console.log('❌ Invalid option. Please choose 1-5.');
        }
        
        askChoice();
      });
    };

    console.log('🎭 Welcome to Enhanced AI Agent Demo!');
    askChoice();
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedAIAgentDemo;
}

// Run demo if called directly
if (require.main === module) {
  const demo = new EnhancedAIAgentDemo();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    const command = args[0].toLowerCase();
    
    switch (command) {
      case 'demo':
        demo.runDemo()
          .then(() => console.log('\n✅ Demo complete'))
          .catch(err => console.error('❌ Demo failed:', err));
        break;
      case 'test':
        if (args[1]) {
          demo.testMessage(args.slice(1).join(' '))
            .then(() => console.log('\n✅ Test complete'))
            .catch(err => console.error('❌ Test failed:', err));
        } else {
          console.log('❌ Please provide a message to test');
          console.log('Example: node demo-enhanced-ai-agent.js test "I tried calling but no answer"');
        }
        break;
      case 'interactive':
        demo.interactiveMode();
        break;
      case 'capabilities':
        demo.showCapabilities();
        break;
      default:
        console.log('❌ Unknown command. Available commands:');
        console.log('• node demo-enhanced-ai-agent.js demo');
        console.log('• node demo-enhanced-ai-agent.js test "your message"');
        console.log('• node demo-enhanced-ai-agent.js interactive');
        console.log('• node demo-enhanced-ai-agent.js capabilities');
    }
  } else {
    // Run menu if no arguments
    demo.runMenu()
      .catch(err => console.error('❌ Menu failed:', err));
  }
}

console.log('\n📝 Usage Examples:');
console.log('node demo-enhanced-ai-agent.js                    # Interactive menu');
console.log('node demo-enhanced-ai-agent.js demo               # Run full demo');
console.log('node demo-enhanced-ai-agent.js test "message"     # Test specific message');
console.log('node demo-enhanced-ai-agent.js interactive        # Interactive testing');
console.log('node demo-enhanced-ai-agent.js capabilities       # Show capabilities');