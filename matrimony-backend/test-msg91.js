const axios = require('axios');

// Direct MSG91 API Test
async function testMSG91API() {
  console.log('🧪 Testing MSG91 API...\n');

  const apiKey = '516843Ar11jM7Tu0N26a06e1a2P1';
  const mobile = '919390913183'; // With country code
  const message = 'Roots & Rings\nOTP: 123456\nExpires: 10 mins\nNever share';

  // Try different endpoints
  const endpoints = [
    {
      name: 'sendhttp.php (Recommended)',
      url: 'https://api.msg91.com/api/sendhttp.php',
      params: {
        authkey: apiKey,
        mobiles: mobile,
        message: message,
        sender: 'RoRings',
        route: '4'
      }
    },
    {
      name: 'send (Alternative)',
      url: 'https://api.msg91.com/api/send',
      params: {
        authkey: apiKey,
        mobiles: mobile,
        message: message,
        sender: 'RoRings',
        route: '4'
      }
    },
    {
      name: 'sendotp.php',
      url: 'https://api.msg91.com/api/sendotp.php',
      params: {
        authkey: apiKey,
        mobile: mobile,
        message: message,
        sender: 'RoRings'
      }
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing: ${endpoint.name}`);
    console.log(`URL: ${endpoint.url}`);
    console.log(`Params:`, endpoint.params);

    try {
      const response = await axios.get(endpoint.url, {
        params: endpoint.params,
        timeout: 5000
      });

      console.log(`✅ SUCCESS!`);
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, response.data);
      return { success: true, endpoint: endpoint.name, data: response.data };
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status} - ${error.message}`);
      if (error.response?.data) {
        console.log(`Response Data:`, error.response.data);
      }
    }
  }

  console.log('\n❌ All endpoints failed.');
}

// Run the test
testMSG91API().catch(console.error);
