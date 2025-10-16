// Brevo Email Configuration
// Note: We're using direct axios calls in lib/email/send.ts instead of the SDK

/**
 * Verify email configuration
 */
export function verifyEmailConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const businessEmail = process.env.BUSINESS_EMAIL;

  if (!apiKey) {
    console.warn('⚠️  BREVO_API_KEY not set in environment variables');
    return false;
  }

  if (!businessEmail) {
    console.warn('⚠️  BUSINESS_EMAIL not set in environment variables');
    return false;
  }

  console.log('✅ Brevo email configuration verified');
  console.log('✅ API Key length:', apiKey.length);
  console.log('✅ Business Email:', businessEmail);
  return true;
}
