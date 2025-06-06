
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://production.com/api' 
    : 'http://localhost:3001/api',
  
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
      DELETE: (id: string) => `/posts/${id}`,
      SEARCH: '/posts/search',
      VOTE: (id: string) => `/posts/${id}/vote`,
      COMMENTS: (id: string) => `/posts/${id}/comments`,
    },
    
    // Comments endpoints
    COMMENTS: {
      VOTE: (id: string) => `/comments/${id}/vote`,
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
