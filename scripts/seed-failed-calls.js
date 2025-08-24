// Script to seed the failed calls database with sample data
const fs = require('fs');
const path = require('path');

const sampleTasks = [
  {
    id: 'task-1',
    customerName: 'Maria Rodriguez',
    phoneNumber: '(555) 123-4567',
    problemDescription: 'Water heater emergency - no hot water for 2 days',
    priority: 'high',
    status: 'new',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    attemptCount: 0,
    callbackPreference: 'After 6 PM today',
    notes: 'Customer mentioned she has small children and prefers evening calls'
  },
  {
    id: 'task-2',
    customerName: 'John Smith',
    phoneNumber: '555-987-6543',
    problemDescription: 'AC unit not cooling properly, temperature rising',
    priority: 'medium',
    status: 'unavailable',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    attemptCount: 2,
    callbackPreference: 'Between 9 AM - 5 PM',
    notes: 'Customer works from home but was in meetings. Requested callback after 3 PM.'
  },
  {
    id: 'task-3',
    customerName: 'Sarah Johnson',
    phoneNumber: '+1 (555) 456-7890',
    problemDescription: 'Scheduled maintenance for HVAC system',
    priority: 'low',
    status: 'scheduled',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    attemptCount: 1,
    callbackPreference: 'Weekday mornings preferred',
    scheduledCallbackTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    notes: 'Customer confirmed availability for tomorrow morning at 10 AM'
  },
  {
    id: 'task-4',
    customerName: 'Mike Chen',
    phoneNumber: '5551234567',
    problemDescription: 'Furnace making strange noises, concerned about safety',
    priority: 'high',
    status: 'progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    attemptCount: 3,
    callbackPreference: 'Available all day',
    notes: 'Technician dispatched. Customer confirmed availability and provided gate code: 1234'
  },
  {
    id: 'task-5',
    customerName: 'Emily Davis',
    phoneNumber: '(555) 321-9876',
    problemDescription: 'Routine maintenance check completed successfully',
    priority: 'low',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    attemptCount: 1,
    callbackPreference: 'No preference',
    notes: 'Service completed. Customer was satisfied with the work. Follow-up scheduled for next year.'
  },
  {
    id: 'task-6',
    customerName: 'Robert Wilson',
    phoneNumber: '555.789.0123',
    problemDescription: 'Ductwork inspection and cleaning needed',
    priority: 'medium',
    status: 'new',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    attemptCount: 0,
    callbackPreference: 'Weekends only',
    notes: 'Auto-created from chat agent. AI Reasoning: Routine service request with flexible timing, no immediate concerns.',
    // AI-powered fields
    aiPriorityScore: 2,
    aiReasoning: 'Routine service request with flexible timing, no immediate concerns',
    aiTags: ['routine', 'ductwork', 'cleaning', 'maintenance'],
    estimatedResponseTime: '24 hours'
  },
  {
    id: 'task-7',
    customerName: 'Dr. Lakshmi Nair',
    phoneNumber: '+91 9876543210',
    problemDescription: 'AC emergency - complete breakdown during heat wave, elderly patients affected',
    priority: 'high',
    status: 'new',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    attemptCount: 0,
    callbackPreference: 'Immediate response needed',
    notes: 'Auto-created from chat agent. AI Reasoning: Medical emergency scenario with vulnerable patients in extreme heat conditions.',
    // AI-powered fields
    aiPriorityScore: 1,
    aiReasoning: 'Medical emergency scenario with vulnerable patients in extreme heat conditions',
    aiTags: ['emergency', 'medical', 'heat-wave', 'elderly', 'ac-failure'],
    estimatedResponseTime: '2-4 hours'
  },
  {
    id: 'task-8',
    customerName: 'Cafe Mocha Restaurant',
    phoneNumber: '0469-2345678',
    problemDescription: 'Commercial refrigerator temperature fluctuating, food safety concern',
    priority: 'high',
    status: 'progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 90 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    attemptCount: 1,
    callbackPreference: 'Business hours only',
    notes: 'Auto-created from chat agent. AI Reasoning: Commercial food safety issue requiring immediate attention to prevent spoilage and health risks.',
    scheduledCallbackTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
    // AI-powered fields
    aiPriorityScore: 1,
    aiReasoning: 'Commercial food safety issue requiring immediate attention to prevent spoilage and health risks',
    aiTags: ['commercial', 'food-safety', 'refrigerator', 'temperature', 'business'],
    estimatedResponseTime: '2-4 hours'
  }
];

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write sample data to the failed calls database
const dbPath = path.join(dataDir, 'failed-calls.json');
fs.writeFileSync(dbPath, JSON.stringify(sampleTasks, null, 2));

console.log('Failed calls database seeded with sample data!');
console.log(`Created ${sampleTasks.length} sample tasks in ${dbPath}`);
console.log('\nSample tasks by status:');
console.log('- New:', sampleTasks.filter(t => t.status === 'new').length);
console.log('- Unavailable:', sampleTasks.filter(t => t.status === 'unavailable').length);
console.log('- Scheduled:', sampleTasks.filter(t => t.status === 'scheduled').length);
console.log('- In Progress:', sampleTasks.filter(t => t.status === 'progress').length);
console.log('- Completed:', sampleTasks.filter(t => t.status === 'completed').length);
console.log('\nPriority distribution:');
console.log('- High:', sampleTasks.filter(t => t.priority === 'high').length);
console.log('- Medium:', sampleTasks.filter(t => t.priority === 'medium').length);
console.log('- Low:', sampleTasks.filter(t => t.priority === 'low').length);
console.log('\nAI-powered tasks:');
console.log('- With AI Analysis:', sampleTasks.filter(t => t.aiPriorityScore).length);
console.log('- AI Priority 1 (High):', sampleTasks.filter(t => t.aiPriorityScore === 1).length);
console.log('- AI Priority 2 (Medium):', sampleTasks.filter(t => t.aiPriorityScore === 2).length);
console.log('- AI Priority 3 (Low):', sampleTasks.filter(t => t.aiPriorityScore === 3).length);