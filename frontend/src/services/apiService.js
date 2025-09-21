import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  timeout: 20000,
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
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    if (!queryParams.has('limit')) {
      queryParams.set('limit', '5000');
    }
    const queryString = queryParams.toString();
    const url = queryString ? `/appointments/?${queryString}` : '/appointments/';
    return apiClient.get(url);
  },
  getToday: () => apiClient.get('/appointments/today/'),
  getUpcoming: (days = 7) => apiClient.get(`/appointments/upcoming/?days=${days}`),
  getStats: () => apiClient.get('/appointments/stats/'),
  sync: () => apiClient.post('/appointments/sync/'),
  getSyncStatus: () => apiClient.get('/appointments/sync/status/'),
  updateStatus: (appointmentId, payload) => {
    const params = new URLSearchParams();
    if (payload?.status) params.set('new_status', payload.status);
    if (payload?.estado_cita) params.set('estado_cita_text', payload.estado_cita);
    return apiClient.post(`/appointments/${appointmentId}/status?${params.toString()}`);
  }
};

// Patients API
export const patientsAPI = {
  getAll: () => apiClient.get('/patients/'),
  create: (data) => apiClient.post('/patients/', data),
  update: (id, data) => apiClient.put(`/patients/${id}`, data),
};

// General API
export const generalAPI = {
  health: () => apiClient.get('/health'),
  root: () => apiClient.get('/'),
};

export default apiClient;