// Simple test to send email using Brevo
const brevo = require('@getbrevo/brevo');

async function testEmail() {
  console.log('🧪 Testing Brevo email...\n');

  // Initialize Brevo
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    'gM8wpm7ShRLZz14O'
  );

  // Create test email
  const email = new brevo.SendSmtpEmail();
  email.sender = { email: 'info@coolwind.co.in', name: 'Cool Wind Services' };
  email.to = [{ email: 'gauthamrkrishna8@gmail.com', name: 'Test Customer' }];
  email.subject = 'Test Email - Spare Parts Order Confirmation';
  email.htmlContent = `
    <h1>✅ Test Email Successful!</h1>
    <p>This is a test email from Cool Wind Services spare parts system.</p>
    
    <h2>📍 Pickup Location</h2>
    <p>
      <strong>Cool Wind Services</strong><br>
      Pushpagiri Hospitals Rd<br>
      Thiruvalla, Kerala 689101
    </p>
    
    <p>
      <a href="https://maps.google.com/?q=9HMH+J3+Thiruvalla,+Kerala" 
         style="display: inline-block; padding: 12px 24px; background: #4285F4; color: white; text-decoration: none; border-radius: 6px;">
        📍 Open in Google Maps (9HMH+J3)
      </a>
    </p>
    
    <p>If you received this email, the Brevo integration is working perfectly! 🎉</p>
  `;

  try {
    console.log('📧 Sending to: gauthamrkrishna8@gmail.com');
    console.log('⏳ Sending...\n');
    
    const result = await apiInstance.sendTransacEmail(email);
    
    console.log('✅ SUCCESS! Email sent!');
    console.log('📬 Check your inbox: gauthamrkrishna8@gmail.com\n');
    console.log('Message ID:', result.messageId);
    console.log('\n✨ Brevo integration is working perfectly!');
    
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    console.error('\nCheck:');
    console.error('1. BREVO_API_KEY is correct');
    console.error('2. Brevo account is active');
    console.error('3. Email addresses are verified');
  }
}

testEmail();
