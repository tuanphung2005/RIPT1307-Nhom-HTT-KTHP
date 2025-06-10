const axios = require('axios');

async function testNotificationAPI() {
  try {
    // Login as teacher
    console.log('Logging in as teacher...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'teacher@university.edu',
      password: 'teacher123'
    });
    
    console.log('Login response:', loginResponse.data);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.token;
    console.log('Token obtained successfully');
    
    // Get notifications
    console.log('\nFetching notifications...');
    const notificationsResponse = await axios.get('http://localhost:3001/api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Notifications response:', JSON.stringify(notificationsResponse.data, null, 2));
    
    // Get unread count
    console.log('\nFetching unread count...');
    const unreadResponse = await axios.get('http://localhost:3001/api/notifications/unread-count', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Unread count response:', JSON.stringify(unreadResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testNotificationAPI();
