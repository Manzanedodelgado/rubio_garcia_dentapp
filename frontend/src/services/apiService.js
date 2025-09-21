import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 307) {
      console.warn('Redirect detected - this might cause infinite loops');
    } else if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('Network Error: Could not connect to backend');
    }
    
    return Promise.reject(error);
  }
);

// Appointments API
export const appointmentsAPI = {
  // Get all appointments with filters
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    // Add an explicit high limit to avoid server default truncation
    if (!queryParams.has('limit')) {
      queryParams.set('limit', '5000');
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/appointments/?${queryString}` : '/appointments/';
    
    console.log('Making API request to:', url);
    return apiClient.get(url, { timeout: 20000 }); // extend timeout for large payloads
  },

  // Get today's appointments
  getToday: () => apiClient.get('/appointments/today/'),

  // Get upcoming appointments
  getUpcoming: (days = 7) => apiClient.get(`/appointments/upcoming/?days=${days}`),

  // Get appointment statistics
  getStats: () => apiClient.get('/appointments/stats/'),

  // Trigger manual sync
  sync: () => apiClient.post('/appointments/sync/'),

  // Get sync status
  getSyncStatus: () => apiClient.get('/appointments/sync/status/'),
};

// General API
export const generalAPI = {
  // Health check
  health: () => apiClient.get('/health'),

  // Root endpoint
  root: () => apiClient.get('/'),
};

export default apiClient;