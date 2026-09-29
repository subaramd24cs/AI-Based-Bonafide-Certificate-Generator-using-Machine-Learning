import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      } else {
        window.location.href = '/login'
      }
    }
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

export const applicationsAPI = {
  create: (data) => api.post('/applications', data),
  getMy: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  uploadDocument: (id, formData) => api.post(`/applications/${id}/document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

export const mlAPI = {
  predict: (data) => api.post('/ml/predict', data),
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllApplications: (params) => api.get('/admin/applications', { params }),
  getApplicationDetail: (id) => api.get(`/admin/applications/${id}`),
  approve: (id, data) => api.put(`/admin/applications/${id}/approve`, data),
  reject: (id, data) => api.put(`/admin/applications/${id}/reject`, data),
  getReportsMonthly: (params) => api.get('/admin/reports/monthly', { params }),
  getReportsDepartment: (params) => api.get('/admin/reports/department', { params }),
  getStudentDetails: (id) => api.get(`/admin/students/${id}`),
}

export const certificatesAPI = {
  generate: (applicationId) => api.post(`/certificates/generate/${applicationId}`),
  download: (id) => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
  verify: (id) => api.get(`/certificates/verify/${id}`),
  getByApplication: (applicationId) => api.get(`/certificates/application/${applicationId}`),
}

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

export default api
