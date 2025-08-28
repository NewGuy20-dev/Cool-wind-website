#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  const samples = [
    {
      id: uuidv4(),
      customer_name: 'John Doe',
      phone_number: '9876543210',
      title: 'Chat failed call — user message not delivered',
      description: 'Webhook failed to respond when user sent "help me".',
      problem_description: 'User tried to get help but the chat system failed to deliver the message properly.',
      status: 'pending', // DB status
      priority: 'high',
      source: 'chat-failed-call',
      metadata: {
        external_id: `cf-${Date.now()}-1`,
        triggerPhrase: 'help me',
        originalMessage: 'I need help with my AC repair',
        created_by: 'seed-script'
      },
      created_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      customer_name: 'Jane Smith',
      phone_number: '8765432109',
      title: 'Chat failed call — streaming error',
      description: 'Stream closed unexpectedly.',
      problem_description: 'The chat stream was interrupted while customer was asking about pricing.',
      status: 'pending',
      priority: 'medium',
      source: 'chat-failed-call',
      metadata: {
        external_id: `cf-${Date.now()}-2`,
        triggerPhrase: 'streaming error',
        originalMessage: 'What are your rates for refrigerator repair?',
        created_by: 'seed-script'
      },
      created_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      customer_name: 'Bob Johnson',
      phone_number: '7654321098',
      title: 'Chat failed call — API timeout',
      description: 'Upstream API timed out after 30s.',
      problem_description: 'Customer inquiry about emergency AC service timed out.',
      status: 'pending',
      priority: 'low',
      source: 'chat-failed-call',
      metadata: {
        external_id: `cf-${Date.now()}-3`,
        triggerPhrase: 'timeout error',
        originalMessage: 'I need urgent AC repair, it\'s very hot',
        created_by: 'seed-script'
      },
      created_at: new Date().toISOString(),
    }
  ];

  const { data, error } = await supabase
    .from('tasks')
    .insert(samples)
    .select('*');

  if (error) {
    console.error('Seed failed', error);
    process.exit(1);
  }
  console.log('Seeded tasks:', data);
  process.exit(0);
}

seed();