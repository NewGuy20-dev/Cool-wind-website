// Check email authentication DNS records
const dns = require('dns').promises;

const domain = 'coolwind.co.in';

async function checkDNS() {
  console.log('🔍 Checking email authentication for:', domain);
  console.log('='.repeat(60));

  // Check SPF
  console.log('\n📧 SPF Record:');
  try {
    const records = await dns.resolveTxt(domain);
    const spf = records.find(r => r[0].startsWith('v=spf1'));
    if (spf) {
      console.log('✅ Found:', spf[0]);
      if (spf[0].includes('brevo.com') || spf[0].includes('sendinblue.com')) {
        console.log('✅ Brevo is authorized');
      } else {
        console.log('⚠️  Brevo NOT found in SPF record');
        console.log('   Add: v=spf1 include:spf.brevo.com ~all');
      }
    } else {
      console.log('❌ No SPF record found');
      console.log('   Add: v=spf1 include:spf.brevo.com ~all');
    }
  } catch (err) {
    console.log('❌ Error checking SPF:', err.message);
  }

  // Check DKIM
  console.log('\n🔐 DKIM Record:');
  try {
    const dkimSelector = 'mail'; // Common selector, might be different
    const records = await dns.resolveTxt(`${dkimSelector}._domainkey.${domain}`);
    console.log('✅ Found DKIM record');
  } catch (err) {
    console.log('⚠️  DKIM not found or not configured');
    console.log('   Configure in Brevo dashboard → Domain Authentication');
  }

  // Check DMARC
  console.log('\n🛡️  DMARC Record:');
  try {
    const records = await dns.resolveTxt(`_dmarc.${domain}`);
    if (records.length > 0) {
      console.log('✅ Found:', records[0][0]);
    }
  } catch (err) {
    console.log('❌ No DMARC record found');
    console.log('   Add: v=DMARC1; p=none; rua=mailto:info@coolwind.co.in');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Next Steps:');
  console.log('1. Go to your domain registrar (where you bought coolwind.co.in)');
  console.log('2. Add the missing DNS records');
  console.log('3. Go to Brevo → Senders & IP → Domain Authentication');
  console.log('4. Add coolwind.co.in and follow their DKIM setup');
  console.log('5. Wait 24-48 hours for DNS propagation');
  console.log('\n✨ This will dramatically improve email deliverability!\n');
}

checkDNS().catch(console.error);
