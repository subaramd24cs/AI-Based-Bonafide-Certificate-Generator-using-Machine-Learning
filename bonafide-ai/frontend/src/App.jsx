import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'

import LandingPage from './pages/LandingPage'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/student/Dashboard'
import ApplyBonafide from './pages/student/ApplyBonafide'
import MyApplications from './pages/student/MyApplications'
import ApplicationDetails from './pages/student/ApplicationDetails'
import MyCertificates from './pages/student/MyCertificates'
import Profile from './pages/student/Profile'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminApplications from './pages/admin/AdminApplications'
import AdminApplicationDetail from './pages/admin/AdminApplicationDetail'
import AdminReports from './pages/admin/AdminReports'
import VerifyCertificate from './pages/certificates/VerifyCertificate'

function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth()
  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function AdminRoute({ children }) {
  const { token, isAdmin } = useAuth()
  if (!token || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#fff',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/apply" element={<ProtectedRoute><ApplyBonafide /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
        <Route path="/student/applications/:id" element={<ProtectedRoute><ApplicationDetails /></ProtectedRoute>} />
        <Route path="/student/certificates" element={<ProtectedRoute><MyCertificates /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
        <Route path="/admin/applications/:id" element={<AdminRoute><AdminApplicationDetail /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

        <Route path="/certificates/verify/:id" element={<VerifyCertificate />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
