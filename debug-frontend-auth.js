// Debug script to check frontend authentication status
console.log('=== FRONTEND AUTHENTICATION DEBUG ===');

// Check localStorage for forum tokens
const token = localStorage.getItem('forum_token');
const currentUser = localStorage.getItem('forum_current_user');

console.log('Forum Token:', token ? 'EXISTS' : 'NOT FOUND');
console.log('Current User:', currentUser ? JSON.parse(currentUser) : 'NOT FOUND');

// Check if we can make authenticated requests
if (token) {
  console.log('Testing notification API...');
  
  fetch('http://localhost:3001/api/notifications', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Notification API Response:', data);
  })
  .catch(error => {
    console.error('Notification API Error:', error);
  });
  
  // Test unread count
  fetch('http://localhost:3001/api/notifications/unread-count', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Unread Count API Response:', data);
  })
  .catch(error => {
    console.error('Unread Count API Error:', error);
  });
} else {
  console.log('❌ No token found - user needs to log in');
}
