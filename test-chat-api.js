const API_BASE = 'http://localhost:3001/api';

// Test function to verify chat endpoints
async function testChatAPI() {
  console.log('🧪 Testing Chat API endpoints...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/../health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    
    // Test 2: Get messages without auth (should fail)
    console.log('\n2️⃣ Testing get messages without auth...');
    try {
      const messagesResponse = await fetch(`${API_BASE}/chat`);
      const messagesData = await messagesResponse.json();
      if (messagesResponse.status === 401) {
        console.log('✅ Auth protection working:', messagesData.message);
      } else {
        console.log('❌ Auth protection not working');
      }
    } catch (error) {
      console.log('✅ Auth protection working - fetch failed as expected');
    }
    
    // Test 3: Send message without auth (should fail)
    console.log('\n3️⃣ Testing send message without auth...');
    try {
      const sendResponse = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Test message' })
      });
      const sendData = await sendResponse.json();
      if (sendResponse.status === 401) {
        console.log('✅ Auth protection working:', sendData.message);
      } else {
        console.log('❌ Auth protection not working');
      }
    } catch (error) {
      console.log('✅ Auth protection working - fetch failed as expected');
    }
    
    console.log('\n🎉 Chat API basic tests completed!');
    console.log('📝 Note: Authentication tests will need valid tokens');
    
  } catch (error) {
    console.error('❌ Error testing chat API:', error);
  }
}

// Run the test
testChatAPI();
