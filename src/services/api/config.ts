export const FORUM_CONFIG = {
  // API URLs
  API_BASE_URL: process.env.REACT_APP_FORUM_API_BASE_URL || 'http://localhost:3001/api',
  BACKEND_URL: process.env.REACT_APP_FORUM_BACKEND_URL || 'http://localhost:3001',
  FRONTEND_URL: process.env.REACT_APP_FORUM_FRONTEND_URL || 'http://localhost:8000',
  WS_URL: process.env.REACT_APP_FORUM_WS_URL || 'ws://localhost:3001',
  
  // Environment info
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

export const API_CONFIG = {
  BASE_URL: FORUM_CONFIG.API_BASE_URL,
  
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      ME: '/auth/me',
    },
      // Posts endpoints
    POSTS: {
      LIST: '/posts',
      CREATE: '/posts',
      GET_BY_ID: (id: string) => `/posts/${id}`,
      UPDATE: (id: string) => `/posts/${id}`,
      DELETE: (id: string) => `/posts/${id}`,
      SEARCH: '/posts/search',
      VOTE: (id: string) => `/posts/${id}/vote`,
      COMMENTS: (id: string) => `/posts/${id}/comments`,
    },
      // Comments endpoints
    COMMENTS: {
      VOTE: (id: string) => `/comments/${id}/vote`,
    },    // Users endpoints (admin only)
    USERS: {
      LIST: '/users',
      CREATE: '/users',
      UPDATE: (id: string) => `/users/${id}`,
      DELETE: (id: string) => `/users/${id}`,
      TOGGLE_STATUS: (id: string) => `/users/${id}/toggle-status`,
      RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
    },
    
    // Notifications endpoints
    NOTIFICATIONS: {
      LIST: '/notifications',
      UNREAD_COUNT: '/notifications/unread-count',
      MARK_READ: (id: string) => `/notifications/${id}/read`,
      MARK_ALL_READ: '/notifications/read-all',
    },
    
    // Health check
    HEALTH: '/health',
  },
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Request timeout
  TIMEOUT: 10000,
};

// Helper function to get full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('forum_token');
  return {
    ...API_CONFIG.HEADERS,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Development helper to log current configuration
export const logCurrentConfig = (): void => {
  if (FORUM_CONFIG.IS_DEVELOPMENT) {
    console.group('');
    console.log('', FORUM_CONFIG.API_BASE_URL);
    console.log('', FORUM_CONFIG.BACKEND_URL);
    console.log('', FORUM_CONFIG.FRONTEND_URL);
    console.log('', FORUM_CONFIG.WS_URL);
    console.log('', process.env.NODE_ENV);
    console.groupEnd();
  }
};

// Health check helper
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${FORUM_CONFIG.API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return false;
  }
};
