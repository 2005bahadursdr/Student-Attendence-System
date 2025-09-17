import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Students API
export const studentsAPI = {
  getAll: (params = {}) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  enroll: (studentId, classId) => api.post(`/students/${studentId}/enroll`, { classId }),
};

// Classes API
export const classesAPI = {
  getAll: (params = {}) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
    getStudents: async (classId) => {
    return await axios.get(`/api/classes/${classId}/students`);
  },
};



// Attendance API
export const attendanceAPI = {
  getAll: (params = {}) => api.get('/attendance', { params }),
  getByClassAndDate: (classId, date) => api.get(`/attendance/${classId}/${date}`),
  mark: (data) => api.post('/attendance', data),
  markBulk: (data) => api.post('/attendance/mark-bulk', data),
  getSummary: (params = {}) => api.get('/attendance/reports/summary', { params }),
   
};



// Health check
export const healthCheck = () => api.get('/health');

export default api;