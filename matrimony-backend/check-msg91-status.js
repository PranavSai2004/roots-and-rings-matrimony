// Check MSG91 Account Balance and Status
const axios = require('axios');
require('dotenv').config();

async function checkMsg91Status() {
  console.log('🔍 Checking MSG91 Account Status...\n');

  const apiKey = process.env.MSG91_API_KEY;
  
  if (!apiKey) {
    console.log('❌ MSG91_API_KEY not found in .env');
    return;
  }

  try {
    // Try to get account balance
    console.log('📊 Attempting to fetch account balance...');
    const balanceResponse = await axios.get('https://api.msg91.com/api/balance.php', {
      params: {
        authkey: apiKey,
        type: 1
      },
      timeout: 5000
    });

    console.log('✅ Balance Response:', balanceResponse.data);

    // Also try alternate balance endpoint
    console.log('\n📱 Checking alternate balance endpoint...');
    const altResponse = await axios.get('https://api.msg91.com/api/balance', {
      params: {
        authkey: apiKey
      },
      timeout: 5000
    });

    console.log('✅ Alternate Response:', altResponse.data);

  } catch (error) {
    console.log(`⚠️ Could not fetch balance: ${error.message}`);
    if (error.response?.data) {
      console.log('Response:', error.response.data);
    }
  }

  console.log('\n📋 IMPORTANT CHECKS:');
  console.log('1. ✅ Go to https://www.msg91.com/user/dashboard');
  console.log('2. ✅ Check "Account Balance" - should show ₹50.00 or more');
  console.log('3. ✅ Check "SMS Channel" - should be ACTIVE');
  console.log('4. ✅ Check "Sender ID" - look for "516843" or "RoRings"');
  console.log('5. ✅ Check "Delivery Reports" - search by phone number');
  console.log('');
  console.log('🔗 MSG91 Links:');
  console.log('   Dashboard: https://www.msg91.com/user/dashboard');
  console.log('   Sender IDs: https://www.msg91.com/user/senderid');
  console.log('   Delivery: https://www.msg91.com/user/apideliveryreport');
}

checkMsg91Status();
