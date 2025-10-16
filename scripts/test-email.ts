// Test script to send email using Brevo
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { sendBulkOrderEmails } from '../lib/email/send';
import type { BulkOrderEmailData } from '../lib/spare-parts/types';

async function testEmail() {
  console.log('🧪 Testing Brevo email sending...\n');

  // Create test order data
  const testOrderData: BulkOrderEmailData = {
    order: {
      id: 'test-uuid-123',
      order_number: 'CW-20250114-TEST',
      customer_name: 'Test Customer',
      customer_phone: '+919876543210',
      customer_email: 'gauthamrkrishna8@gmail.com', // Your email for testing
      delivery_location: 'Thiruvalla, Kerala',
      items: [
        {
          part_id: 'test-part-1',
          part_name: 'AC Compressor LG 1.5 Ton',
          quantity: 5,
          unit_price: 7500,
          total_price: 37500,
        },
        {
          part_id: 'test-part-2',
          part_name: 'AC Remote Control Universal',
          quantity: 10,
          unit_price: 350,
          total_price: 3500,
        },
      ],
      total_amount: 41000,
      bulk_discount_applied: true,
      discount_amount: 5500,
      status: 'pending',
      source: 'chat',
      chat_conversation_id: null,
      whatsapp_conversation_started: false,
      customer_notes: 'Test order from chat integration',
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      confirmed_at: null,
      delivered_at: null,
    },
    items_with_details: [
      {
        part_id: 'test-part-1',
        part_name: 'AC Compressor LG 1.5 Ton',
        quantity: 5,
        unit_price: 7500,
        total_price: 37500,
        part: {
          id: 'test-part-1',
          name: 'AC Compressor LG 1.5 Ton',
          part_code: 'LG-COMP-1.5T',
          category: 'ac',
          sub_category: 'compressors',
          brand: 'LG',
          appliance_models: ['LG Split AC 1.5 Ton', 'LG Window AC 1.5 Ton'],
          price: 8500,
          bulk_price: 7500,
          bulk_min_quantity: 5,
          stock_quantity: 12,
          low_stock_threshold: 5,
          is_available: true,
          primary_image_url: '/images/spare-parts/placeholder-compressor.jpg',
          image_gallery: [],
          description: 'Genuine LG compressor for 1.5 ton AC units',
          specifications: { power: '1.5 ton', voltage: '220V' },
          warranty_months: 12,
          is_genuine: true,
          slug: 'ac-compressor-lg-1-5-ton',
          meta_description: 'Buy genuine LG AC compressor',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      {
        part_id: 'test-part-2',
        part_name: 'AC Remote Control Universal',
        quantity: 10,
        unit_price: 350,
        total_price: 3500,
        part: {
          id: 'test-part-2',
          name: 'AC Remote Control Universal',
          part_code: 'UNI-REMOTE-AC',
          category: 'ac',
          sub_category: 'remote-controls',
          brand: 'Universal',
          appliance_models: ['LG', 'Samsung', 'Voltas'],
          price: 450,
          bulk_price: 350,
          bulk_min_quantity: 10,
          stock_quantity: 25,
          low_stock_threshold: 10,
          is_available: true,
          primary_image_url: '/images/spare-parts/placeholder-remote.jpg',
          image_gallery: [],
          description: 'Universal AC remote control',
          specifications: { compatibility: 'All major brands' },
          warranty_months: 6,
          is_genuine: false,
          slug: 'ac-remote-control-universal',
          meta_description: 'Universal AC remote',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    ],
    whatsapp_link: 'https://wa.me/918547229991?text=Order%20CW-20250114-TEST',
  };

  console.log('📧 Sending test email to:', testOrderData.order.customer_email);
  console.log('📦 Order:', testOrderData.order.order_number);
  console.log('💰 Total:', `₹${testOrderData.order.total_amount.toLocaleString()}`);
  console.log('🎉 Bulk discount:', `₹${testOrderData.order.discount_amount.toLocaleString()}`);
  console.log('\n⏳ Sending...\n');

  try {
    const result = await sendBulkOrderEmails(testOrderData);

    if (result.success) {
      console.log('✅ SUCCESS! Emails sent successfully!\n');
      console.log('📬 Check your inbox:', testOrderData.order.customer_email);
      console.log('📬 Check business inbox: info@coolwind.co.in\n');
      console.log('📍 Email includes:');
      console.log('   - Order details with pricing');
      console.log('   - Pickup address: Pushpagiri Hospitals Rd, Thiruvalla');
      console.log('   - Google Maps link (9HMH+J3)');
      console.log('   - WhatsApp link');
      console.log('   - Ready in 2-4 hours message\n');
    } else {
      console.error('❌ FAILED to send emails');
      console.error('Error:', result.error);
    }
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check BREVO_API_KEY in .env.local');
    console.error('2. Verify Brevo account is active');
    console.error('3. Check email addresses are valid');
  }
}

// Run the test
testEmail()
  .then(() => {
    console.log('\n✨ Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
